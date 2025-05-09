import { SelectManager } from './select-start-graph.js';
import { Router } from '../router/router.js';
import { Graph } from './base-graph.js';
import { renderMatrix, displayGraph, clearResults } from '../output/print-graph.js';
import { showErrorSelectMessage } from '../output/messages.js';

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

            AppState.graph = new Graph(countVertex, countEdges, graphType);
            renderMatrix(AppState.graph, "matrix-container");
            displayGraph(AppState.graph, "graph-container")
        }
    });

});