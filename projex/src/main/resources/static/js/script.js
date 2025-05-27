document.addEventListener('DOMContentLoaded', async () => {
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

    // Теперь все пользователи - менеджеры проектов
    // Кнопка создания проекта видна всем
    createProjectBtn.style.display = 'block';

    // Отображаем имя пользователя и аватар
    const usernameElement = document.querySelector('.main-nav__username');
    const avatarElement = document.querySelector('.main-nav__avatar');
    if (usernameElement && avatarElement) {
        usernameElement.textContent = currentUser.username;
        avatarElement.textContent = currentUser.username.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    // Загружаем проекты
    function loadProjects() {
        try {
            const projects = Storage.getProjects();

            // Очищаем таблицу
            projectsTableBody.innerHTML = '';

            if (projects.length === 0) {
                noProjectsMessage.style.display = 'block';
                return;
            }

            noProjectsMessage.style.display = 'none';

            projects.forEach(project => {
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
                    window.location.href = `/html/project-page.html?id=${project.id}`;
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
                name,
                status,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                managerId: currentUser.id,
                participants: [{
                    userId: currentUser.id,
                    role: 'PROJECT_MANAGER',
                    joinedAt: new Date().toISOString()
                }]
            };

            Storage.addProject(projectData);
            closeModal();
            loadProjects(); // Перезагружаем список проектов
        } catch (error) {
            console.error('Ошибка при создании проекта:', error);
            alert('Произошла ошибка при создании проекта');
        }
    });

    // Вспомогательные функции
    function getStatusText(status) {
        const statusMap = {
            'PLANNING': 'Планирование',
            'DEVELOPMENT': 'В разработке',
            'COMPLETED': 'Завершен'
        };
        return statusMap[status] || status;
    }

    function calculateProgress(project) {
        try {
            const tasks = Storage.getProjectTasks(project.id);
            if (tasks.length === 0) return 0;

            const completed = tasks.filter(t => t.status === 'COMPLETED').length;
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