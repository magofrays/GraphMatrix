/**
 * Показывает сообщение об успешном выполнении задания.
 *
 * Сообщение имеет класс 'completion-message' и удаляется автоматически при
 * следующем действии.
 */
export const showCompletionMessage = () => {
    document.querySelectorAll('.completion-message, .fail-message')
        .forEach(el => el.remove());
    const completeMessage = document.createElement('div');
    completeMessage.className = 'completion-message';
    completeMessage.textContent = '✅Задание выполнено верно!';
    document.getElementById('app').appendChild(completeMessage);
};

/**
 * Показывает сообщение об ошибке выполнения задания.
 *
 * Сообщение имеет класс 'fail-message' и удаляется при новой попытке.
 */
export const showFailMessage = () => {
    document.querySelectorAll('.completion-message, .fail-message')
        .forEach(el => el.remove());
    const failMessage = document.createElement('div');
    failMessage.className = 'fail-message';
    failMessage.textContent = '❌Задание выполнено неверно!';
    document.getElementById('app').appendChild(failMessage);
};

/**
 * Показывает сообщение об ошибке выбора параметров графа.
 *
 * Сообщение имеет класс 'error-message' и используется при отсутствии настроек
 * графа.
 */
export const showErrorSelectMessage = () => {
    document.querySelectorAll('.completion-message, .fail-message')
        .forEach(el => el.remove());
    const completeMessage = document.createElement('div');
    completeMessage.className = 'error-message';
    completeMessage.textContent = 'Для создания графа выберите его параметры';
    document.getElementById('app').appendChild(completeMessage);
};

/**
 * Показывает сообщение о необходимости создания графа до выполнения действий.
 *
 * Сообщение имеет класс 'error-message'.
 */
export const showErrorCreateGraphMessage = () => {
    document.querySelectorAll('.completion-message, .fail-message')
        .forEach(el => el.remove());
    const failMessage = document.createElement('div');
    failMessage.className = 'error-message';
    failMessage.textContent = 'Вначале создайте граф';
    document.getElementById('app').appendChild(failMessage);
};
