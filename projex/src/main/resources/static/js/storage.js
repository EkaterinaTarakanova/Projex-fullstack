class Storage {
    static setUser(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    }

    static getUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
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

    static getProjects() {
        const projects = localStorage.getItem('projects');
        return projects ? JSON.parse(projects) : [];
    }

    static addProject(projectData) {
        const projects = this.getProjects();
        projects.push(projectData);
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    static setTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    static getTasks() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    static addTask(taskData) {
        const tasks = this.getTasks();
        tasks.push(taskData);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    static clearAll() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('users');
        localStorage.removeItem('projects');
        localStorage.removeItem('tasks');
    }

    static initializeData() {
        // Инициализируем тестового пользователя, если его нет
        if (!this.getUser()) {
            const testUser = {
                id: 1,
                name: "Тестовый Пользователь",
                email: "test@example.com",
                role: "developer"
            };
            this.setUser(testUser);
            this.addUser(testUser);
        }

        // Инициализируем тестовые проекты, если их нет
        if (this.getProjects().length === 0) {
            const projects = [
                {
                    id: 1,
                    name: "Веб-приложение",
                    description: "Разработка веб-приложения для управления проектами",
                    status: "development",
                    startDate: "2023-11-01",
                    endDate: "2023-12-31",
                    participants: [
                        { userId: 1, role: "developer" }
                    ]
                },
                {
                    id: 2,
                    name: "Мобильное приложение",
                    description: "Разработка мобильного приложения",
                    status: "planning",
                    startDate: "2023-11-15",
                    endDate: "2024-01-31",
                    participants: [
                        { userId: 1, role: "developer" }
                    ]
                }
            ];
            this.setProjects(projects);
        }

        // Инициализируем тестовые задачи, если их нет
        if (this.getTasks().length === 0) {
            const initialTasks = [
                {
                    id: 1,
                    projectId: 1,
                    name: "Сверстать главную страницу",
                    description: "Адаптивная верстка главной страницы сайта",
                    owner: "Иван Иванов",
                    assignedTo: [1, 2],
                    deadline: "2023-12-15",
                    priority: "high",
                    status: "in_progress",
                    statusClass: "status-in-progress",
                    completed: false,
                    isPersonal: false,
                    comments: [
                        {
                            author: "Иван Иванов",
                            date: "2023-11-20 14:30",
                            text: "Начал работу над версткой"
                        },
                        {
                            author: "Петр Петров",
                            date: "2023-11-21 10:15",
                            text: "Добавил макет в Figma"
                        }
                    ],
                    commentsVisible: false
                },
                {
                    id: 2,
                    projectId: 1,
                    name: "Разработать API для авторизации",
                    description: "REST API для системы авторизации пользователей",
                    owner: "Алексей Смирнов",
                    assignedTo: [1],
                    deadline: "2023-12-10",
                    priority: "medium",
                    status: "todo",
                    statusClass: "status-todo",
                    completed: false,
                    isPersonal: true,
                    comments: [],
                    commentsVisible: false
                },
                {
                    id: 3,
                    projectId: 2,
                    name: "Протестировать модуль оплаты",
                    description: "Тестирование интеграции с платежной системой",
                    owner: "Мария Кузнецова",
                    assignedTo: [1, 3],
                    deadline: "2023-12-05",
                    priority: "high",
                    status: "in_progress",
                    statusClass: "status-in-progress",
                    completed: false,
                    isPersonal: false,
                    comments: [
                        {
                            author: "Мария Кузнецова",
                            date: "2023-11-18 16:45",
                            text: "Обнаружена ошибка при обработке ответа от платежного шлюза"
                        }
                    ],
                    commentsVisible: false
                },
                {
                    id: 4,
                    projectId: 2,
                    name: "Обновить документацию",
                    description: "Актуализировать документацию API",
                    owner: "Иван Иванов",
                    assignedTo: [1],
                    deadline: "2023-12-20",
                    priority: "low",
                    status: "completed",
                    statusClass: "status-completed",
                    completed: true,
                    isPersonal: true,
                    comments: [],
                    commentsVisible: false
                },
                {
                    id: 5,
                    projectId: 1,
                    name: "Оптимизировать производительность",
                    description: "Провести аудит и оптимизировать загрузку главной страницы",
                    owner: "Петр Петров",
                    assignedTo: [1, 4],
                    deadline: "2023-12-25",
                    priority: "high",
                    status: "todo",
                    statusClass: "status-planning",
                    completed: false,
                    isPersonal: false,
                    comments: [
                        {
                            author: "Петр Петров",
                            date: "2023-11-22 09:00",
                            text: "Текущее время загрузки - 5 секунд. Нужно уменьшить до 2 секунд."
                        }
                    ],
                    commentsVisible: false
                },
                {
                    id: 6,
                    projectId: 2,
                    name: "Внедрить систему аналитики",
                    description: "Интеграция Google Analytics и настройка целей",
                    owner: "Мария Кузнецова",
                    assignedTo: [1],
                    deadline: "2023-12-18",
                    priority: "medium",
                    status: "in_progress",
                    statusClass: "status-in-progress",
                    completed: false,
                    isPersonal: true,
                    comments: [
                        {
                            author: "Мария Кузнецова",
                            date: "2023-11-21 15:20",
                            text: "Базовые метрики настроены, приступаю к настройке целей"
                        }
                    ],
                    commentsVisible: false
                },
                {
                    id: 7,
                    projectId: 1,
                    name: "Разработать мобильную версию",
                    description: "Адаптация интерфейса для мобильных устройств",
                    owner: "Алексей Смирнов",
                    assignedTo: [1, 2, 3],
                    deadline: "2023-12-30",
                    priority: "high",
                    status: "todo",
                    statusClass: "status-planning",
                    completed: false,
                    isPersonal: false,
                    comments: [],
                    commentsVisible: false
                },
                {
                    id: 8,
                    projectId: 2,
                    name: "Исправить баги после тестирования",
                    description: "Устранение ошибок, выявленных QA-командой",
                    owner: "Иван Иванов",
                    assignedTo: [1],
                    deadline: "2023-12-08",
                    priority: "high",
                    status: "completed",
                    statusClass: "status-completed",
                    completed: true,
                    isPersonal: true,
                    comments: [
                        {
                            author: "Иван Иванов",
                            date: "2023-11-19 17:00",
                            text: "Все критические ошибки исправлены"
                        },
                        {
                            author: "Мария Кузнецова",
                            date: "2023-11-20 10:30",
                            text: "Подтверждаю, тесты проходят успешно"
                        }
                    ],
                    commentsVisible: false
                }
            ];
            this.setTasks(initialTasks);
        }
    }
} 