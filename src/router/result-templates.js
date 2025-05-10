export const resultRowTemplate = `
  <div class="result-row">
    <div class="result-text-container"></div>
    <div class="result-matrix-container"></div>
    <div class="result-graph-container"></div>
  </div>
`;

export const resultRowWithControlsTemplate = `
  <div class="result-row">
    <div class="result-text-container"></div>
    <div class="result-matrix-container"></div>
    <div class="result-graph-container"></div>
    <div class="range-speed">
      <label class="range-label">Скорость</label>
      <input type="range" class="speed-control" min="200" max="3400" value="1000" class="range-input">
    </div>
  </div>
`;

export const resultRowWithCheckTemplate = `
  <div class="result-row">
    <div class="result-text-container"></div>
    <div class="result-matrix-container"></div>
    <div class="result-graph-container"></div>
    <button class="check-answer button">Проверить</button>
  </div>
`;