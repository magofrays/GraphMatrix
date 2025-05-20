import {showErrorSelectMessage} from '../output/messages.js';
import {
    clearResults,
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
        if (SelectManager.getVertexCount() == -1) {
            showErrorSelectMessage();
        } else {
            Router.loadRoute();

            const countVertex = SelectManager.getVertexCount();
            const countEdges = SelectManager.getEdgeCount();
            const graphType = SelectManager.getGraphType();

            AppState.graph = new Graph(countVertex, countEdges, graphType);
            const container = document.getElementById("controls-container");
            createContentWrapper(container);
            renderMatrix(AppState.graph, container);
            displayGraph(AppState.graph, container);
        }
    });
});