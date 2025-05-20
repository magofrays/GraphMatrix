export const resultRowTemplate = `
  <div class="result-row">
    <div class="result-info">
        <div class="result-text-container"></div>
    </div>
  </div>
`;

export const resultRowWithControlsTemplate = `
  <div class="result-row">
    <div class="result-info">
        <div class="result-text-container"></div>
        <div class="range-speed">
            <label class="range-label"><b>Скорость</b></label>
            <input type="range" class="speed-control" min="200" max="3400" value="1000" class="range-input">
        </div>
    </div>
  </div>
`;

export const resultRowWithCheckTemplate = `
    <div class="result-row">
        <div class="result-info">
            <div class="result-text-container"></div>
            <button class="check-answer button">Проверить</button>
        </div>
    </div>
`;