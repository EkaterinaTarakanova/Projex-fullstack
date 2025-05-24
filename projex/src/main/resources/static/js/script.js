document.addEventListener('DOMContentLoaded', () => {
    // Проверяем авторизацию
    const currentUser = Storage.getUser();
    if (!currentUser) {
        window.location.href = '/html/auth-page.html';
        return;
    }

    // Обновляем UI в зависимости от роли и получаем ссылки на элементы
    const createProjectBtn = document.getElementById('createProjectBtn');
    const modal = document.getElementById('createProjectModal');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const projectsTableBody = document.getElementById('projectsTableBody');
    const noProjectsMessage = document.getElementById('noProjectsMessage');
    
    // Настраиваем навигацию в зависимости от роли
    const navLinks = document.querySelector('.main-nav__links');
    if (currentUser.role === 'manager') {
        // Для менеджера показываем только проекты
        navLinks.innerHTML = `
            <a href="Index.html" class="main-nav__link active">Проекты</a>
        `;
    } else {
        // Для участника показываем проекты и задачи
        navLinks.innerHTML = `
            <a href="Index.html" class="main-nav__link active">Проекты</a>
            <a href="project-tasks.html" class="main-nav__link">Мои задачи</a>
        `;
    }
    
    // Скрываем кнопку создания проекта для не-менеджеров
    if (currentUser.role !== 'manager') {
        createProjectBtn.style.display = 'none';
    }

    // Отображаем имя пользователя и аватар
    const usernameElement = document.querySelector('.main-nav__username');
    const avatarElement = document.querySelector('.main-nav__avatar');
    if (usernameElement && avatarElement) {
        usernameElement.textContent = currentUser.name;
        avatarElement.textContent = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    // Загружаем проекты
    function loadProjects() {
        try {
            const projects = Storage.getProjects();
            const filteredProjects = currentUser.role === 'manager' 
                ? projects.filter(p => p.managerId === currentUser.id)
                : projects.filter(p => p.participants.some(part => part.userId === currentUser.id));

            // Очищаем таблицу
            projectsTableBody.innerHTML = '';

            if (filteredProjects.length === 0) {
                noProjectsMessage.style.display = 'block';
                return;
            }

            noProjectsMessage.style.display = 'none';

            filteredProjects.forEach(project => {
                const tr = document.createElement('tr');
                tr.dataset.status = project.status;
                tr.innerHTML = `
                    <td>${project.name}</td>
                    <td><span class="status status-${project.status}">${getStatusText(project.status)}</span></td>
                    <td>${formatDate(project.endDate)}</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-indicator" style="width: ${calculateProgress(project)}%"></div>
                        </div>
                    </td>
                `;
                tr.addEventListener('click', () => {
                    // Определяем URL в зависимости от роли пользователя
                    const targetUrl = currentUser.role === 'manager' 
                        ? `/html/project-page.html?id=${project.id}`
                        : `/html/project-tasks.html?id=${project.id}`;
                    window.location.href = targetUrl;
                });
                projectsTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Ошибка при загрузке проектов:', error);
            noProjectsMessage.textContent = 'Произошла ошибка при загрузке проектов';
            noProjectsMessage.style.display = 'block';
        }
    }

    // Обработка создания проекта
    const createProjectForm = document.getElementById('createProjectForm');
    createProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();

        try {
            const name = document.getElementById('projectName').value.trim();
            const status = document.getElementById('projectStatus').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;

            if (!name || !startDate || !endDate) {
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }

            if (new Date(endDate) < new Date(startDate)) {
                alert('Дата окончания не может быть раньше даты начала');
                return;
            }

            const projectData = {
                id: String(Date.now()),
                name,
                status,
                startDate,
                endDate,
                managerId: currentUser.id,
                participants: [
                    {
                        userId: currentUser.id,
                        role: 'manager',
                        joinedAt: new Date().toISOString()
                    }
                ]
            };

            Storage.addProject(projectData);
            closeModal();
            loadProjects();
        } catch (error) {
            console.error('Ошибка при создании проекта:', error);
            alert('Произошла ошибка при создании проекта');
        }
    });

    // Вспомогательные функции
    function getStatusText(status) {
        const statusMap = {
            'planning': 'Планирование',
            'development': 'В разработке',
            'completed': 'Завершен'
        };
        return statusMap[status] || status;
    }

    function calculateProgress(project) {
        try {
            const tasks = Storage.getTasks().filter(t => t.projectId === project.id);
            if (tasks.length === 0) return 0;
            
            const completed = tasks.filter(t => t.status === 'completed').length;
            return Math.round((completed / tasks.length) * 100);
        } catch (error) {
            console.error('Ошибка при расчете прогресса:', error);
            return 0;
        }
    }

    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU');
        } catch (error) {
            return dateString;
        }
    }

    // Обработка модального окна
    function closeModal() {
        modal.style.display = 'none';
        createProjectForm.reset();
    }

    createProjectBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    cancelBtn.addEventListener('click', closeModal);

    // Закрытие модального окна при клике на оверлей
    modal.querySelector('.task-modal-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('task-modal-overlay')) {
            closeModal();
        }
    });

    // Инициализация
    loadProjects();

    // Обработка фильтрации по статусу
    const statusFilter = document.querySelector('.custom-select');
    const statusTrigger = statusFilter.querySelector('.select-trigger');
    const statusDropdown = statusFilter.querySelector('.select-dropdown');
    const statusOptions = statusFilter.querySelectorAll('.select-option');

    statusTrigger.addEventListener('click', () => {
        statusDropdown.classList.toggle('active');
    });

    statusOptions.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.dataset.value;
            statusTrigger.querySelector('span').textContent = option.textContent;
            statusOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            statusDropdown.classList.remove('active');

            // Фильтрация проектов
            const rows = projectsTableBody.querySelectorAll('tr');
            let visibleCount = 0;

            rows.forEach(row => {
                if (value === 'all' || row.dataset.status === value) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            // Показываем сообщение, если нет проектов
            noProjectsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        });
    });

    // Закрытие дропдауна при клике вне него
    document.addEventListener('click', (e) => {
        if (!statusFilter.contains(e.target)) {
            statusDropdown.classList.remove('active');
        }
    });
});