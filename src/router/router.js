import {AppState} from '../base/app.js';
import {Graph} from "../base/base-graph.js";
import {
    showCompletionMessage,
    showErrorCreateGraphMessage,
    showFailMessage
} from "../output/messages.js";
import {
    checkMatrixCompletion,
    createContentWrapper,
    displayGraph,
    lockMatrixInputs,
    renderMatrix,
    renderMatrixCheck,
    renderMatrixDemonstration,
    renderMatrixTraining
} from "../output/print-graph.js";

import {
    resultRowTemplate,
    resultRowWithCheckTemplate,
    resultRowWithControlsTemplate
} from "./result-templates.js";
import {
    appTemplate,
} from "./templates.js";

/**
 * Класс, управляющий маршрутизацией и режимами приложения.
 *
 * @class Router
 * @property {string} currentRoute - Текущий хэш-маршрут (#demonstration,
 * #training, #check).
 * @property {Graph} newGraph - Граф, используемый для текущего уровня/режима.
 * @property {Graph} answerGraph - Граф с правильным результатом.
 * @property {number|null} animationId - ИД текущей анимации (если есть).
 * @property {string} currentInfo - Текстовая информация о текущем режиме и
 * уровне.
 * @property {number} currentLevel - Номер текущего уровня.
 * @property {number} maxLevel - Максимальное количество уровней.
 * @property {Array} storedLevels - Пройденные уровни, сохранённые в памяти.
 * @property {string} multiplyType - Тип умножения матриц: "classic", "logical",
 * "tropical".
 *
 * @example
 * const router = new Router();
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
            rowTemplate: resultRowWithControlsTemplate,
            initLevel(Router) { Router.initDemonstrationLevel(); }
        },
        '#training': {
            mode: 'training',
            info: 'Режим тренажера',
            rowTemplate: resultRowTemplate,
            initLevel(Router) { Router.initTrainingLevel(); }
        },
        '#check': {
            mode: 'check',
            info: 'Режим проверки',
            rowTemplate: resultRowWithCheckTemplate,
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
    restart() {
        this.cleanupPreviousMode(true);
        this.answerGraph = null;
        this.newGraph = null;
        this.loadRoute();
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
        const levelsContainer = document.getElementById('levels-container');
        const currentLevel = document.getElementById('current-level');
        if (levelsContainer) {
            levelsContainer.innerHTML = '';
        }
        if (currentLevel) {
            currentLevel.innerHTML = '';
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
                        this.currentLevel -= 1;
                    }
                    this.createTestMatrices();
                }
                this.showCurrentMode();
            }
            this.outputStorage();

            if (this.isNext && !document.querySelector('.next-level-button')) {
                const row =
                    document.getElementById('level-row-' + this.currentLevel);
                if (row) {
                    this.createNextLevelButton(row);
                }
            }
        }
    };

    /**
     * Отображает текущий уровень в интерфейсе.
     */
    showCurrentMode() {
        let container = document.getElementById('current-level');
        this.createLevelRow(container, this.currentRoute.rowTemplate,
                            this.currentLevel, this.multiplyType);
        this.currentRoute.initLevel(this);
    };

    /**
     * Создаёт строку уровня.
     * @param {HTMLElement} container - Контейнер для строки уровня.
     * @param {string} template - Шаблон строки.
     * @param {number} level - Номер уровня.
     * @param {string} multiplyType - Тип умножения матриц.
     * @returns {HTMLElement} - Созданная строка уровня.
     */
    createLevelRow(container, template, level, multiplyType) {
        const row = document.createElement('div');
        row.id = 'level-row-' + level;
        row.className = 'level-row';
        row.innerHTML = template;
        const textContainer = row.querySelector('.result-text-container');
        textContainer.textContent = this.createInfo(level, multiplyType);
        container.appendChild(row);
        let resultRow = row.querySelector('.result-row');
        createContentWrapper(resultRow);
        return row;
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
        this.newGraph = new Graph(AppState.graph.size, 0, AppState.GenType);
        for (let i = 0; i < AppState.graph.size; i++) {
            for (let j = 0; j < AppState.graph.size; j++) {
                this.newGraph.changeEdge(i, j, -1);
            }
        }
    };

    /**
     * Проверяет выполнение задания и переходит к следующему уровню.
     * @param {number} currentLevelBeforeChange - Номер уровня до изменения.
     * @param {HTMLElement} row - Строка уровня в интерфейсе.
     */
    checkGood(currentLevelBeforeChange, row) {
        if (checkMatrixCompletion(this.newGraph.Matrix,
                                  this.answerGraph.Matrix)) {
            this.cleanElements();
            this.currentLevel = currentLevelBeforeChange + 1;
            if (this.currentLevel - 1 < this.maxLevel) {
                this.createNextLevelButton(row);
            } else {
                this.addToStorage();
                renderMatrix(this.answerGraph, row, true);
            }
            return;
        }
        window.currentCheck = setTimeout(
            () => { this.checkGood(currentLevelBeforeChange, row); }, 1000);
    }

    /**
     * Выполняется по завершении уровня.
     * @param {HTMLElement} row - Строка уровня в интерфейсе.
     */
    onComplete(row) {
        if (!this.isNext)
            this.currentLevel++;
        if (this.currentLevel - 1 < this.maxLevel) {
            this.createNextLevelButton(row);
        } else {
            this.addToStorage();
        }
    };

    /**
     * Инициализирует уровень демонстрации.
     */
    initDemonstrationLevel() {
        const row = document.getElementById('level-row-' + this.currentLevel);
        const currentLevelBeforeChange = this.currentLevel;
        renderMatrixDemonstration(this.newGraph, row, this.answerGraph);
        if (this.isNext) {
            if (this.currentLevel - 1 < this.maxLevel) {
                this.createNextLevelButton(row);
            } else {
                this.addToStorage();
            }
        } else {
            this.checkGood(currentLevelBeforeChange, row);
        }
    };

    /**
     * Инициализирует уровень тренировки.
     */
    initTrainingLevel() {
        const row = document.getElementById('level-row-' + this.currentLevel);
        renderMatrixTraining(this.newGraph, row, this.answerGraph, () => {
            if (!this.isNext)
                this.currentLevel++;
            if (this.currentLevel - 1 < this.maxLevel) {
                this.createNextLevelButton(row);
            } else {
                this.addToStorage();
            }
        });
    };

    /**
     * Инициализирует уровень проверки.
     */
    initCheckLevel() { // нужно как-то фиксить это
        const row = document.getElementById('level-row-' + this.currentLevel);
        const checkButton = row.querySelector('.check-answer');
        renderMatrixCheck(this.newGraph, row, this.answerGraph);
        checkButton.removeEventListener('click', this.handleCheckClick);
        if (this.isNext) {
            if (this.currentLevel - 1 < this.maxLevel) {
                this.createNextLevelButton(row);
            } else {
                this.addToStorage();
            }
        } else {
            this.handleCheckClick = () => {
                document.querySelectorAll('.completion-message, .fail-message')
                    .forEach(el => el.remove());
                if (checkMatrixCompletion(this.newGraph.Matrix,
                                          this.answerGraph.Matrix)) {
                    showCompletionMessage();
                    this.cleanElements();
                    lockMatrixInputs(row.querySelector('.matrix-container'));
                    this.onComplete(row);
                } else {
                    showFailMessage();
                }
            };
        }
        checkButton.addEventListener('click', this.handleCheckClick);
    };

    /**
     * Создаёт кнопку "Следующая степень".
     * @param {HTMLElement} row - Строка уровня.
     */
    createNextLevelButton(row) {
        this.isNext = true;
        const nextLevelButton = document.createElement('button');
        nextLevelButton.textContent = 'Следующая степень';
        nextLevelButton.className = 'button next-level-button';
        nextLevelButton.addEventListener('click', () => {
            this.isNext = false;
            this.addToStorage();
            this.printNext();
        });
        row.insertAdjacentElement('afterend', nextLevelButton);
    };

    /**
     * Переход к следующему уровню.
     */
    printNext() {
        const levelsContainer = document.getElementById('levels-container');
        const currentLevel = document.getElementById('current-level');
        levelsContainer.innerHTML = '';
        currentLevel.innerHTML = '';
        this.updateInfo();
        this.createTestMatrices();
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
            this.currentLevel - 1 <= this.maxLevel) {
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
        const levelsContainer = document.getElementById('levels-container');
        for (const level of this.storedLevels) {
            const row =
                this.createLevelRow(levelsContainer, resultRowTemplate,
                                    level.currentLevel, level.multiplyType);
            renderMatrix(level.storedGraph, row, true);
            displayGraph(level.storedGraph, row);
            levelsContainer.prepend(row);
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
