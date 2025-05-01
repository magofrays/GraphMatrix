const {Graph, GraphGenerationType} = require('./base-graph.js');

const graph = new Graph(5, 0.5, GraphGenerationType.DEFAULT);

graph.printGraph();
console.log(`Тип графа: ${graph.GenType}`);
console.log(`Количество ребер: ${graph.EdgeNumber}`);
graph.logicalMultiply(3);
graph.printGraph();
console.log(`Тип графа: ${graph.GenType}`);
console.log(`Количество ребер: ${graph.EdgeNumber}`);