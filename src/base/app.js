import {
    showErrorSelectEdgesMessage,
    showErrorSelectMessage
} from '../output/messages.js';
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
    graph : null,
    power: 2
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

export function generateNewGraph(router, countVertex, countEdges, graphType, isRestart = true){
    if (isRestart){
        router.restart(countVertex);
    }
    if (countEdges == -1) {
        showErrorSelectEdgesMessage();
        return;
    }
    AppState.graph = new Graph(countVertex, countEdges, graphType);
    router.createGlobalContent();
}


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
            const countEdges = selectManager.getEdgeCount();
            const graphType = selectManager.getGraphType();
            generateNewGraph(router, countVertex, countEdges, graphType);
        }
    });
});
