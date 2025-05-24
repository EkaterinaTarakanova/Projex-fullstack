// Массив для хранения задач
let tasks = [];

// Текущий пользователь
let currentUser = null;

// Текущая задача для добавления комментария
let currentTaskId = null;

// Текущие фильтры
let currentTaskType = 'all'; // 'all' или 'personal'
let currentTaskStatus = 'all'; // 'all', 'active' или 'completed'

// DOM элементы
const tasksList = document.getElementById('tasks-list');
const commentModal = document.getElementById('comment-modal');
const overlay = document.getElementById('overlay');
const commentText = document.getElementById('comment-text');
const addCommentBtn = document.getElementById('add-comment');
const cancelCommentBtn = document.getElementById('cancel-comment');
const filterButtons = document.querySelectorAll('.filter-btn');
const taskTypeButtons = document.querySelectorAll('.task-type-btn');
const projectSelector = document.querySelector('.project-selector');
const projectName = document.querySelector('.project-name');
const projectsDropdown = document.getElementById('projects-dropdown');

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем данные при первом запуске
    Storage.initializeData();

    // Проверяем авторизацию
    currentUser = Storage.getUser();
    if (!currentUser) {
        window.location.href = '/html/auth-page.html';
        return;
    }

    // Обновляем UI пользователя
    const usernameElement = document.querySelector('.main-nav__username');
    const avatarElement = document.querySelector('.main-nav__avatar');
    if (usernameElement && avatarElement) {
        usernameElement.textContent = currentUser.name;
        avatarElement.textContent = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    // Получаем ID проекта из URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (projectId) {
        // Если указан конкретный проект
        const project = Storage.getProjects().find(p => String(p.id) === String(projectId));
        if (!project) {
            alert('Проект не найден');
            window.location.href = '/html/Index.html';
            return;
        }

        // Проверяем права доступа
        const userParticipant = project.participants.find(p => p.userId === currentUser.id);
        if (!userParticipant) {
            alert('У вас нет доступа к этому проекту');
            window.location.href = '/html/Index.html';
            return;
        }

        // Обновляем навигацию
        const navLinks = document.querySelector('.main-nav__links');
        navLinks.innerHTML = `
            <a href="/html/Index.html" class="main-nav__link">Проекты</a>
            <a href="#" class="main-nav__link active">${project.name} - Задачи</a>
        `;

        // Показываем название проекта
        if (projectName) {
            projectName.textContent = project.name;
        }
        
        // Загружаем задачи проекта
        tasks = Storage.getTasks().filter(t => String(t.projectId) === String(projectId));
    } else {
        // Если проект не указан, показываем все задачи пользователя
        // Обновляем навигацию для общего списка задач
        const navLinks = document.querySelector('.main-nav__links');
        navLinks.innerHTML = `
            <a href="/html/Index.html" class="main-nav__link">Проекты</a>
            <a href="#" class="main-nav__link active">Мои задачи</a>
        `;

        if (projectName) {
            projectName.textContent = 'Все мои задачи';
        }
        
        // Получаем все проекты пользователя
        const userProjects = Storage.getProjects().filter(project => 
            project.participants.some(p => p.userId === currentUser.id)
        );
        
        // Получаем все задачи из проектов пользователя
        tasks = Storage.getTasks().filter(task => 
            userProjects.some(project => project.id === task.projectId) &&
            task.assignedTo.includes(currentUser.id)
        );
    }

    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Отображаем задачи
    renderTasks();
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчики для модального окна комментариев
    if (cancelCommentBtn) {
        cancelCommentBtn.addEventListener('click', closeModal);
    }
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (addCommentBtn) {
        addCommentBtn.addEventListener('click', () => {
            if (commentText && commentText.value.trim() !== '') {
                addComment(currentTaskId, commentText.value);
                closeModal();
            }
        });
    }

    // Обработчики для фильтров по статусу
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTaskStatus = button.dataset.filter;
            applyFilters();
        });
    });
    
    // Обработчики для фильтров по типу задачи (все/личные)
    taskTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            taskTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTaskType = button.dataset.type;
            applyFilters();
        });
    });
    
    // Обработчик для выпадающего списка проектов
    projectSelector.addEventListener('click', () => {
        projectsDropdown.style.display = projectsDropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    // Закрытие выпадающего списка при клике вне его
    document.addEventListener('click', (e) => {
        if (!projectSelector.contains(e.target)) {
            projectsDropdown.style.display = 'none';
        }
    });
    
    // Выбор проекта из выпадающего списка
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            document.getElementById('project-name').textContent = item.textContent;
            document.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            projectsDropdown.style.display = 'none';
        });
    });
}

// Применение всех фильтров
function applyFilters() {
    let filteredTasks = [...tasks];
    
    // Фильтр по типу задачи (все/личные)
    if (currentTaskType === 'personal') {
        filteredTasks = filteredTasks.filter(task => task.isPersonal);
    }
    
    // Фильтр по статусу
    if (currentTaskStatus === 'active') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (currentTaskStatus === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }
    
    renderTasks(filteredTasks);
}

