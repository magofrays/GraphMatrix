export class SelectManager {

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

    setupEvents() {
        document.getElementById('vertex-count')
            .addEventListener('change', () => this.updateEdgeCount());
        document.getElementById('graph-type')
            .addEventListener('change', () => this.updateEdgeCount());
    }

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

    getGraphType() { return document.getElementById('graph-type').value; }

    getVertexCount() {
        return parseInt(document.getElementById('vertex-count').value);
    }

    getMinEdges() { return this.getVertexCount() - 1; }

    getMaxEdges() { return this.getMaxValue(this.getVertexCount()); }

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

    getVertexCount() {
        return parseInt(document.getElementById('vertex-count').value);
    }
};