import {
    AppState, 
    generateNewGraph
} from '../base/app.js';
import {Graph} from "../base/base-graph.js";
import {
    showCompletionMessage,
    showErrorCreateGraphMessage,
    showFailMessage
} from "../output/messages.js";
import {
    checkMatrixCompletion,
    createContentWrapper,
    lockMatrixInputs,
    renderMatrix,
    renderMatrixCheck,
    renderMatrixDemonstration,
    renderMatrixTraining
} from "../output/print-graph.js";

import {appTemplate} from "./templates.js";

/**
 * Класс, управляющий маршрутизацией и режимами приложения.
 *
 * @class Router
 * @property {string} currentRoute - Текущий хэш-маршрут (#demonstration,
 * #training, #check).
 * @property {Graph} newGraph - Граф, используемый для текущего уровня/режима.
 * @property {Graph} answerGraph - Граф с правильным результатом.
 * @property {number|null} animationId - id текущей анимации (если есть).
 * @property {string} currentInfo - Текстовая информация о текущем режиме и
 * уровне.
 * @property {number} currentLevel - Номер текущего уровня.
 * @property {number} maxLevel - Максимальное количество уровней.
 * @property {Array} storedLevels - Пройденные уровни, сохранённые в памяти.
 * @property {string} multiplyType - Тип умножения матриц: "classic", "logical",
 * "tropical".
 */
export class Router {
    currentRoute = null;
    newGraph = null;
    answerGraph = null;
    animationId = null;
    currentRoute = null;
    currentInfo = "";
    currentLevel = 1;
    maxLevel = 5;
    storedLevels = [];
    multiplyType = "classic";

    /**
     * Таблица режимов и их параметров.
     *
     * @type {Object}
     * @property {Object} '#demonstration' - Режим демонстрации.
     * @property {Object} '#training' - Режим тренировки.
     * @property {Object} '#check' - Режим проверки.
     */
    routes = {
        '#demonstration' : {
            mode : 'demonstration',
            info: 'Режим демонстрации',
            initLevel(Router) { Router.initDemonstrationLevel(); }
        },
        '#training': {
            mode: 'training',
            info: 'Режим тренажера',
            initLevel(Router) { Router.initTrainingLevel(); }
        },
        '#check': {
            mode: 'check',
            info: 'Режим проверки',
            initLevel(Router) { Router.initCheckLevel(); }
        }
    };

    /**
     * Конструктор. Подписывается на изменение URL-хэша и загружает режим.
     */
    constructor() {
        window.addEventListener('hashchange', () => this.loadRoute());
        this.loadRoute();
    };

    /**
     * Перезапускает текущий режим.
     */
    restart(maxLevel) {
        this.cleanupPreviousMode(true);
        this.answerGraph = null;
        this.newGraph = null;
        this.maxLevel = maxLevel;
        this.loadRoute();
    };

    /**
     * Меняет значение возможных степеней.
     */
    changePowerOption() {
        const powerSelect = document.getElementById('power');
        powerSelect.innerHTML = '';
        for (let i = 2; i <= this.maxLevel; i++) {
            const optionElement = document.createElement('option');
            optionElement.value = i.toString();
            optionElement.textContent = i.toString();
            powerSelect.appendChild(optionElement);
        }
    };

    /**
     * Загружает текущий режим из URL и инициализирует его.
     */
    loadRoute() {
        this.currentMode = window.location.hash || '#demonstration';
        const route = this.routes[this.currentMode];
        this.cleanupPreviousMode();
        this.currentRoute = route;
        document.getElementById('app').innerHTML = appTemplate;
        document.querySelector('.route-name').innerHTML = route.info;
        const multiplyTypeSelect = document.getElementById('multiply-type');
        multiplyTypeSelect.value = this.multiplyType;
        this.initializeMode();
        this.bindApplyButton();
        this.changePowerOption();
    };

