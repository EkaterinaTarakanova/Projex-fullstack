document.addEventListener('DOMContentLoaded', function () {
    // Проверяем авторизацию
    const currentUser = Storage.getUser();
    if (!currentUser) {
        window.location.href = '/html/auth-page.html';
        return;
    }

    // Обновляем информацию в шапке
    document.querySelector('.main-nav__username').textContent = currentUser.username;
    document.querySelector('.main-nav__avatar').textContent =
        currentUser.username.split(' ').map(n => n[0]).join('').toUpperCase();

    // Обновляем профиль пользователя
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileName = document.querySelector('.profile-name');
    const profileRole = document.querySelector('.profile-role');
    const profileEmail = document.getElementById('profile-email');
    const profileSystemRole = document.getElementById('profile-system-role');
    const profileRegistrationDate = document.getElementById('profile-registration-date');

    // Устанавливаем основную информацию
    profileAvatar.textContent = currentUser.username.split(' ').map(n => n[0]).join('').toUpperCase();
    profileName.textContent = currentUser.username;
    // Все пользователи теперь менеджеры проектов
    profileRole.textContent = 'Менеджер проекта';
    profileEmail.textContent = currentUser.email;
    profileSystemRole.textContent = 'Менеджер проекта';

    // Используем текущую дату, если дата регистрации не указана
    const registrationDate = currentUser.registrationDate ? new Date(currentUser.registrationDate) : new Date();
    profileRegistrationDate.textContent = registrationDate.toLocaleDateString('ru-RU');

    // Загружаем статистику
    loadStatistics();

    // Загружаем последние проекты
    loadRecentProjects();

    // Загружаем текущие задачи
    loadCurrentTasks();
});

function loadStatistics() {
    const currentUser = Storage.getUser();
    const projects = Storage.getProjects();
    const tasks = Storage.getTasks();

    // Считаем проекты пользователя
    const userProjects = projects.filter(project =>
        project.participants.some(p => p.userId === currentUser.id)
    );
    document.getElementById('projects-count').textContent = userProjects.length;

    // Считаем активные задачи
    const activeTasks = tasks.filter(task =>
        task.assigneeId === currentUser.id && task.status !== 'completed'
    );
    document.getElementById('tasks-count').textContent = activeTasks.length;

    // Считаем выполненные задачи
    const completedTasks = tasks.filter(task =>
        task.assigneeId === currentUser.id && task.status === 'completed'
    );
    document.getElementById('completed-tasks-count').textContent = completedTasks.length;
}

function loadRecentProjects() {
    const currentUser = Storage.getUser();
    const projects = Storage.getProjects();
    const recentProjectsContainer = document.getElementById('recent-projects');

    // Получаем проекты пользователя и сортируем их по дате создания
    const userProjects = projects
        .filter(project => project.participants.some(p => p.userId === currentUser.id))
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        .slice(0, 5); // Берем только 5 последних проектов

    if (userProjects.length === 0) {
        recentProjectsContainer.innerHTML = '<p class="no-data">Нет проектов</p>';
        return;
    }

    recentProjectsContainer.innerHTML = userProjects.map(project => `
        <div class="project-card" onclick="window.location.href='/html/project-page.html?id=${project.id}'">
            <div class="project-info">
                <div class="project-title">${project.name}</div>
                <div class="project-meta">
                    Дедлайн: ${new Date(project.endDate).toLocaleDateString('ru-RU')}
                </div>
            </div>
            <span class="project-status status-${project.status}">${getStatusText(project.status)}</span>
        </div>
    `).join('');
}

function loadCurrentTasks() {
    const currentUser = Storage.getUser();
    const tasks = Storage.getTasks();
    const currentTasksContainer = document.getElementById('current-tasks');

    // Получаем активные задачи пользователя и сортируем их по дедлайну
    const userTasks = tasks
        .filter(task => task.assigneeId === currentUser.id && task.status !== 'completed')
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5); // Берем только 5 ближайших задач

    if (userTasks.length === 0) {
        currentTasksContainer.innerHTML = '<p class="no-data">Нет активных задач</p>';
        return;
    }

    currentTasksContainer.innerHTML = userTasks.map(task => `
        <div class="task-card" onclick="window.location.href='/html/project-tasks.html?id=${task.projectId}'">
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    Дедлайн: ${new Date(task.deadline).toLocaleDateString('ru-RU')}
                </div>
            </div>
            <span class="task-status status-${task.status}">${getStatusText(task.status)}</span>
        </div>
    `).join('');
}

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