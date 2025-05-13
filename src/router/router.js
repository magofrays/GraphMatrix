import { demonstrationTemplate, trainingTemplate, checkTemplate } from "./templates.js";
import { AppState } from '../base/app.js';
import { Graph } from "../base/base-graph.js";
import { renderMatrixTraining, renderMatrixCheck, renderMatrixDemonstration, displayGraph, checkMatrixCompletion, lockMatrixInputs, renderMatrix } from "../output/print-graph.js";
import { showErrorCreateGraphMessage } from "../output/messages.js";
import { resultRowTemplate, resultRowWithCheckTemplate, resultRowWithControlsTemplate } from "./result-templates.js";
import { showCompletionMessage, showFailMessage } from "../output/messages.js";

export const Router = {
    currentMode: null,
    newGraph: null,
    answerGraph: null,
    animationId: null, 
    currentInfo: "",
    currentLevel: 1,
    maxLevel: 5,
    storedLevels: [],
    multiplyType: "classic",
    
    routes: {
        '#demonstration': {
            template: demonstrationTemplate,
            init: function() { 
                Router.currentMode = 'demonstration';
                Router.cleanupPreviousMode();
                Router.initializeMode();
            }
        },
        '#training': {
            template: trainingTemplate,
            init: function() { 
                Router.currentMode = 'training';
                Router.cleanupPreviousMode();
                Router.initializeMode();
            }
        }, 
        '#check': {
            template: checkTemplate,
            init: function() { 
                Router.currentMode = 'check';
                Router.cleanupPreviousMode();
                Router.initializeMode();
            }
        }
    },

    init() {
        this.setupNavigation();
        this.loadRoute();
    },

    setupNavigation() {
        window.addEventListener('hashchange', () => this.loadRoute());
    },

    loadRoute() {
        const hash = window.location.hash || '#demonstration';
        const route = this.routes[hash];
    
        if (route) {
            this.cleanupPreviousMode();

            document.getElementById('app').innerHTML = route.template;

            const multiplyTypeSelect = document.getElementById('multiply-type');
            if (multiplyTypeSelect) {
                multiplyTypeSelect.value = this.multiplyType;
            }

            this.bindApplyButton();

            route.init();
        }
    },

    bindApplyButton() {
        const applyBtn = document.getElementById('apply-multiply');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.cleanupPreviousMode(true);
                this.currentLevel = parseInt(document.getElementById('power').value);
                this.updateInfo();
                this.prepareLevel();
            });
        }
    },

    getModeTemplate() {
        switch(this.currentMode) {
            case 'demonstration':
                return demonstrationTemplate;
            case 'training':
                return trainingTemplate;
            case 'check':
                return checkTemplate;
            default:
                return demonstrationTemplate; 
        }
    },

    cleanNextLevelButton(){
        document.querySelectorAll('.next-level-button').forEach(btn => btn.remove());
    },

    cleanElements(isNext = false){
        document.querySelectorAll('.check-answer').forEach(btn => btn.remove());
        document.querySelectorAll('.speed-control').forEach(ctrl => ctrl.remove());
        document.querySelectorAll('.range-label').forEach(label => label.remove());
        if (isNext) this.cleanNextLevelButton();
    },

    cleanupPreviousMode(isApply = false) {
        if (isApply){
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
                const row = document.querySelector(`.level-row[data-level="${this.currentLevel}"]`);
                if (row) {
                    this.nextLevelApply(row);
                }
            }
        }
    },

    showCurrentMode() {
        const appContainer = document.getElementById('app');
        if (this.currentLevel == this.power) {
            appContainer.innerHTML = "";
            appContainer.innerHTML = this.getModeTemplate();

            const multiplyTypeSelect = document.getElementById('multiply-type');
            if (multiplyTypeSelect) {
                multiplyTypeSelect.value = this.multiplyType;
            }

            this.bindApplyButton();
        }

        let levelsContainer = document.getElementById('levels-container');
        if (!levelsContainer) {
            levelsContainer = document.createElement('div');
            levelsContainer.id = 'levels-container';
            appContainer.appendChild(levelsContainer);
        }

        if (!document.querySelector(`.level-row[data-level="${this.currentLevel}"]`)) {
            this.addLevelRow(levelsContainer);
        }

        switch (this.currentMode) {
            case 'demonstration':
                this.initDemonstrationLevel();
                break;
            case 'training':
                this.initTrainingLevel();
                break;
            case 'check':
                this.initCheckLevel();
                break;
        }
    },

    addLevelRow(container) {
        let rowTemplate;
        if (this.currentMode === 'demonstration') {
            rowTemplate = resultRowWithControlsTemplate;
        } else if (this.currentMode === 'check') {
            rowTemplate = resultRowWithCheckTemplate;
        } else {
            rowTemplate = resultRowTemplate;
        }
        
        const row = document.createElement('div');
        row.className = 'level-row';
        row.dataset.level = this.currentLevel;
        row.innerHTML = rowTemplate;
        
        const textContainer = row.querySelector('.result-text-container');
        textContainer.textContent = this.currentInfo;
        
        container.appendChild(row);
    },

    prepareLevel() {
        if (!AppState.graph) {
            showErrorCreateGraphMessage();
            return;
        }

        this.answerGraph = new Graph;
        this.answerGraph.clone(AppState.graph);

        switch(this.multiplyType){
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
        for (let i = 0; i < AppState.graph.size; i++){
            for (let j = 0; j < AppState.graph.size; j++){
                this.newGraph.changeEdge(i, j, -1);
            }
        }

        this.showCurrentMode();
    },

    initDemonstrationLevel() {
        const row = document.querySelector(`.level-row[data-level="${this.currentLevel}"]`);
        const currentLevelBeforeChange = this.currentLevel;
        
        renderMatrixDemonstration(this.newGraph, row, this.answerGraph);
        if (this.isNext){
            this.cleanElements(true);
            if (this.currentLevel - 1 < this.maxLevel) {
                this.nextLevelApply(row);
            }
            else {
                this.addToStorage();
            }
        }
        else{
            const checkGood = () => {
                if (checkMatrixCompletion(this.newGraph.Matrix, this.answerGraph.Matrix)) {
                    this.cleanElements();
                    this.currentLevel = currentLevelBeforeChange + 1;
                    if (this.currentLevel - 1 < this.maxLevel) {
                        this.nextLevelApply(row);
                    } 
                    else {
                        this.addToStorage();
                        renderMatrix(this.answerGraph, row.querySelector('.result-matrix-container'), true);
                    }
                    return;
                }
                window.currentCheck = setTimeout(checkGood, 1000);
            }
            checkGood()
        }
    },

    initTrainingLevel() {
        const row = document.querySelector(`.level-row[data-level="${this.currentLevel}"]`);
        
        renderMatrixTraining(this.newGraph, row, this.answerGraph, () => {
            if (!this.isNext) this.currentLevel++;
            if (this.currentLevel - 1 < this.maxLevel) {
                this.nextLevelApply(row);
            }
            else {
                this.addToStorage();
            }
        });
    },

    initCheckLevel() {
        const row = document.querySelector(`.level-row[data-level="${this.currentLevel}"]`);
        const checkButton = row.querySelector('.check-answer');
        
        renderMatrixCheck(this.newGraph, row, this.answerGraph);
        checkButton.removeEventListener('click', this.handleCheckClick);

        if (this.isNext){
            this.cleanElements(true);
            if (this.currentLevel - 1 < this.maxLevel) {
                this.nextLevelApply(row);
            }
            else {
                this.addToStorage();
            }
        }
        else {
            this.handleCheckClick = () => {
                document.querySelectorAll('.completion-message, .fail-message').forEach(el => el.remove());

                const isCorrect = checkMatrixCompletion(this.newGraph.Matrix, this.answerGraph.Matrix);

                if (isCorrect) {
                    showCompletionMessage();
                    this.cleanElements();
                    lockMatrixInputs(row.querySelector('.result-matrix-container'));
                    this.currentLevel++;
                    if (this.currentLevel - 1 < this.maxLevel) {
                        this.nextLevelApply(row);
                    }
                    else {
                        this.addToStorage();
                    }
                } else {
                    showFailMessage();
                }
            };
        }

        checkButton.addEventListener('click', this.handleCheckClick);
    },

    nextLevelApply(row){
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
        this.prepareLevel();

        this.outputStorage();
    },

    getMultiplyTypeName(multiplyType) {
        switch(multiplyType) {
            case 'classic': return "Классическое";
            case 'logical': return "Логическое";
            case 'tropical': return "Тропическое";
            default: return "";
        }
    },

    updateInfo() {
        this.multiplyType = document.getElementById('multiply-type').value;
        this.power = document.getElementById('power').value;
        this.currentInfo = this.getLevelInfo(this.currentLevel);
    },

    addToStorage() {
        if (this.storedLevels.length < this.maxLevel && this.currentLevel - 1 <= this.maxLevel){
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
            const { currentLevel, storedGraph, multiplyType  } = level;
            
            const row = document.createElement('div');
            row.className = 'level-row';
            row.dataset.level = currentLevel;

            row.innerHTML = resultRowTemplate;
            
            const textContainer = row.querySelector('.result-text-container');
            textContainer.textContent = this.getLevelInfo(currentLevel, multiplyType);
            
            renderMatrix(storedGraph, row.querySelector('.result-matrix-container'), true);
            displayGraph(storedGraph, row.querySelector('.result-graph-container'));
            
            levelsContainer.appendChild(row);
        });
    },

    getLevelInfo(level, multiplyType = this.multiplyType) {
        const typeName = this.getMultiplyTypeName(multiplyType);
        return `Тип умножения: ${typeName}\nСтепень: ${level}`;
    }
};