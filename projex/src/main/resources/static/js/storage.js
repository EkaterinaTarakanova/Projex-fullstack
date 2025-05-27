class Storage {
    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    static removeUser() {
        localStorage.removeItem('user');
    }

    // Projects
    static getProjects() {
        const projects = localStorage.getItem('projects');
        return projects ? JSON.parse(projects) : [];
    }

    static addProject(project) {
        const projects = this.getProjects();
        project.id = Date.now().toString(); // Генерируем уникальный ID
        projects.push(project);
        localStorage.setItem('projects', JSON.stringify(projects));
        return project;
    }

    static updateProject(projectId, updatedProject) {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            projects[index] = { ...projects[index], ...updatedProject };
            localStorage.setItem('projects', JSON.stringify(projects));
            return projects[index];
        }
        return null;
    }

    static deleteProject(projectId) {
        const projects = this.getProjects();
        const filteredProjects = projects.filter(p => p.id !== projectId);
        localStorage.setItem('projects', JSON.stringify(filteredProjects));
        // Удаляем также все задачи этого проекта
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(t => t.projectId !== projectId);
        localStorage.setItem('tasks', JSON.stringify(filteredTasks));
    }

    static getProject(projectId) {
        const projects = this.getProjects();
        return projects.find(p => p.id === projectId);
    }

    // Tasks
    static getTasks() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    static getProjectTasks(projectId) {
        const tasks = this.getTasks();
        return tasks.filter(t => t.projectId === projectId);
    }

    static addTask(task) {
        const tasks = this.getTasks();
        task.id = Date.now().toString(); // Генерируем уникальный ID
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        return task;
    }

    static updateTask(taskId, updatedTask) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updatedTask };
            localStorage.setItem('tasks', JSON.stringify(tasks));
            return tasks[index];
        }
        return null;
    }

    static deleteTask(taskId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(filteredTasks));
    }

    static getTask(taskId) {
        const tasks = this.getTasks();
        return tasks.find(t => t.id === taskId);
    }

    static getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    static addUser(userData) {
        const users = this.getUsers();
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
    }

    static setProjects(projects) {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    static setTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    static clearAll() {
        localStorage.removeItem('user');
        localStorage.removeItem('users');
        localStorage.removeItem('projects');
        localStorage.removeItem('tasks');
    }

    static initializeData() {
        // Инициализируем тестовых пользователей
        const users = [
            {
                id: "1",
                username: "Анна Сидорова",
                email: "anna@example.com",
                role: "PROJECT_MANAGER"
            },
            {
                id: "2",
                username: "Михаил Козлов",
                email: "mikhail@example.com",
                role: "DEVELOPER"
            },
            {
                id: "3",
                username: "Елена Иванова",
                email: "elena@example.com",
                role: "DEVELOPER"
            },
            {
                id: "4",
                username: "Дмитрий Петров",
                email: "dmitry@example.com",
                role: "DEVELOPER"
            },
            {
                id: "5",
                username: "Ольга Смирнова",
                email: "olga@example.com",
                role: "DEVELOPER"
            },
            {
                id: "6",
                username: "Сергей Волков",
                email: "sergey@example.com",
                role: "DEVELOPER"
            }
        ];
        localStorage.setItem('users', JSON.stringify(users));

        // Инициализируем тестовые проекты если их нет
        if (this.getProjects().length === 0) {
            const projects = [
                {
                    id: "1",
                    name: "Веб-приложение",
                    description: "Разработка веб-приложения для управления проектами",
                    status: "Разработка",
                    startDate: "2023-11-01T00:00:00.000Z",
                    endDate: "2023-12-31T00:00:00.000Z",
                    managerId: "1",
                    participants: ["2", "3"]
                },
                {
                    id: "2",
                    name: "Мобильное приложение",
                    description: "Разработка мобильного приложения",
                    status: "Планирование",
                    startDate: "2023-11-15T00:00:00.000Z",
                    endDate: "2024-01-31T00:00:00.000Z",
                    managerId: "1",
                    participants: ["4", "5"]
                }
            ];
            this.setProjects(projects);
        }

        // Инициализируем тестовые задачи если их нет
        if (this.getTasks().length === 0) {
            const tasks = [
                {
                    id: "1",
                    projectId: "1",
                    title: "Сверстать главную страницу",
                    description: "Адаптивная верстка главной страницы сайта",
                    status: "В работе",
                    deadline: "2023-12-15T00:00:00.000Z",
                    assigneeId: "2",
                    priority: "Высокий"
                },
                {
                    id: "2",
                    projectId: "1",
                    title: "Разработать API для авторизации",
                    description: "REST API для системы авторизации пользователей",
                    status: "К выполнению",
                    deadline: "2023-12-10T00:00:00.000Z",
                    assigneeId: "3",
                    priority: "Средний"
                },
                {
                    id: "3",
                    projectId: "2",
                    title: "Дизайн мобильного интерфейса",
                    description: "Разработка UI/UX дизайна для мобильного приложения",
                    status: "В работе",
                    deadline: "2023-12-20T00:00:00.000Z",
                    assigneeId: "4",
                    priority: "Высокий"
                }
            ];
            this.setTasks(tasks);
        }
    }
} 