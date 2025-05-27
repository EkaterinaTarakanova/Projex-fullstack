document.addEventListener('DOMContentLoaded', function () {
    // Проверяем авторизацию
    const currentUser = Storage.getUser();
    if (!currentUser) {
        window.location.href = '/html/auth-page.html';
        return;
    }

    const createTaskBtn = document.getElementById('create-task-btn');
    const modal = document.getElementById('task-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const cancelBtn = document.getElementById('cancel-btn');
    const taskForm = document.getElementById('task-form');
    const tasksTableBody = document.getElementById('tasks-tbody');

    // Получаем ID проекта из URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    // Если ID не найден, перенаправляем на главную
    if (!projectId) {
        window.location.href = '/html/Index.html';
        return;
    }

    // Загружаем данные проекта
    const project = Storage.getProjects().find(p => String(p.id) === String(projectId));

    // Если проект не найден, перенаправляем на главную
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

    // Обновляем UI в зависимости от роли
    if (currentUser.role !== 'manager') {
        createTaskBtn.style.display = 'none';
        document.querySelector('.role-toggle').style.display = 'none';
    }

    // Обновляем информацию о пользователе
    document.querySelector('.main-nav__username').textContent = currentUser.name;
    document.querySelector('.main-nav__avatar').textContent = 
        currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();

    // Обновляем навигацию
    const navLinks = document.querySelector('.main-nav__links');
    if (currentUser.role === 'manager') {
        navLinks.innerHTML = `
            <a href="#" class="main-nav__link active">${project.name}</a>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="/html/project-tasks.html?id=${project.id}" class="main-nav__link">${project.name} - Задачи</a>
        `;
    }

    // Обновляем заголовок и информацию о проекте
    document.querySelector('h1').textContent = `Проект: ${project.name}`;
    
    // Обновляем статус проекта
    const statusElement = document.querySelector('.status-dev');
    statusElement.textContent = getStatusText(project.status);
    statusElement.className = `status-${project.status}`;

    // Обновляем дедлайн
    document.querySelector('.info-item:nth-child(2) .value').textContent = 
        formatDate(project.endDate);

    // Загружаем задачи проекта и обновляем прогресс
    function loadTasks() {
        const tasks = Storage.getTasks().filter(t => t.projectId === projectId);
        tasksTableBody.innerHTML = '';

        if (tasks.length > 0) {
            tasks.forEach(task => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${task.title}</td>
                    <td>${getUserName(task.assigneeId)}</td>
                    <td><span class="status-${task.status}">${getStatusText(task.status)}</span></td>
                    <td>${formatDate(task.deadline)}</td>
                `;
                tasksTableBody.appendChild(tr);
            });

            // Обновляем прогресс
            const completed = tasks.filter(t => t.status === 'completed').length;
            const progress = Math.round((completed / tasks.length) * 100);
            document.querySelector('.progress').style.width = `${progress}%`;
        } else {
            tasksTableBody.innerHTML = '<tr><td colspan="4">Нет задач</td></tr>';
            document.querySelector('.progress').style.width = '0%';
        }
    }

    // Обновляем список участников
    function loadParticipants() {
        const participantsList = document.querySelector('.participants-list');
        participantsList.innerHTML = '';

        project.participants.forEach(participant => {
            const user = Storage.getUsers().find(u => u.id === participant.userId);
            if (user) {
                const div = document.createElement('div');
                div.className = 'participant';
                div.innerHTML = `
                    <div class="avatar">${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                    <div class="participant-info">
                        <div class="name">${user.name}</div>
                        <div class="role">${participant.role === 'manager' ? 'Менеджер проекта' : 'Участник проекта'}</div>
                    </div>
                `;
                participantsList.appendChild(div);
            }
        });
    }

    // Обработка создания задачи
    taskForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const taskData = {
            id: Date.now().toString(),
            projectId: projectId,
            title: document.getElementById('task-name').value.trim(),
            description: document.getElementById('task-description').value.trim(),
            assigneeId: document.getElementById('task-assignee').value,
            status: 'todo',
            priority: document.getElementById('task-priority').value.toLowerCase(),
            createdAt: new Date().toISOString(),
            deadline: document.getElementById('task-deadline').value,
            createdBy: currentUser.id
        };

        // Сохраняем задачу
        const tasks = Storage.getTasks();
        tasks.push(taskData);
        Storage.setTasks(tasks);

        // Обновляем UI
        loadTasks();
        closeModal();
    });

    // Вспомогательные функции
    function getStatusText(status) {
        const statusMap = {
            'planning': 'Планирование',
            'development': 'В разработке',
            'completed': 'Завершен',
            'todo': 'К выполнению',
            'in_progress': 'В работе'
        };
        return statusMap[status] || status;
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU');
    }

    function getUserName(userId) {
        const user = Storage.getUsers().find(u => u.id === userId);
        return user ? user.name : 'Неизвестный пользователь';
    }

    function closeModal() {
        modal.style.display = 'none';
        modalOverlay.style.display = 'none';
        taskForm.reset();
    }

    // Обработчики событий
    createTaskBtn.addEventListener('click', () => {
        // Заполняем список исполнителей
        const assigneeSelect = document.getElementById('task-assignee');
        assigneeSelect.innerHTML = '<option value="" disabled selected>Выберите исполнителя</option>';
        
        project.participants.forEach(participant => {
            const user = Storage.getUsers().find(u => u.id === participant.userId);
            if (user) {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                assigneeSelect.appendChild(option);
            }
        });

        modal.style.display = 'block';
        modalOverlay.style.display = 'block';

        // Устанавливаем дедлайн по умолчанию на завтра
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('task-deadline').valueAsDate = tomorrow;
    });

    cancelBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Инициализация
    loadTasks();
    loadParticipants();
});