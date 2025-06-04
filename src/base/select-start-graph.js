/**
 * Класс, управляющий выпадающими списками выбора параметров графа.
 *
 * @class SelectManager
 * @property {TomSelect} graphType - Выбор типа графа (например, SYMM, ASYMM).
 * @property {TomSelect} vertexCount - Выбор количества вершин графа.
 * @property {TomSelect} edgeCount - Выбор количества рёбер графа.
 */
export class SelectManager {
    /**
     * Инициализирует выпадающие списки и настраивает обработчики событий.
     */
    constructor() {
        this.graphType = new TomSelect('#graph-type', {
            create : false,
            persist : false,
            allowEmptyOption : false,
            onInitialize : function() { this.sync(); }
        });

        this.vertexCount = new TomSelect('#vertex-count', {
            create : false,
            persist : false,
            allowEmptyOption : false,
            onInitialize : function() { this.sync(); }
        });

        this.edgeCount = new TomSelect('#edge-count', {
            create : false,
            createOnBlur : false,
            persist : false,
            maxOptions : null,
            placeholder : 'Не выбрано',
            onInitialize : function() { this.disable(); },
            onType : function(str) { return str.replace(/[^\d]/g, ''); }
        });
        this.setupEvents();
    }

    /**
     * Настраивает обработчики событий изменения значений в полях выбора.
     */
    setupEvents() {
        document.getElementById('vertex-count')
            .addEventListener('change', () => this.updateEdgeCount());
        document.getElementById('graph-type')
            .addEventListener('change', () => this.updateEdgeCount());
    }

    /**
     * Возвращает максимальное возможное количество рёбер в зависимости от типа
     * графа.
     *
     * @param {number} selectedValue - Количество вершин графа.
     * @returns {number} Максимальное количество рёбер.
     */
    getMaxValue(selectedValue) {
        const currentType = this.graphType.getValue();
        if (currentType === "SYMM" || currentType == "ANTISYMM") {
            return selectedValue + selectedValue * (selectedValue - 1) / 2;
        }
        if (currentType === "ASYMM") {
            return selectedValue * (selectedValue - 1) / 2
        } else {
            return selectedValue * selectedValue;
        }
    }

    /**
     * Обновляет доступные значения для количества рёбер на основе количества
     * вершин и типа графа.
     */
    updateEdgeCount() {
        const vertexCount = this.getVertexCount();
        const min = vertexCount - 1;
        const max = this.getMaxValue(vertexCount);

        const currentValue = this.edgeCount.getValue();
        let newValue;
        const numericValue = parseInt(
            Array.isArray(currentValue) ? currentValue[0] : currentValue);
        if (!isNaN(numericValue) && numericValue >= min &&
            numericValue <= max) {
            newValue = numericValue;
        } else {
            newValue = min;
        }

        const edgeCountSelect = document.getElementById('edge-count');
        edgeCountSelect.innerHTML = '';

        if (vertexCount == "-1") {
            this.edgeCount.clear();
            this.edgeCount.clearOptions();
            this.edgeCount.addOption({value : "-1", text : "Не выбрано"});
            this.edgeCount.disable();
            return;
        }
        this.edgeCount.enable();
        this.edgeCount.clearOptions();

        const options = [];

        for (let i = min; i <= max; i++) {
            options.push({value : i.toString(), text : i.toString()});
        }

        this.edgeCount.addOptions(options);

        setTimeout(() => {
            this.edgeCount.setValue(newValue.toString(), true);
            this.edgeCount.sync();
        }, 50);
    }

    /**
     * Возвращает текущий тип графа из выпадающего списка.
     *
     * @returns {string} Тип графа (например, 'SYMM', 'ASYMM').
     */
    getGraphType() { return document.getElementById('graph-type').value; }

    /**
     * Возвращает количество вершин, выбранное пользователем.
     *
     * @returns {number} Количество вершин. Возвращает -1, если значение не
     *     задано или некорректно.
     */
    getVertexCount() {
        return parseInt(document.getElementById('vertex-count').value);
    }

    /**
     * Возвращает минимально допустимое количество рёбер (обычно vertexCount -
     * 1).
     *
     * @returns {number} Минимальное количество рёбер.
     */
    getMinEdges() { return this.getVertexCount() - 1; }

    /**
     * Возвращает максимально допустимое количество рёбер в зависимости от типа
     * графа.
     *
     * @returns {number} Максимальное количество рёбер.
     */
    getMaxEdges() { return this.getMaxValue(this.getVertexCount()); }

    /**
     * Возвращает количество рёбер, выбранное пользователем.
     *
     * @returns {number} Количество рёбер. Возвращает -1, если значение
     *     некорректно.
     */
    getEdgeCount() {
        const value = this.edgeCount.getValue();
        if (!value)
            return -1;

        const numValue = parseInt(Array.isArray(value) ? value[0] : value);
        const min = this.getMinEdges();
        const max = this.getMaxEdges();
        if (isNaN(numValue) || numValue < min || numValue > max) {
            return -1;
        }
        return numValue;
    }
};