// Отрисовка списка задач
function renderTasks(filteredTasks = tasks) {
    if (!tasksList) return;
    
    tasksList.innerHTML = '';
    
    if (!filteredTasks || filteredTasks.length === 0) {
        tasksList.innerHTML = '<div class="no-tasks">Нет доступных задач</div>';
        return;
    }
    
    filteredTasks.forEach(task => {
        if (!task) return;
        
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        
        // Определяем статус и класс для статуса
        const statusClass = getStatusClass(task.status);
        const statusText = getStatusText(task.status);
        
        taskElement.innerHTML = `
            <div class="task-name">
                <input type="checkbox" class="task-checkbox ${task.isPersonal ? '' : 'disabled'}" 
                    data-id="${task.id}" ${task.completed ? 'checked' : ''} 
                    ${task.isPersonal ? '' : 'disabled'}>
                <div>
                    <span>${task.name}</span>
                    <div class="task-owner">Владелец: ${task.owner}</div>
                </div>
            </div>
            <div class="task-status">
                <span class="${statusClass}">${statusText}</span>
            </div>
            <div class="task-deadline">${formatDate(task.deadline)}</div>
            <div class="task-comments">
                <div class="comments-count" data-id="${task.id}">
                    ${task.comments ? task.comments.length : 0} комментариев
                </div>
                <button class="add-comment-btn" data-id="${task.id}">+ Добавить</button>
            </div>
        `;
        
        tasksList.appendChild(taskElement);
        
        // Добавляем секцию комментариев, если они есть и видимы
        if (task.comments && task.comments.length > 0 && task.commentsVisible) {
            const commentsSection = document.createElement('div');
            commentsSection.className = 'comments-section';
            
            let commentsHTML = task.comments.map(comment => `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author}</span>
                        <span class="comment-date">${comment.date}</span>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                </div>
            `).join('');
            
            commentsSection.innerHTML = commentsHTML;
            tasksList.appendChild(commentsSection);
        }
    });
    
    // Добавляем обработчики событий
    addTaskEventListeners();
}

// Добавление обработчиков событий для задач
function addTaskEventListeners() {
    // Обработчики для чекбоксов
    document.querySelectorAll('.task-checkbox:not(.disabled)').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = parseInt(e.target.dataset.id);
            toggleTaskCompletion(taskId);
        });
    });
    
    // Обработчики для кнопок добавления комментариев
    document.querySelectorAll('.add-comment-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = parseInt(e.target.dataset.id);
            openAddCommentModal(taskId);
        });
    });
    
    // Обработчики для счетчиков комментариев
    document.querySelectorAll('.comments-count').forEach(counter => {
        counter.addEventListener('click', (e) => {
            const taskId = parseInt(e.target.dataset.id);
            toggleComments(taskId);
        });
    });
}

// Получение класса для статуса
function getStatusClass(status) {
    const statusClasses = {
        'todo': 'status-planning',
        'in_progress': 'status-in-progress',
        'completed': 'status-completed',
        'planning': 'status-planning'
    };
    return statusClasses[status] || 'status-planning';
}

// Переключение статуса выполнения задачи
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.isPersonal) {
        task.completed = !task.completed;
        
        if (task.completed) {
            task.status = 'completed';
            task.statusClass = 'status-completed';
        } else {
            task.status = 'in_progress';
            task.statusClass = 'status-in-progress';
        }
        
        // Сохраняем изменения
        Storage.setTasks(tasks);
        
        // Применяем текущие фильтры
        applyFilters();
    }
}

// Переключение видимости комментариев
function toggleComments(taskId) {
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.comments && task.comments.length > 0) {
        task.commentsVisible = !task.commentsVisible;
        
        // Применяем текущие фильтры
        applyFilters();
    }
}

// Открытие модального окна для добавления комментария
function openAddCommentModal(taskId) {
    currentTaskId = taskId;
    const modal = document.getElementById('comment-modal');
    const overlay = document.getElementById('overlay');
    const textarea = document.getElementById('comment-text');
    
    if (modal) {
        modal.style.display = 'flex';
    }
    if (overlay) {
        overlay.style.display = 'block';
    }
    if (textarea) {
        textarea.value = '';
        textarea.focus();
    }
}

// Закрытие модальных окон
function closeModal() {
    const modal = document.getElementById('comment-modal');
    const overlay = document.getElementById('overlay');
    
    if (modal) {
        modal.style.display = 'none';
    }
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Добавление комментария
function addComment(taskId, text) {
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())} ${padZero(now.getHours())}:${padZero(now.getMinutes())}`;
        
        if (!task.comments) {
            task.comments = [];
        }
        
        task.comments.push({
            author: currentUser.name,
            date: formattedDate,
            text: text
        });
        
        // Показываем комментарии после добавления нового
        task.commentsVisible = true;
        
        // Сохраняем изменения
        Storage.setTasks(tasks);
        
        // Применяем текущие фильтры
        applyFilters();
    }
}

// Добавление ведущего нуля для чисел меньше 10
function padZero(num) {
    return num < 10 ? `0${num}` : num;
}

// Вспомогательные функции
function getStatusText(status) {
    const statusMap = {
        'todo': 'К выполнению',
        'in_progress': 'В процессе',
        'completed': 'Завершен',
        'planning': 'Планирование'
    };
    return statusMap[status] || status;
}

function getPriorityText(priority) {
    const priorityMap = {
        'low': 'Низкий',
        'medium': 'Средний',
        'high': 'Высокий'
    };
    return priorityMap[priority] || priority;
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    } catch (error) {
        return dateString;
    }
}

// Закрытие модального окна при клике на оверлей
document.addEventListener('DOMContentLoaded', () => {
    const taskModalOverlay = document.querySelector('.task-modal-overlay');
    if (taskModalOverlay) {
        taskModalOverlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-modal-overlay')) {
                const taskDetailsModal = document.getElementById('taskDetailsModal');
                if (taskDetailsModal) {
                    taskDetailsModal.style.display = 'none';
                }
            }
        });
    }
});