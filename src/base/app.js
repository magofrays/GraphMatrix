import {showErrorSelectMessage} from '../output/messages.js';
import {
    createContentWrapper,
    displayGraph,
    renderMatrix
} from '../output/print-graph.js';
import {Router} from '../router/router.js';
import {
    loadLevelsStyles,
    loadMessagesStyles,
    loadModeControlsStyles,
    loadRangeSliderStyles
} from "../styles/load-styles.js";

import {Graph} from './base-graph.js';
import {SelectManager} from './select-start-graph.js';

export const AppState = {
    graph : null
};

/**
 * Загружает стили в документ
 */
function loadStyles() {
    loadModeControlsStyles();
    loadRangeSliderStyles();
    loadMessagesStyles();
    loadLevelsStyles();
}

document.addEventListener('DOMContentLoaded', () => {
    const selectManager = new SelectManager();

    const router = new Router();

    loadStyles();

    document.getElementById('generate-graph').addEventListener('click', () => {
        if (selectManager.getVertexCount() == -1) {
            showErrorSelectMessage();
        } else {

            router.restart();

            const countVertex = selectManager.getVertexCount();
            const countEdges = selectManager.getEdgeCount();
            const graphType = selectManager.getGraphType();

            AppState.graph = new Graph(countVertex, countEdges, graphType);
            const container = document.getElementById("controls-container");
            createContentWrapper(container);
            renderMatrix(AppState.graph, container);
            displayGraph(AppState.graph, container);
        }
    });
});
