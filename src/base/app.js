import { SelectManager } from './select-start-graph.js';
import { Router } from '../router/router.js';
import { Graph } from './base-graph.js';
import { renderMatrix, displayGraph, clearResults } from '../output/print-graph.js';
import { showErrorSelectMessage } from '../output/messages.js';
import { loadRangeSliderStyles, loadModeControlsStyles, loadMessagesStyles, loadLevelsStyles } from "../styles/load-styles.js";

export const AppState = {
    graph: null
};

function loadStyles() {
    loadModeControlsStyles();
    loadRangeSliderStyles();
    loadMessagesStyles();
    loadLevelsStyles();
}

document.addEventListener('DOMContentLoaded', () => {

    SelectManager.init(); 
    
    Router.init();

    loadStyles();
    
    document.getElementById('generate-graph').addEventListener('click', () => {
        if (SelectManager.getVertexCount() == -1){
            showErrorSelectMessage();
        }
        else {
            Router.cleanupPreviousMode(true);
            
            const countVertex = SelectManager.getVertexCount();
            const countEdges = SelectManager.getEdgeCount();
            const graphType = SelectManager.getGraphType();

            AppState.graph = new Graph(countVertex, countEdges, graphType);
            renderMatrix(AppState.graph, "matrix-container");
            displayGraph(AppState.graph, "graph-container", null, true);
        }
    });

});