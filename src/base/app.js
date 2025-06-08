import {
    showErrorSelectEdgesMessage,
    showErrorSelectMessage
} from '../output/messages.js';
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

/**
 * Инициализация приложения после полной загрузки DOM.
 *
 * Подписывается на событие `DOMContentLoaded`, создаёт:
 * - менеджер выбора параметров графа (`SelectManager`),
 * - маршрутизатор (`Router`),
 * - загружает стили,
 * - добавляет обработчик кнопки "Сгенерировать граф".
 */
document.addEventListener('DOMContentLoaded', () => {
    const selectManager = new SelectManager();
    const router = new Router();
    loadStyles();

    /**
     * Обработчик нажатия на кнопку генерации графа.
     *
     * Проверяет, выбрано ли количество вершин. Если нет — выводит ошибку.
     * В противном случае:
     * - перезапускает текущий маршрут,
     * - создаёт новый граф,
     * - отображает матрицу и граф визуально.
     */
    document.getElementById('generate-graph').addEventListener('click', () => {
        if (selectManager.getVertexCount() == -1) {
            showErrorSelectMessage();
        } else {
            const countVertex = selectManager.getVertexCount();
            router.restart(countVertex);
            const countEdges = selectManager.getEdgeCount();
            if (countEdges == -1) {
                showErrorSelectEdgesMessage();
                return;
            }
            const graphType = selectManager.getGraphType();
            AppState.graph = new Graph(countVertex, countEdges, graphType);
            router.createGlobalContent();
        }
    });
});
