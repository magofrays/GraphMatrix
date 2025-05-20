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

export const Router = {
    currentRoute : null,
    newGraph : null,
    answerGraph : null,
    animationId : null,
    currentRoute : null,
    currentInfo : "",
    currentLevel : 1,
    maxLevel : 5,
    storedLevels : [],
    multiplyType : "classic",
    isApplied : false,

    routes : {
        '#demonstration' : {
            mode : 'demonstration',
            info : 'Режим демонстрации',
            rowTemplate : resultRowWithControlsTemplate,
            initLevel() { Router.initDemonstrationLevel();}
        },
        '#training' : {
            mode : 'training',
            info : 'Режим тренажера',
            rowTemplate : resultRowTemplate,
            initLevel() { Router.initTrainingLevel();}
        },
        '#check' : {
            mode : 'check',
            info : 'Режим проверки',
            rowTemplate : resultRowWithCheckTemplate,
            initLevel() { Router.initCheckLevel();}
        }
    },

    init() {
        window.addEventListener('hashchange', () => this.loadRoute());
        this.loadRoute();
    },

    loadRoute() {
        this.isApplied = false;
        const hash = window.location.hash || '#demonstration';
        const route = this.routes[hash];
        this.cleanupPreviousMode();
        this.currentRoute = route;
        document.getElementById('app').innerHTML = appTemplate;
        console.log(route.info);
        document.querySelector('.route-name').innerHTML = route.info;
        const multiplyTypeSelect = document.getElementById('multiply-type');
        multiplyTypeSelect.value = this.multiplyType;
        this.initializeMode();
        this.bindApplyButton();
    },

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
            this.isApplied = true;
        });
    },

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
    },

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
        if (levelsContainer) {
            levelsContainer.innerHTML = '';
        }
        this.cleanElements(true);
    },

    initializeMode() {
        if (this.newGraph && this.answerGraph) {
            if (this.currentLevel <= this.maxLevel) {
                this.showCurrentMode();
            }
            this.outputStorage();

            if (this.isNext && !document.querySelector('.next-level-button')) {
                const row = document.querySelector(
                    `.level-row[data-level="${this.currentLevel}"]`);
                if (row) {
                    this.createNextLevelButton(row);
                }
            }
        }
    },

    showCurrentMode() {
        let levelsContainer = document.getElementById('levels-container');
        if (!document.querySelector(
                `.level-row[data-level="${this.currentLevel}"]`)) {
            this.addLevelRow(levelsContainer);
        }
        this.currentRoute.initLevel();
    },

    addLevelRow(container) {
        let rowTemplate = this.currentRoute.rowTemplate;
        const row = document.createElement('div');
        row.id = 'level-row-' + this.currentLevel;
        row.className = 'level-row';
        row.dataset.level = this.currentLevel;
        row.innerHTML = rowTemplate;
        const textContainer = row.querySelector('.result-text-container');
        textContainer.textContent = this.currentInfo;
        container.appendChild(row);
        let resultRow = row.querySelector('.result-row');
        createContentWrapper(resultRow);
    },

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
    },

    initDemonstrationLevel() {
        const row = document.querySelector(
            `.level-row[data-level="${this.currentLevel}"]`);
        const currentLevelBeforeChange = this.currentLevel;

        renderMatrixDemonstration(this.newGraph, row, this.answerGraph);
        if (this.isNext) {
            if (this.currentLevel - 1 < this.maxLevel) {
                this.createNextLevelButton(row);
            } else {
                this.addToStorage();
            }
        } else {
            const checkGood = () => {
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
                window.currentCheck = setTimeout(checkGood, 1000);
            };
            checkGood();
        }
    },

    initTrainingLevel() {
        const row = document.querySelector(
            `.level-row[data-level="${this.currentLevel}"]`);

        renderMatrixTraining(this.newGraph, row, this.answerGraph, () => {
            if (!this.isNext)
                this.currentLevel++;
            if (this.currentLevel - 1 < this.maxLevel) {
                this.createNextLevelButton(row);
            } else {
                this.addToStorage();
            }
        });
    },

    initCheckLevel() {
        const row = document.querySelector(
            `.level-row[data-level="${this.currentLevel}"]`);
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

                const isCorrect = checkMatrixCompletion(
                    this.newGraph.Matrix, this.answerGraph.Matrix);

                if (isCorrect) {
                    showCompletionMessage();
                    this.cleanElements();
                    lockMatrixInputs(row.querySelector('.matrix-container'));
                    this.currentLevel++;
                    if (this.currentLevel - 1 < this.maxLevel) {
                        this.createNextLevelButton(row);
                    } else {
                        this.addToStorage();
                    }
                } else {
                    showFailMessage();
                }
            };
        }

        checkButton.addEventListener('click', this.handleCheckClick);
    },

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
    },

    printNext() {
        const levelsContainer = document.getElementById('levels-container');
        levelsContainer.innerHTML = '';
        this.updateInfo();
        this.createTestMatrices();
        this.showCurrentMode();
        this.outputStorage();
    },

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
    },

    updateInfo() {
        if (this.storedLevels.length === 0) {
            this.multiplyType = document.getElementById('multiply-type').value;
            this.power = document.getElementById('power').value;
            this.currentInfo = this.getLevelInfo(this.power);
        } else {
            const level = this.storedLevels[this.storedLevels.length - 1];
            console.log(level);
            this.multiplyType = level.multiplyType;
            this.power = level.currentLevel + 1;
            this.currentInfo = this.getLevelInfo(this.power);
        }
    },

    addToStorage() {
        if (this.storedLevels.length < this.maxLevel &&
            this.currentLevel - 1 <= this.maxLevel) {
            const storedGraph = new Graph();
            storedGraph.clone(this.answerGraph);
            const currentLevel = this.currentLevel - 1;
            const multiplyType = this.multiplyType;
            this.storedLevels.push({currentLevel, storedGraph, multiplyType});
        }
    },

    outputStorage() {
        const levelsContainer = document.getElementById('levels-container');

        [...this.storedLevels].reverse().forEach(level => {
            const {currentLevel, storedGraph, multiplyType} = level;

            const row = document.createElement('div');
            row.className = 'level-row';
            row.id = 'level-row-' + currentLevel;
            row.dataset.level = currentLevel;

            row.innerHTML = resultRowTemplate;

            const textContainer = row.querySelector('.result-text-container');
            textContainer.textContent =
                this.getLevelInfo(currentLevel, multiplyType);
            createContentWrapper(row.querySelector('.result-row'));
            renderMatrix(storedGraph, row, true);
            displayGraph(storedGraph, row);

            levelsContainer.appendChild(row);
        });
    },

    getLevelInfo(level, multiplyType = this.multiplyType) {
        const typeName = this.getMultiplyTypeName(multiplyType);
        return `Тип умножения: ${typeName}\nСтепень: ${level}`;
    }
};