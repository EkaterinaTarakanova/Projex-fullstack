class Logger {
    static async log(action, details) {
        const currentUser = Storage.getUser();
        if (!currentUser) return;

        try {
            const logData = {
                username: currentUser.username,
                action: this.getActionText(action),
                details: details
            };

            await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logData)
            });
        } catch (error) {
            console.error('Ошибка при сохранении лога:', error);
        }
    }

    // Предопределенные типы действий
    static Actions = {
        PROJECT_CREATE: 'СОЗДАНИЕ_ПРОЕКТА',
        PROJECT_UPDATE: 'ОБНОВЛЕНИЕ_ПРОЕКТА',
        PROJECT_DELETE: 'УДАЛЕНИЕ_ПРОЕКТА',
        TASK_CREATE: 'СОЗДАНИЕ_ЗАДАЧИ',
        TASK_UPDATE: 'ОБНОВЛЕНИЕ_ЗАДАЧИ',
        TASK_DELETE: 'УДАЛЕНИЕ_ЗАДАЧИ',
        USER_LOGIN: 'ВХОД_В_СИСТЕМУ',
        USER_LOGOUT: 'ВЫХОД_ИЗ_СИСТЕМЫ',
        PARTICIPANT_ADD: 'ДОБАВЛЕНИЕ_УЧАСТНИКА',
        PARTICIPANT_REMOVE: 'УДАЛЕНИЕ_УЧАСТНИКА'
    };

    // Получение читаемого текста действия
    static getActionText(action) {
        const actionTexts = {
            'СОЗДАНИЕ_ПРОЕКТА': 'Создание проекта',
            'ОБНОВЛЕНИЕ_ПРОЕКТА': 'Обновление проекта',
            'УДАЛЕНИЕ_ПРОЕКТА': 'Удаление проекта',
            'СОЗДАНИЕ_ЗАДАЧИ': 'Создание задачи',
            'ОБНОВЛЕНИЕ_ЗАДАЧИ': 'Обновление задачи',
            'УДАЛЕНИЕ_ЗАДАЧИ': 'Удаление задачи',
            'ВХОД_В_СИСТЕМУ': 'Вход в систему',
            'ВЫХОД_ИЗ_СИСТЕМЫ': 'Выход из системы',
            'ДОБАВЛЕНИЕ_УЧАСТНИКА': 'Добавление участника',
            'УДАЛЕНИЕ_УЧАСТНИКА': 'Удаление участника'
        };
        return actionTexts[action] || action;
    }
} 