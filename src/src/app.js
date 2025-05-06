// app.js
import { SelectManager } from './select-start-graph.js';
import { Router } from './router.js';
import { Graph } from './base-graph.js';
import { renderMatrix, displayGraph, clearResults } from './print-graph.js';
import { showErrorSelectMessage } from './messages.js';

export const AppState = {
    graph: null
};

function hiddenElements() {
    if (document.getElementById("check-answer")){
        document.getElementById("check-answer").classList.add("hidden");
    }
    if (document.getElementById("speed-control")){
        document.getElementById("speed-control").classList.add("hidden");
        const speedLabel = document.querySelector('.range-label');
        if (speedLabel) speedLabel.classList.add("hidden");
    }
};

document.addEventListener('DOMContentLoaded', () => {

    SelectManager.init(); 
    
    Router.init();
    
    document.getElementById('generate-graph').addEventListener('click', () => {
        if (SelectManager.getVertexCount() == -1){
            showErrorSelectMessage();
        }
        else {
            clearResults();

            hiddenElements();

            Router.cleanupPreviousMode(true);
            
            const countVertex = SelectManager.getVertexCount();
            const countEdges = SelectManager.getEdgeCount();
            const graphType = SelectManager.getGraphType();

            let coef = 1;
            if (graphType == "SYMM"){
                coef = 2;
            }
            const currentProbability = countEdges / (countVertex + countVertex * (countVertex - 1) / coef);
            AppState.graph = new Graph(countVertex, currentProbability, graphType);
            renderMatrix(AppState.graph, "matrix-container");
            displayGraph(AppState.graph, "graph-container")
        }
    });

});