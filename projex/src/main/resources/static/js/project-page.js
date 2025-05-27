document.addEventListener('DOMContentLoaded', function () {
    // Проверяем авторизацию
    const currentUser = Storage.getUser();
    if (!currentUser) {
        window.location.href = '/html/auth-page.html';
        return;
    }

    // Инициализируем тестовые данные
    Storage.initializeData();

    // Отображаем имя текущего пользователя
    const avatarElement = document.querySelector('.main-nav__avatar');
    const usernameElement = document.querySelector('.main-nav__username');
    if (avatarElement && usernameElement) {
        const initials = currentUser.username.split(' ')
            .map(n => n[0])
            .join('');
        avatarElement.textContent = initials;
        usernameElement.textContent = currentUser.username;
    }

    const createTaskBtn = document.getElementById('create-task-btn');
    const taskModal = document.getElementById('task-modal');
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
    let project;

    function loadProject() {
        try {
            project = Storage.getProject(projectId);
            if (!project) {
                throw new Error('Проект не найден');
            }
            updateProjectUI();
        } catch (error) {
            console.error('Ошибка загрузки проекта:', error);
            alert('Проект не найден');
            window.location.href = '/html/Index.html';
        }
    }

    function updateProjectUI() {
        try {
            // Обновляем заголовок и информацию о проекте
            const titleElement = document.querySelector('h1');
            if (titleElement) {
                titleElement.textContent = `Проект: ${project.name}`;
            }

            // Обновляем статус проекта
            const statusElement = document.querySelector('.status-dev');
            if (statusElement) {
                statusElement.textContent = project.status;
                statusElement.className = `status-${project.status.toLowerCase()}`;
            }

            // Обновляем дедлайн
            const deadlineElement = document.querySelector('.info-item:nth-child(2) .value');
            if (deadlineElement) {
                deadlineElement.textContent = formatDate(project.endDate);
            }

            // Обновляем прогресс
            updateProgress();

            // Обновляем список участников
            updateParticipantsList();
        } catch (error) {
            console.error('Ошибка при обновлении UI проекта:', error);
        }
    }

    function updateProgress() {
        const tasks = Storage.getProjectTasks(projectId);
        const progress = tasks.length > 0
            ? (tasks.filter(t => t.status === 'Завершена').length / tasks.length) * 100
            : 0;
        document.querySelector('.progress').style.width = `${progress}%`;
    }

    function updateParticipantsList() {
        const participantsList = document.querySelector('.participants-list');
        participantsList.innerHTML = '';

        const users = Storage.getUsers();
        project.participants.forEach(participantId => {
            const user = users.find(u => u.id === participantId);
            if (user) {
                const participantElement = document.createElement('div');
                participantElement.className = 'participant';
                participantElement.innerHTML = `
                    <span>${user.username}</span>
                    <button type="button" class="remove-participant" data-user-id="${user.id}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                participantsList.appendChild(participantElement);

                // Добавляем обработчик для кнопки удаления
                const removeBtn = participantElement.querySelector('.remove-participant');
                removeBtn.addEventListener('click', async () => {
                    if (confirm(`Вы уверены, что хотите удалить участника ${user.username} из проекта?`)) {
                        // Удаляем участника из списка
                        project.participants = project.participants.filter(id => id !== user.id);

                        // Обновляем проект в хранилище
                        Storage.updateProject(projectId, project);
                        await Logger.log(Logger.Actions.PARTICIPANT_REMOVE, `Удален участник ${user.username} из проекта ${project.name}`);

                        // Обновляем отображение списка участников
                        updateParticipantsList();

                        // Проверяем задачи этого участника
                        const tasks = Storage.getProjectTasks(projectId);
                        const userTasks = tasks.filter(t => t.assigneeId === user.id);

                        if (userTasks.length > 0) {
                            // Если у участника есть задачи, меняем их статус на "К выполнению" и убираем исполнителя
                            for (const task of userTasks) {
                                const updatedTask = {
                                    ...task,
                                    assigneeId: '',
                                    status: 'К выполнению'
                                };
                                Storage.updateTask(task.id, updatedTask);
                                await Logger.log(Logger.Actions.TASK_UPDATE,
                                    `Задача "${task.title}" переведена в статус "К выполнению" после удаления исполнителя`);
                            }
                            // Обновляем отображение задач
                            loadTasks();
                            updateProgress();
                        }
                    }
                });
            }
        });
    }

    // Загрузка задач проекта
    function loadTasks() {
        try {
            const tasks = Storage.getProjectTasks(projectId);
            tasksTableBody.innerHTML = '';

            if (tasks.length === 0) {
                tasksTableBody.innerHTML = '<tr><td colspan="5">Нет задач</td></tr>';
                return;
            }

            tasks.forEach(task => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${task.title}</td>
                    <td>${getAssigneeName(task.assigneeId)}</td>
                    <td><span class="status-${task.status.toLowerCase()}">${task.status}</span></td>
                    <td>${formatDate(task.deadline)}</td>
                    <td class="task-actions">
                        <button class="task-action-btn edit" data-task-id="${task.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-action-btn delete" data-task-id="${task.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tasksTableBody.appendChild(tr);

                // Добавляем обработчики для кнопок
                tr.querySelector('.task-action-btn.edit').addEventListener('click', () => showEditTaskModal(task));
                tr.querySelector('.task-action-btn.delete').addEventListener('click', () => deleteTask(task.id));
            });
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
            tasksTableBody.innerHTML = '<tr><td colspan="5">Ошибка при загрузке задач</td></tr>';
        }
    }

    // Функция получения имени исполнителя
    function getAssigneeName(assigneeId) {
        const users = Storage.getUsers();
        const user = users.find(u => u.id === assigneeId);
        return user ? user.username : 'Не назначен';
    }

    // Функция удаления задачи
    async function deleteTask(taskId) {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            try {
                const task = Storage.getTask(taskId);
                Storage.deleteTask(taskId);
                await Logger.log(Logger.Actions.TASK_DELETE, `Удалена задача: ${task.title}`);
                loadTasks();
                updateProgress();
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Не удалось удалить задачу');
            }
        }
    }

    // Обработка создания задачи
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const assigneeId = document.getElementById('task-assignee').value;
            const taskName = document.getElementById('task-name').value;

            if (!assigneeId) {
                alert('Пожалуйста, выберите исполнителя задачи');
                return;
            }

            // Если исполнитель не является участником проекта, добавляем его
            if (!project.participants.includes(assigneeId)) {
                project.participants.push(assigneeId);
                Storage.updateProject(projectId, project);
                await Logger.log(Logger.Actions.PARTICIPANT_ADD, `Добавлен участник ${assigneeId} в проект ${project.name}`);
            }

            const taskData = {
                id: Date.now().toString(),
                title: taskName,
                description: document.getElementById('task-description').value,
                assigneeId: assigneeId,
                priority: document.getElementById('task-priority').value,
                deadline: new Date(document.getElementById('task-deadline').value).toISOString(),
                projectId: projectId,
                status: 'К выполнению'
            };

            Storage.addTask(taskData);
            await Logger.log(Logger.Actions.TASK_CREATE, `Создана задача: ${taskName} в проекте ${project.name}`);
            closeModal();
            loadTasks();
            updateProgress();
            updateProjectUI();
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
            alert('Не удалось создать задачу: ' + error.message);
        }
    });

    // Функция редактирования задачи
    function showEditTaskModal(task) {
        const modal = document.createElement('div');
        modal.className = 'task-modal show';
        modal.innerHTML = `
            <div class="task-modal-overlay"></div>
            <div class="task-modal-content">
                <h2>Редактировать задачу</h2>
                <form id="edit-task-form">
                    <div class="form-group">
                        <label for="edit-task-title">Название задачи</label>
                        <input type="text" id="edit-task-title" value="${task.title}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-task-description">Описание</label>
                        <textarea id="edit-task-description">${task.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-task-assignee">Исполнитель</label>
                        <select id="edit-task-assignee" required>
                            ${Storage.getUsers()
                .filter(user => user.role === "DEVELOPER")
                .map(user => `
                                    <option value="${user.id}" ${user.id === task.assigneeId ? 'selected' : ''}>
                                        ${user.username}
                                    </option>
                                `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-task-status">Статус</label>
                        <select id="edit-task-status">
                            <option value="К выполнению" ${task.status === 'К выполнению' ? 'selected' : ''}>К выполнению</option>
                            <option value="В работе" ${task.status === 'В работе' ? 'selected' : ''}>В работе</option>
                            <option value="Завершена" ${task.status === 'Завершена' ? 'selected' : ''}>Завершена</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-task-priority">Приоритет</label>
                        <select id="edit-task-priority">
                            <option value="Низкий" ${task.priority === 'Низкий' ? 'selected' : ''}>Низкий</option>
                            <option value="Средний" ${task.priority === 'Средний' ? 'selected' : ''}>Средний</option>
                            <option value="Высокий" ${task.priority === 'Высокий' ? 'selected' : ''}>Высокий</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-task-deadline">Дедлайн</label>
                        <input type="date" id="edit-task-deadline" value="${task.deadline.split('T')[0]}" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel">Отменить</button>
                        <button type="submit" class="btn-save">Сохранить</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const form = modal.querySelector('#edit-task-form');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const modalOverlay = modal.querySelector('.task-modal-overlay');

        modalOverlay.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newAssigneeId = document.getElementById('edit-task-assignee').value;

            // Если новый исполнитель не является участником проекта, добавляем его
            if (!project.participants.includes(newAssigneeId)) {
                project.participants.push(newAssigneeId);
                Storage.updateProject(projectId, project);
                const newUser = Storage.getUsers().find(u => u.id === newAssigneeId);
                await Logger.log(Logger.Actions.PARTICIPANT_ADD,
                    `Добавлен участник ${newUser ? newUser.username : newAssigneeId} в проект ${project.name}`);
            }

            const updatedTask = {
                ...task,
                title: document.getElementById('edit-task-title').value,
                description: document.getElementById('edit-task-description').value,
                assigneeId: newAssigneeId,
                status: document.getElementById('edit-task-status').value,
                priority: document.getElementById('edit-task-priority').value,
                deadline: new Date(document.getElementById('edit-task-deadline').value).toISOString()
            };

            try {
                Storage.updateTask(task.id, updatedTask);
                await Logger.log(Logger.Actions.TASK_UPDATE,
                    `Обновлена задача "${updatedTask.title}" (статус: ${updatedTask.status}, приоритет: ${updatedTask.priority})`);
                document.body.removeChild(modal);
                loadTasks();
                updateProgress();
                updateProjectUI();
            } catch (error) {
                console.error('Ошибка при обновлении задачи:', error);
                alert('Не удалось обновить задачу');
            }
        });
    }

    // Функция форматирования даты
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU');
    }

    // Функция закрытия модального окна
    function closeModal() {
        taskModal.style.display = 'none';
        modalOverlay.style.display = 'none';
        taskForm.reset();
    }

    // Обработчики событий
    createTaskBtn.addEventListener('click', () => {
        // Заполняем список исполнителей
        const assigneeSelect = document.getElementById('task-assignee');
        assigneeSelect.innerHTML = '<option value="" disabled selected>Выберите исполнителя</option>';

        const users = Storage.getUsers();
        const developers = users.filter(user => user.role === "DEVELOPER");
        developers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            assigneeSelect.appendChild(option);
        });

        taskModal.style.display = 'block';
        modalOverlay.style.display = 'block';
    });

    cancelBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Обработчики для кнопок редактирования и удаления проекта
    document.querySelector('.edit-project-btn').addEventListener('click', showEditProjectModal);
    document.querySelector('.delete-project-btn').addEventListener('click', deleteProject);

    // Функция удаления проекта
    async function deleteProject() {
        if (confirm('Вы уверены, что хотите удалить этот проект?')) {
            try {
                await Logger.log(Logger.Actions.PROJECT_DELETE, `Удален проект: ${project.name}`);
                Storage.deleteProject(projectId);
                window.location.href = '/html/Index.html';
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Не удалось удалить проект');
            }
        }
    }

    // Функция показа модального окна редактирования проекта
    function showEditProjectModal() {
        const modal = document.createElement('div');
        modal.className = 'task-modal show';
        modal.innerHTML = `
            <div class="task-modal-overlay"></div>
            <div class="task-modal-content">
                <h2>Редактировать проект</h2>
                <form id="edit-project-form">
                    <div class="form-group">
                        <label for="edit-project-name">Название проекта</label>
                        <input type="text" id="edit-project-name" value="${project.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-project-status">Статус</label>
                        <select id="edit-project-status">
                            <option value="Планирование">Планирование</option>
                            <option value="В разработке">В разработке</option>
                            <option value="Завершен">Завершен</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-project-end-date">Дедлайн</label>
                        <input type="date" id="edit-project-end-date" value="${project.endDate.split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label>Участники проекта</label>
                        <div id="edit-project-participants">
                            ${project.participants.map(participantId => {
            const user = Storage.getUsers().find(u => u.id === participantId);
            return user ? `
                                    <div class="participant">
                                        <span>${user.username}</span>
                                        <button type="button" class="remove-participant" data-user-id="${user.id}">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                ` : '';
        }).join('')}
                        </div>
                        <button type="button" class="add-participant-btn">
                            <i class="fas fa-user-plus"></i>
                            Добавить участника
                        </button>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel">Отменить</button>
                        <button type="submit" class="btn-save">Сохранить</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Обработчики для модального окна
        const form = modal.querySelector('#edit-project-form');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const addParticipantBtn = modal.querySelector('.add-participant-btn');
        const participantsContainer = modal.querySelector('#edit-project-participants');
        const modalOverlay = modal.querySelector('.task-modal-overlay');

        // Обработчик клика по оверлею
        modalOverlay.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Обработчик добавления участника
        addParticipantBtn.addEventListener('click', () => {
            const users = Storage.getUsers();
            const availableUsers = users.filter(user =>
                !project.participants.includes(user.id) && user.role === "DEVELOPER"
            );

            if (availableUsers.length === 0) {
                alert('Нет доступных пользователей для добавления');
                return;
            }

            const select = document.createElement('select');
            select.className = 'form-control';
            availableUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.username;
                select.appendChild(option);
            });

            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'btn-save';
            addButton.textContent = 'Добавить';
            addButton.onclick = () => {
                const userId = select.value;
                if (userId && !project.participants.includes(userId)) {
                    project.participants.push(userId);
                    const user = users.find(u => u.id === userId);
                    const participantElement = document.createElement('div');
                    participantElement.className = 'participant';
                    participantElement.innerHTML = `
                        <span>${user.username}</span>
                        <button type="button" class="remove-participant" data-user-id="${user.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    participantsContainer.appendChild(participantElement);
                    select.remove();
                    addButton.remove();
                }
            };

            const container = document.createElement('div');
            container.className = 'add-participant-container';
            container.appendChild(select);
            container.appendChild(addButton);
            participantsContainer.appendChild(container);
        });

        // Обработчик удаления участника
        participantsContainer.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-participant');
            if (removeBtn) {
                const userId = removeBtn.dataset.userId;
                project.participants = project.participants.filter(id => id !== userId);
                removeBtn.closest('.participant').remove();
            }
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const updatedProject = {
                ...project,
                name: document.getElementById('edit-project-name').value,
                status: document.getElementById('edit-project-status').value,
                endDate: new Date(document.getElementById('edit-project-end-date').value).toISOString(),
                participants: project.participants
            };

            try {
                Storage.updateProject(projectId, updatedProject);
                await Logger.log(Logger.Actions.PROJECT_UPDATE,
                    `Обновлен проект "${updatedProject.name}" (статус: ${updatedProject.status})`);
                project = Storage.getProject(projectId);
                updateProjectUI();
                document.body.removeChild(modal);
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Не удалось обновить проект');
            }
        });
    }

    // Инициализация
    loadProject();
    loadTasks();
});