    /**
     * Связывает обработчик кнопки "Применить".
     */
    bindApplyButton() {
        const applyBtn = document.getElementById('apply-multiply');
        applyBtn.addEventListener('click', () => {
            if (!AppState.graph) {
                showErrorCreateGraphMessage();
                return;
            }
            this.cleanupPreviousMode(true);
            this.updateInfo();
            AppState.power = this.power;
            this.currentLevel = parseInt(this.power);
            this.createTestMatrices();
            this.showCurrentMode();
        });
    };

    /**
     * Очищает элементы UI, связанные с предыдущим режимом.
     * @param {boolean} deleteNext - Удалить ли кнопку "Следующая степень".
     */
    cleanElements(deleteNext = false) {
        document.querySelectorAll('.check-answer').forEach(btn => btn.remove());
        document.querySelectorAll('.speed-control')
            .forEach(ctrl => ctrl.remove());
        document.querySelectorAll('.range-label')
            .forEach(label => label.remove());
        if (deleteNext) {
            document.querySelectorAll('.next-level-button')
                .forEach(btn => btn.remove());
        }
    };

    /**
     * Очищает состояние предыдущего режима.
     * @param {boolean} clearLevels - Очистить ли уровень и хранилище.
     */
    cleanupPreviousMode(clearLevels = false) {
        if (clearLevels) {
            this.storedLevels = [];
            this.isNext = false;
        }
        if (window.currentAnimation) {
            clearTimeout(window.currentAnimation);
        }
        if (window.currentCheck) {
            clearTimeout(window.currentCheck);
        }
        const historyContainer = document.getElementById('history-container');
        if (historyContainer) {
            historyContainer.innerHTML = '';
        }
        this.cleanElements(true);
    };

    /**
     * Инициализирует текущий режим.
     */
    initializeMode() {
        if (this.newGraph && this.answerGraph) {
            if (this.currentLevel <= this.maxLevel) {
                if (this.currentMode === '#check') {
                    if (this.isNext) {
                        this.isNext = false;
                    }
                    generateNewGraph(this, AppState.graph.size, AppState.graph.EdgeNumber, AppState.graph.GenType);
                    this.currentLevel = AppState.power;
                    this.createTestMatrices();
                }
                this.showCurrentMode();
            }
            this.outputStorage();

            if (this.isNext && !document.querySelector('.next-level-button')) {
                const container =
                    document.getElementById('global-value');
                if (container) {
                    this.createNextLevelButton(container);
                }
            }
        }
    };

    /**
     * Отображает текущий уровень в интерфейсе.
     */
    showCurrentMode() {
        let container = document.getElementById('global-value');
        this.createGlobalContent();
        this.createLevelRow(container);
        this.currentRoute.initLevel(this);
    };

    /**
     * Создает корректор скорости.
     * @param {HTMLElement} container - текущий контейнер.
     */
    createSpeedControl(container){
        container.insertAdjacentHTML('beforeend', `
                        <div class="range-speed global-item-3">
                            <label class="range-label"><b>Скорость</b></label>
                            <input type="range" class="speed-control" min="200" max="3400" value="1000" class="range-input">
                        </div>
                    `);
    };

    /**
     * Создает кнопку проверки.
     * @param {HTMLElement} container - текущий контейнер.
     */
    createCheckButton(container){
        container.insertAdjacentHTML('beforeend', `
                        <button class="check-answer button global-item-3">Проверить</button>
                    `);
    };

    /**
     * Создает новый начальный уровень
     * @param {HTMLElement} container - текущий контейнер.
     */
    createLevelRow(container) {
        this.createGlobalContent();
        createContentWrapper(container);
        const wrappers = container.querySelectorAll('.content-wrapper');
        const currentWrapper = wrappers[wrappers.length - 1];
        currentWrapper.classList.add('global-item-2');
        const textContainer = currentWrapper.querySelector('.content-text-container');
        textContainer.textContent = this.createInfo(this.currentLevel, this.multiplyType);
        if (this.routes[this.currentMode].mode == 'demonstration'){
            this.createSpeedControl(container);
        }
        if (this.routes[this.currentMode].mode == 'check'){
            this.createCheckButton(container);
        }
    };

