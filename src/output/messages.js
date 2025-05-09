export const showCompletionMessage = () => {
    const completeMessage = document.createElement('div');
    completeMessage.className = 'completion-message';
    completeMessage.textContent = '✅Задание выполнено верно!';
    document.getElementById('app').appendChild(completeMessage);
};

export const showFailMessage = () => {
    const failMessage = document.createElement('div');
    failMessage.className = 'fail-message';
    failMessage.textContent = '❌Задание выполнено неверно!';
    document.getElementById('app').appendChild(failMessage);
};

export const showErrorSelectMessage = () => {
    const completeMessage = document.createElement('div');
    completeMessage.className = 'error-message';
    completeMessage.textContent = 'Для создания графа выберите его параметры';
    document.getElementById('app').appendChild(completeMessage);
};

export const showErrorCreateGraphMessage = () => {
    const failMessage = document.createElement('div');
    failMessage.className = 'error-message';
    failMessage.textContent = 'Вначале создайте граф';
    document.getElementById('app').appendChild(failMessage);
};
