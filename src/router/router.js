import { demonstrationTemplate, trainingTemplate, checkTemplate } from "./templates.js";
import { AppState } from '../base/app.js';
import { Graph } from "../base/base-graph.js";
import { renderMatrixTraining, renderMatrixCheck, renderMatrixDemonstration, displayGraph } from "../output/print-graph.js";
import { showErrorCreateGraphMessage } from "../output/messages.js";

export const Router = {
    currentMode: null,
    newGraph: null,
    answerGraph: null,
    animationId: null, 
    currentInfo: "",
    
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

    cleanupPreviousMode(isNewGraph = false) {
        if (window.currentAnimation) {
            clearTimeout(window.currentAnimation);
        }
        
        if (document.getElementById("check-answer")) {
            document.getElementById("check-answer").classList.add("hidden");
        }
        if (document.getElementById("speed-control")) {
            document.getElementById("speed-control").classList.add("hidden");
            const speedLabel = document.querySelector('.range-label');
            if (speedLabel) speedLabel.classList.add("hidden");
        }

        if (isNewGraph) this.clearGraphs();
    },

    initializeMode() {
        if (this.newGraph && this.answerGraph) {
            this.showCurrentMode();
        }
    },

    showCurrentMode() {
        document.getElementById("new-text-container").textContent = this.currentInfo;

        switch (this.currentMode) {
            case 'demonstration':
                document.getElementById("speed-control").classList.remove("hidden");
                document.querySelector('.range-label').classList.remove("hidden");
                this.demonstrationLogic();
                break;
            case 'training':
                this.trainingLogic();
                break;
            case 'check':
                document.getElementById("check-answer").classList.remove("hidden");
                this.checkLogic();
                break;
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
            if (window.currentAnimation) {
                clearTimeout(window.currentAnimation);
            }

            document.getElementById('app').innerHTML = route.template;

            const applyBtn = document.getElementById('apply-multiply');
            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    this.updateInfo();
                    this.allLogic();
                });
            }

            if (route.init) route.init.call(this);
        }
    },

    allLogic() {        
        if (!AppState.graph) {
            showErrorCreateGraphMessage();
            return;
        }

        this.answerGraph = new Graph;
        this.answerGraph.clone(AppState.graph);

        switch(this.multiplyType){
            case 'classic':
                this.answerGraph.classicMultiply(this.power);
                break;
            case 'logical':
                this.answerGraph.logicalMultiply(this.power);
                break;
            case 'tropical':
                this.answerGraph.tropicalMultiply(this.power);
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

    demonstrationLogic() {
        if (window.currentAnimation) {
            clearTimeout(window.currentAnimation);
        }

        renderMatrixDemonstration(this.newGraph, "new-matrix-container", this.answerGraph);
        displayGraph(this.newGraph, "new-graph-container", this.answerGraph);
    },

    trainingLogic() {
        renderMatrixTraining(this.newGraph, "new-matrix-container", this.answerGraph);
        displayGraph(this.newGraph, "new-graph-container", this.answerGraph)
    },

    checkLogic() {
        renderMatrixCheck(this.newGraph, "new-matrix-container", this.answerGraph);
        displayGraph(this.newGraph, "new-graph-container")
    },

    clearGraphs() {
        this.newGraph = null;
        this.answerGraph = null;
        document.getElementById("new-text-container").textContent = "";
    },

    updateInfo() {
        this.multiplyType = document.getElementById('multiply-type').value;
        this.power = parseInt(document.getElementById('power').value);

        let type = "";
        switch (this.multiplyType){
            case 'classic':
                type = "Классическое";
                break;
            case 'logical':
                type = "Логическое";
                break;
            case 'tropical':
                type = "Тропическое";
                break;
        }

        this.currentInfo = "Тип умножения: " + type + "\nСтепень: " + String(this.power); 
    },
};