    /**
     * Создает генерируемые матрицу и граф.
     */
    createGlobalContent(){
        const container = document.getElementById("global-value");
        container.innerHTML = '';
        createContentWrapper(container);
        const currentWrapper = container.querySelector('.content-wrapper');
        currentWrapper.classList.add('global-item-1')
        const textContainer = container.querySelector('.content-text-container');
        textContainer.textContent = "Начальный граф";
        renderMatrix(AppState.graph, container, false, true);
    };

    /**
     * Создаёт матрицу для проверки и для заполнения на основе текущего уровня и
     * типа умножения.
     */
    createTestMatrices() {
        this.answerGraph = new Graph;
        this.answerGraph.clone(AppState.graph);
        switch (this.multiplyType) {
        case 'classic':
            this.answerGraph.classicMultiply(this.currentLevel);
            break;
        case 'logical':
            this.answerGraph.logicalMultiply(this.currentLevel);
            break;
        case 'tropical':
            this.answerGraph.tropicalMultiply(this.currentLevel);
            break;
        }
        this.newGraph = new Graph;
        this.newGraph.clone(AppState.graph);
        for (let i = 0; i < AppState.graph.size; i++) {
            for (let j = 0; j < AppState.graph.size; j++) {
                this.newGraph.changeEdge(i, j, -1);
            }
        }
    };

    /**
     * Проверяет выполнение задания и переходит к следующему уровню.
     * @param {HTMLElement} container - текущий контейнер.
     */
    checkGood(container) {
        if (checkMatrixCompletion(this.newGraph.Matrix,
                                  this.answerGraph.Matrix)) {
            this.cleanElements();
            if (this.currentLevel < this.maxLevel) {
                this.createNextLevelButton(container);
            } else {
                renderMatrix(this.answerGraph, container, true);
            }
            return;
        }
        window.currentCheck = setTimeout(
            () => { this.checkGood(container); }, 1000);
    }

    /**
     * Выполняется по завершении уровня.
     * @param {HTMLElement} container - текущий контейнер.
     */
    onComplete(container) {
        if (this.currentLevel < this.maxLevel) {
            this.createNextLevelButton(container);
        } 
    };

    /**
     * Инициализирует уровень демонстрации.
     */
    initDemonstrationLevel() {
        const container = document.getElementById('global-value');
        const wrappers = container.querySelectorAll('.content-wrapper');
        const currentWrapper = wrappers[wrappers.length - 1];
        renderMatrixDemonstration(this.newGraph, currentWrapper, this.answerGraph);
        if (this.isNext) {
            if (this.currentLevel < this.maxLevel) {
                this.createNextLevelButton(container);
            }
        } else {
            this.checkGood(container);
        }
    };

    /**
     * Инициализирует уровень тренировки.
     */
    initTrainingLevel() {
        const container = document.getElementById('global-value');
        const wrappers = container.querySelectorAll('.content-wrapper');
        const currentWrapper = wrappers[wrappers.length - 1];
        renderMatrixTraining(this.newGraph, currentWrapper, this.answerGraph, () => {
            if (this.currentLevel < this.maxLevel) {
                this.createNextLevelButton(container);
            }
        });
    };

    /**
     * Инициализирует уровень проверки.
     */
    initCheckLevel() {
        const container = document.getElementById('global-value');
        const wrappers = container.querySelectorAll('.content-wrapper');
        const currentWrapper = wrappers[wrappers.length - 1];
        const checkButton = document.querySelector('.check-answer');
        renderMatrixCheck(this.newGraph, currentWrapper, this.answerGraph);
        checkButton.removeEventListener('click', this.handleCheckClick);
        if (this.isNext) {
            if (this.currentLevel < this.maxLevel) {
                this.createNextLevelButton(container);
            }
        } else {
            this.handleCheckClick = () => {
                document.querySelectorAll('.completion-message, .fail-message')
                    .forEach(el => el.remove());
                if (checkMatrixCompletion(this.newGraph.Matrix,
                                          this.answerGraph.Matrix)) {
                    showCompletionMessage();
                    this.cleanElements();
                    lockMatrixInputs(currentWrapper.querySelector('.matrix-container'));
                    this.onComplete(container);
                } else {
                    showFailMessage();
                }
            };
        }
        checkButton.addEventListener('click', this.handleCheckClick);
    };

