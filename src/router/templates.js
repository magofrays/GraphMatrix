export const demonstrationTemplate = `
    <h1>Режим демонстрации</h1>
    <div class="mode-controls">
        <label>Тип умножения:
            <select id="multiply-type">
                <option value="classic">Классическое</option>
                <option value="logical">Логическое</option>
                <option value="tropical">Тропическое</option>
            </select>
        </label>
        <label>Степень: 
            <select id="power">
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        </label>
        <button id="apply-multiply" class="button">Применить</button>
    </div>
    
    <div class="result-row">
        <div id="new-text-container" class="result-item"></div>
        <div id="new-matrix-container" class="result-item"></div>
        <div id="new-graph-container" class="result-item"></div>
        <div class ="range-speed">
            <label class="range-label hidden" for="range" display="none">Скорость</label>
            <input type="range" id="speed-control" min="200" max="3000" value="2000" class="range-input hidden">
        </div>
    </div>
`;

export const trainingTemplate = `
    <h1>Режим тренажера</h1>
    <div class="mode-controls">
        <label>Тип умножения:
            <select id="multiply-type">
                <option value="classic">Классическое</option>
                <option value="logical">Логическое</option>
                <option value="tropical">Тропическое</option>
            </select>
        </label>
        <label>Степень: 
            <select id="power">
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        </label>
        <button id="apply-multiply" class="button">Применить</button>
    </div>

    <div class="result-row">
        <div id="new-text-container" class="result-item"></div>
        <div id="new-matrix-container" class="result-item"></div>
        <div id="new-graph-container" class="result-item"></div>
    </div>
`;

export const checkTemplate = `
    <h1>Режим проверки</h1>
    <div class="mode-controls">
        <label>Тип умножения:
            <select id="multiply-type">
                <option value="classic">Классическое</option>
                <option value="logical">Логическое</option>
                <option value="tropical">Тропическое</option>
            </select>
        </label>
        <label>Степень: 
            <select id="power">
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        </label>
        <button id="apply-multiply" class="button">Применить</button>
    </div>

    <div class="result-row">
        <div id="new-text-container" class="result-item"></div>
        <div id="new-matrix-container" class="result-item"></div>
        <div id="new-graph-container" class="result-item"></div>
        <button id="check-answer" class="hidden button">Проверить</button>
    </div>
`;