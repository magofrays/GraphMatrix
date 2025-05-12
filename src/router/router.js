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

    cleanElements(){
        document.querySelectorAll('.check-answer').forEach(btn => btn.remove());
        document.querySelectorAll('.speed-control').forEach(ctrl => ctrl.remove());
        document.querySelectorAll('.range-label').forEach(label => label.remove());
    },

    cleanupPreviousMode(isApply = false) {
        if (isApply){
            this.storedLevels = [];
        }
        if (window.currentAnimation) {
            clearTimeout(window.currentAnimation);
        }

        const levelsContainer = document.getElementById('levels-container');
        if (levelsContainer) {
            levelsContainer.innerHTML = '';
        }
        
        this.cleanElements();
    },

    initializeMode() {
        if (this.newGraph && this.answerGraph) {
            if (this.currentLevel <= this.maxLevel) {
                this.showCurrentMode();
            }
            this.outputStorage();
        }
    },

    showCurrentMode(isStorage = false) {
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

        if (!isStorage){
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

            if (route.init) route.init.call(this);
        }
    },

    bindApplyButton() {
        const applyBtn = document.getElementById('apply-multiply');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.cleanupPreviousMode(true);
                this.currentLevel = parseInt(document.getElementById('power').value);
                this.updateInfo();
                this.allLogic();
            });
        }
    },

    allLogic() {        
        if (!AppState.graph) {
            showErrorCreateGraphMessage();
            return;
        }
        
        this.prepareLevel();
    },

    prepareLevel() {
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
        
        renderMatrixDemonstration(this.newGraph, row, this.answerGraph);
        const checkGood = () => {
            if (checkMatrixCompletion(this.newGraph.Matrix, this.answerGraph.Matrix)) {
                this.cleanElements();
                this.addToStorage();
                this.currentLevel++;
                if (this.currentLevel - 1 < this.maxLevel) {
                    this.printNext();
                    this.initDemonstrationLevel();
                } 
                else {
                    renderMatrix(this.answerGraph, row.querySelector('.result-matrix-container'), true);
                }
                return;
            }
            setTimeout(checkGood, 1000);
        }
        checkGood()
    },

    initTrainingLevel() {
        const row = document.querySelector(`.level-row[data-level="${this.currentLevel}"]`);
        
        renderMatrixTraining(this.newGraph, row, this.answerGraph, () => {
            this.addToStorage();
            this.currentLevel++;
            if (this.currentLevel - 1 < this.maxLevel) {
                this.printNext()
                this.initTrainingLevel();
            }
        });
    },

    initCheckLevel() {
        const row = document.querySelector(`.level-row[data-level="${this.currentLevel}"]`);
        const checkButton = row.querySelector('.check-answer');
        
        renderMatrixCheck(this.newGraph, row, this.answerGraph);
        checkButton.removeEventListener('click', this.handleCheckClick);

        this.handleCheckClick = () => {
            document.querySelectorAll('.completion-message, .fail-message').forEach(el => el.remove());

            const isCorrect = checkMatrixCompletion(this.newGraph.Matrix, this.answerGraph.Matrix);

            if (isCorrect) {
                showCompletionMessage();
                this.cleanElements();
                lockMatrixInputs(row.querySelector('.result-matrix-container'));
                this.addToStorage();
                this.currentLevel++;
                if (this.currentLevel - 1 < this.maxLevel) {
                    this.printNext();
                    this.initCheckLevel();
                }
            } else {
                showFailMessage();
            }
        };

        checkButton.addEventListener('click', this.handleCheckClick);
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

    clearGraphs() {
        this.newGraph = null;
        this.answerGraph = null;
    },

    updateInfo() {
        this.multiplyType = document.getElementById('multiply-type').value;
        this.power = document.getElementById('power').value;
        this.currentInfo = this.getLevelInfo(this.currentLevel);
    },

    addToStorage() {
        if (this.storedLevels.length < this.maxLevel && this.currentLevel <= this.maxLevel){
            const storedGraph = new Graph();
            storedGraph.clone(this.answerGraph);
            const currentLevel = this.currentLevel;
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