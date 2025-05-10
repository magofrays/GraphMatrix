export function loadRangeSliderStyles() {
    if (document.getElementById('range-slider-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'range-slider-styles';
    link.rel = 'stylesheet';
    link.href = '../styles/speed-slider.css';
    
    document.head.appendChild(link);
}

export function loadModeControlsStyles() {
    if (document.getElementById('mode-controls-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'mode-controls-styles';
    link.rel = 'stylesheet';
    link.href = '../styles/mode-controls.css';
    
    document.head.appendChild(link);
}

export function loadMessagesStyles() {
    if (document.getElementById('messages-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'messages-styles';
    link.rel = 'stylesheet';
    link.href = '../styles/messages.css';
    
    document.head.appendChild(link);
}

export function loadLevelsStyles() {
    if (document.getElementById('levels-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'levels-styles';
    link.rel = 'stylesheet';
    link.href = '../styles/levels.css';
    
    document.head.appendChild(link);
}