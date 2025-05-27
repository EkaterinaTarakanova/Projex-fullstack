document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login');
    const loginEmailInput = document.getElementById('login-email'); // Переименовали
    const loginPasswordInput = document.getElementById('login-password'); // Переименовали

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
            const userData = {
                username: nameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value,
                role: 'PROJECT_MANAGER', // Всегда устанавливаем роль менеджера проекта
                registrationDate: new Date().toISOString() // Добавляем дату регистрации
            };

            // Отправляем данные на сервер
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                // Успешная регистрация
                const result = await response.json();
                // Сохраняем данные пользователя
                Storage.setUser(result);
                window.location.href = '/html/Index.html';
            } else {
                const error = await response.text();
                const emailError = document.querySelector('#register-form .form-group:nth-child(2) .error-message');
                emailError.textContent = error;
                console.error('Ошибка регистрации:', error);
            }
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            alert('Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.');
        }
    });


    // Обработчик отправки формы ВХОДА
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            console.log('Введенные данные:', {
                email: loginEmailInput.value.trim(),
                password: loginPasswordInput.value // Используем переименованную переменную
            });

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: loginEmailInput.value.trim(),
                    password: loginPasswordInput.value
                }),
            });

            if (response.ok) {
                const userData = await response.json();
                // Сохраняем данные пользователя в localStorage
                Storage.setUser(userData);
                window.location.href = '/html/index.html';
            } else {
                const error = await response.text();
                document.querySelector('#login-form .error-message').textContent = error;
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    });
})