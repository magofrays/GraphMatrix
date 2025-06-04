
/**
 * HTML-шаблон главной страницы приложения.
 *
 * Содержит:
 * - заголовок с названием режима,
 * - элементы управления: тип умножения, степень, кнопка "Применить",
 * - контейнер для текущего уровня,
 * - заголовок истории и контейнер для пройденных уровней.
 *
 * @type {string}
 * @constant
 */
export const appTemplate = `
    <h1 class="route-name"></h1>
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
    <div class="current-level" id="current-level"></div>
    <h2 id="history">История:</h2>
    <div class="levels-container" id="levels-container"></div>`