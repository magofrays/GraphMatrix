/**
 * Загружает стили для слайдера скорости, если они ещё не были загружены.
 */
export function loadRangeSliderStyles() {
    if (document.getElementById('range-slider-styles'))
        return;
    const link = document.createElement('link');
    link.id = 'range-slider-styles';
    link.rel = 'stylesheet';
    link.href = './styles/speed-slider.css';
    document.head.appendChild(link);
}

/**
 * Загружает стили для элементов управления режимами, если они ещё не были
 * загружены.
 */
export function loadModeControlsStyles() {
    if (document.getElementById('mode-controls-styles'))
        return;
    const link = document.createElement('link');
    link.id = 'mode-controls-styles';
    link.rel = 'stylesheet';
    link.href = './styles/mode-controls.css';
    document.head.appendChild(link);
}

/**
 * Загружает стили для сообщений, если они ещё не были загружены.
 */
export function loadMessagesStyles() {
    if (document.getElementById('messages-styles'))
        return;
    const link = document.createElement('link');
    link.id = 'messages-styles';
    link.rel = 'stylesheet';
    link.href = './styles/messages.css';
    document.head.appendChild(link);
}

/**
 * Загружает стили для уровней, если они ещё не были загружены.
 */
export function loadLevelsStyles() {
    if (document.getElementById('levels-styles'))
        return;
    const link = document.createElement('link');
    link.id = 'levels-styles';
    link.rel = 'stylesheet';
    link.href = './styles/levels.css';
    document.head.appendChild(link);
}