    /**
     * Создаёт кнопку "Следующая степень".
     * @param {HTMLElement} container - контейнер для вставки кнопки.
     */
    createNextLevelButton(container) {
        this.isNext = true;
        const nextLevelButton = document.createElement('button');
        nextLevelButton.textContent = 'Следующая степень';
        nextLevelButton.className = 'button next-level-button global-item-3';
        nextLevelButton.addEventListener('click', () => {
            this.currentLevel++;
            this.isNext = false;
            this.addToStorage();
            this.printNext(container);
        });
        container.appendChild(nextLevelButton);
    };

    /**
     * Переход к следующему уровню.
     */
    printNext(container) {
        const wrappers = container.querySelectorAll('.content-wrapper');
        const currentWrapper = wrappers[wrappers.length - 1];
        currentWrapper.innerHTML = '';
        this.updateInfo();
        this.createTestMatrices();
        this.cleanElements(true);
        this.showCurrentMode();
        this.outputStorage();
    };

    /**
     * Возвращает человеко-читаемое имя типа умножения.
     * @param {string} multiplyType - Тип умножения ("classic", "logical",
     *     "tropical").
     * @returns {string} - Читаемое название.
     */
    getMultiplyTypeName(multiplyType) {
        switch (multiplyType) {
        case 'classic':
            return "Классическое";
        case 'logical':
            return "Логическое";
        case 'tropical':
            return "Тропическое";
        default:
            return "";
        }
    };

    /**
     * Обновляет информацию о текущем уровне и типе умножения.
     */
    updateInfo() {
        if (this.storedLevels.length === 0) {
            this.multiplyType = document.getElementById('multiply-type').value;
            this.power = document.getElementById('power').value;
            this.currentInfo = this.createInfo(this.power, this.multiplyType);
        } else {
            const level = this.storedLevels[this.storedLevels.length - 1];
            this.multiplyType = level.multiplyType;
            this.power = level.currentLevel + 1;
            this.currentInfo = this.createInfo(this.power, this.multiplyType);
        }
    };

    /**
     * Добавляет пройденный уровень в хранилище.
     */
    addToStorage() {
        if (this.storedLevels.length < this.maxLevel &&
            this.currentLevel /*- 1*/ <= this.maxLevel) {
            const storedGraph = new Graph();
            storedGraph.clone(this.answerGraph);
            const currentLevel = this.currentLevel - 1;
            const multiplyType = this.multiplyType;
            this.storedLevels.push({currentLevel, storedGraph, multiplyType});
        }
    };

    /**
     * Выводит историю в интерфейс.
     */
    outputStorage() {
        const container = document.getElementById('history-container');
        container.innerHTML = '';
        for (let i = this.storedLevels.length - 1; i >= 0; i--) {
            const level = this.storedLevels[i];
            const newLevel = document.createElement('div');
            createContentWrapper(newLevel);
            const textContainer = newLevel.querySelector('.content-text-container');
            textContainer.textContent = this.createInfo(level.currentLevel, level.multiplyType);
            renderMatrix(level.storedGraph, newLevel, true, true);
            container.appendChild(newLevel);
        }
    }

    /**
     * Формирует текстовое описание уровня и типа умножения.
     * @param {number} level - Номер уровня.
     * @param {string} multiplyType - Тип умножения.
     * @returns {string} - Текстовое описание.
     */
    createInfo(level, multiplyType = this.multiplyType) {
        const typeName = this.getMultiplyTypeName(multiplyType);
        return `Тип умножения: ${typeName}\nСтепень: ${level}`;
    }
}
