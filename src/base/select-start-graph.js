export const SelectManager = {
    init() {
        this.graphType = document.getElementById('graph-type')
        this.vertexCount = document.getElementById('vertex-count');
        this.edgeCount = document.getElementById('edge-count');
        this.setupEvents();
    },

    setupEvents() {
        this.vertexCount.addEventListener('change', () => this.updateEdgeCount());
        this.graphType.addEventListener('change', () => this.updateEdgeCount());
    },
  
    getMaxValue(selectedValue) {
        if (this.graphType.value === "SYMM" || this.graphType.value == "ANTISYMM"){
            return selectedValue + selectedValue * (selectedValue - 1) / 2;
        }
        if (this.graphType.value === "ASYMM"){
            return selectedValue * (selectedValue - 1) / 2
        }
        else{
            return selectedValue * selectedValue;
        }
    },
  
    updateEdgeCount() {
        const value = this.vertexCount.value;
        this.edgeCount.innerHTML = '';
        
        if (value == "-1"){
            this.edgeCount.add(new Option("Не выбрано", "-1"));
            this.edgeCount.disabled = true;
        }
        else{
            this.edgeCount.disabled = false;
        
            if (value) {
                const max = this.getMaxValue(parseInt(value));
                for (let i = 0; i <= max; i++) {
                    const option = new Option(i, i);
                    this.edgeCount.add(option);
                }
            }
        }
    },

    getGraphType() {
        return this.graphType.value;
    },

    getEdgeCount() {
        return parseInt(this.edgeCount.value);
    },

    getVertexCount() {
        return parseInt(this.vertexCount.value);
    }
};