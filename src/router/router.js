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

    constructor() {
        window.addEventListener('hashchange', () => this.loadRoute());
        this.loadRoute();
    };

    restart() {
        this.cleanupPreviousMode(true);
        this.answerGraph = null;
        this.newGraph = null;
        this.loadRoute();
    };

    loadRoute() {
        const hash = window.location.hash || '#demonstration';
        const route = this.routes[hash];
        this.cleanupPreviousMode();
        this.currentRoute = route;
        document.getElementById('app').innerHTML = appTemplate;
        document.querySelector('.route-name').innerHTML = route.info;
        const multiplyTypeSelect = document.getElementById('multiply-type');
        multiplyTypeSelect.value = this.multiplyType;
        this.initializeMode();
        this.bindApplyButton();
    };

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

    initializeMode() {
        if (this.newGraph && this.answerGraph) {
            if (this.currentLevel <= this.maxLevel) {
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

    showCurrentMode() {
        let container = document.getElementById('current-level');
        this.createLevelRow(container, this.currentRoute.rowTemplate,
                            this.currentLevel, this.multiplyType);
        this.currentRoute.initLevel(this);
    };

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

    onComplete(row) {
        if (!this.isNext)
            this.currentLevel++;
        if (this.currentLevel - 1 < this.maxLevel) {
            this.createNextLevelButton(row);
        } else {
            this.addToStorage();
        }
    };

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

    printNext() { // подумать надо
        const levelsContainer = document.getElementById('levels-container');
        const currentLevel = document.getElementById('current-level');
        levelsContainer.innerHTML = '';
        currentLevel.innerHTML = '';
        this.updateInfo();
        this.createTestMatrices();
        this.showCurrentMode();
        this.outputStorage();
    };

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

    createInfo(level, multiplyType = this.multiplyType) {
        const typeName = this.getMultiplyTypeName(multiplyType);
        return `Тип умножения: ${typeName}\nСтепень: ${level}`;
    }
}
