document.addEventListener('DOMContentLoaded', () => {
    // Показ/скрытие форм
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        // Очищаем ошибки при переключении форм
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        // Очищаем ошибки при переключении форм
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    });

    // Валидация формы регистрации
    const registerFormElement = document.getElementById('register');
    const nameInput = document.getElementById('register-name');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    const registerSubmit = document.getElementById('register-submit');
    const passwordRequirements = document.querySelectorAll('.password-requirements li');

    // Добавляем иконки для требований пароля
    passwordRequirements.forEach(req => {
        const icon = document.createElement('span');
        icon.className = 'req-icon';
        icon.innerHTML = '✓';
        req.insertBefore(icon, req.firstChild);
    });

    function validateName(name) {
        return name.length >= 2;
    }

    function validateEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailPattern.test(email);
    }

    function validatePassword(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };

        // Обновляем визуальные индикаторы
        document.getElementById('req-length').classList.toggle('valid', requirements.length);
        document.getElementById('req-uppercase').classList.toggle('valid', requirements.uppercase);
        document.getElementById('req-lowercase').classList.toggle('valid', requirements.lowercase);
        document.getElementById('req-number').classList.toggle('valid', requirements.number);
        document.getElementById('req-special').classList.toggle('valid', requirements.special);

        return Object.values(requirements).every(req => req);
    }

    function validateConfirmPassword(password, confirmPassword) {
        return password === confirmPassword && password !== '';
    }

    function updateSubmitButton() {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        const isNameValid = validateName(name);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const isConfirmPasswordValid = validateConfirmPassword(password, confirmPassword);

        // Обновляем состояние кнопки
        registerSubmit.disabled = !(isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid);

        // Добавляем визуальные эффекты для полей
        nameInput.parentElement.classList.toggle('input-valid', isNameValid);
        nameInput.parentElement.classList.toggle('input-invalid', name !== '' && !isNameValid);

        emailInput.parentElement.classList.toggle('input-valid', isEmailValid);
        emailInput.parentElement.classList.toggle('input-invalid', email !== '' && !isEmailValid);

        passwordInput.parentElement.classList.toggle('input-valid', isPasswordValid);
        passwordInput.parentElement.classList.toggle('input-invalid', password !== '' && !isPasswordValid);

        confirmPasswordInput.parentElement.classList.toggle('input-valid', isConfirmPasswordValid);
        confirmPasswordInput.parentElement.classList.toggle('input-invalid', confirmPassword !== '' && !isConfirmPasswordValid);
    }

    // Добавляем слушатели событий для всех полей
    nameInput.addEventListener('input', updateSubmitButton);
    emailInput.addEventListener('input', updateSubmitButton);
    passwordInput.addEventListener('input', updateSubmitButton);
    confirmPasswordInput.addEventListener('input', updateSubmitButton);

    // Обработка регистрации
    registerFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // Проверяем, не существует ли уже пользователь с таким email
            const users = Storage.getUsers();
            const existingUser = users.find(u => u.email === emailInput.value.trim());
            
            if (existingUser) {
                const emailError = document.querySelector('#register-form .form-group:nth-child(2) .error-message');
                emailError.textContent = 'Пользователь с таким email уже существует';
                return;
            }

            const userData = {
                id: Date.now().toString(),
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value,
                role: document.querySelector('input[name="role"]:checked').value,
                projects: []
            };

            // Сохраняем пользователя
            Storage.addUser(userData);
            Storage.setUser(userData);

            const projects = Storage.getProjects();

            // Если это первый менеджер, создаем демо-проект
            if (userData.role === 'manager' && projects.length === 0) {
                const demoProject = {
                    id: 'demo-project-manager',
                    name: 'Демо проект менеджера',
                    description: 'Это демонстрационный проект для нового менеджера',
                    status: 'planning',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    managerId: userData.id,
                    participants: [
                        {
                            userId: userData.id,
                            role: 'manager',
                            joinedAt: new Date().toISOString()
                        }
                    ]
                };
                Storage.addProject(demoProject);

                // Создаем демо-задачи для проекта менеджера
                const demoTasks = [
                    {
                        id: 'task1',
                        projectId: demoProject.id,
                        title: 'Планирование проекта',
                        description: 'Создать план проекта и определить основные этапы',
                        status: 'in_progress',
                        priority: 'high',
                        assigneeId: userData.id,
                        createdAt: new Date().toISOString(),
                        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    }
                ];
                demoTasks.forEach(task => Storage.addTask(task));
            }
            // Если это участник, добавляем его в демо-проект
            else if (userData.role === 'participant') {
                let demoProjectParticipant;
                
                // Проверяем, существует ли уже демо-проект для участников
                const existingDemoProject = projects.find(p => p.id === 'demo-project-participant');
                
                if (!existingDemoProject) {
                    // Создаем демо-проект для участников
                    demoProjectParticipant = {
                        id: 'demo-project-participant',
                        name: 'Разработка веб-приложения',
                        description: 'Проект по созданию современного веб-приложения',
                        status: 'development',
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        managerId: 'demo-manager',
                        participants: [
                            {
                                userId: 'demo-manager',
                                role: 'manager',
                                joinedAt: new Date().toISOString()
                            },
                            {
                                userId: userData.id,
                                role: 'participant',
                                joinedAt: new Date().toISOString()
                            }
                        ]
                    };
                    Storage.addProject(demoProjectParticipant);

                    // Создаем демо-задачи для участника
                    const participantTasks = [
                        {
                            id: `task-${Date.now()}-1`,
                            projectId: demoProjectParticipant.id,
                            title: 'Разработка пользовательского интерфейса',
                            description: 'Создать современный и удобный интерфейс для главной страницы',
                            status: 'in_progress',
                            priority: 'high',
                            assigneeId: userData.id,
                            createdAt: new Date().toISOString(),
                            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        },
                        {
                            id: `task-${Date.now()}-2`,
                            projectId: demoProjectParticipant.id,
                            title: 'Оптимизация производительности',
                            description: 'Провести оптимизацию загрузки страниц и работы с данными',
                            status: 'todo',
                            priority: 'medium',
                            assigneeId: userData.id,
                            createdAt: new Date().toISOString(),
                            deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        }
                    ];
                    participantTasks.forEach(task => Storage.addTask(task));
                } else {
                    // Добавляем нового участника в существующий демо-проект
                    existingDemoProject.participants.push({
                        userId: userData.id,
                        role: 'participant',
                        joinedAt: new Date().toISOString()
                    });
                    Storage.setProjects(projects.map(p => 
                        p.id === 'demo-project-participant' ? existingDemoProject : p
                    ));
                }
            }

            // Перенаправляем на главную страницу
            window.location.href = '/html/Index.html';
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            alert('Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.');
        }
    });

    // Обработка входа
    const loginFormElement = document.getElementById('login');
    loginFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        
        try {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const emailError = document.getElementById('login-email-error');

            const users = Storage.getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                Storage.setUser(user);
                window.location.href = '/html/Index.html';
            } else {
                emailError.textContent = 'Неверный email или пароль';
            }
        } catch (error) {
            console.error('Ошибка при входе:', error);
            alert('Произошла ошибка при входе. Пожалуйста, попробуйте снова.');
        }
    });
});