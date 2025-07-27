//@ts-check
import { evalinput } from "./evalf.js";

const showFullBtn = /** @type {HTMLButtonElement} */ (document.getElementById("ca-full-btn"));
let clearPrevious = () => { };
const shouldShowGrid = () => {
  const showGridCheckbox =/** @type {HTMLInputElement}*/(document.getElementById("show-grid-checkbox"));
  return showGridCheckbox.checked;
};
showFullBtn.addEventListener('click', (e) => {
  e.preventDefault();
  clearPrevious();
  const widthElem = /** @type {HTMLInputElement}*/(document.getElementById('resize-canvas-width'));
  const heightElem =  /** @type {HTMLInputElement}*/(document.getElementById('resize-canvas-height'));
  const width = widthElem.valueAsNumber;
  const height = heightElem.valueAsNumber;
  canvas.width = width;
  canvas.height = height;
  setTimeout(() => {
    const input = /** @type {HTMLInputElement} */(document.getElementById("input")).value;
    clearPrevious = drawTriangleIterations(input, input.length - 1);
    setTimeout(() => {
      widthElem.valueAsNumber = canvas.width;
      heightElem.valueAsNumber = canvas.height;
    }, 100);
  })
});
const speedElem = /** @type {HTMLInputElement}*/(document.getElementById('speed'));
const animateSingleLineBtn =  /** @type {HTMLButtonElement} */(document.getElementById("ca-animate-single-line-btn"));
animateSingleLineBtn.addEventListener('click', (e) => {
  e.preventDefault();
  clearPrevious();
  setTimeout(() => {
    input =  /** @type {HTMLInputElement} */(document.getElementById("input")).value;
    shouldStop = false;
    clearPrevious = drawOneInput(input, input.length - 1)
    window.requestAnimationFrame(iterationStep)
  });
});

const randomizerButton =  /** @type {HTMLButtonElement} */ (document.getElementById("randomize-input-btn"));
randomizerButton.addEventListener('click', e => {
  e.preventDefault();
  const inputLen =  /** @type {HTMLInputElement} */(document.getElementById('randomizer-input')).valueAsNumber;
  const isSparse = /** @type {HTMLInputElement} */(document.querySelector('input[name="randomizer-is-sparse"]:checked')).value === "sparse";
  const s = generateBinaryString(inputLen, isSparse);
   /** @type {HTMLInputElement} */(document.getElementById('input')).value = s;
});

const canvas = /** @type {HTMLCanvasElement}*/(document.getElementById("main"));
const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));

/**
 * @param {string[]|string} init_input
 * @param {number} n
 */
function drawTriangleIterations(init_input, n) {
  let input = init_input;
  //draw grid
  const width = canvas.width;
  const height = canvas.height;
  const len = input.length;
  let cellwidth = width / len;
  let cellheight = height / n;
  const shouldShowGridLines = shouldShowGrid();

  console.log(width, height);
  ctx.clearRect(0, 0, width, height);

  if (cellwidth < 1) {
    canvas.width = len;
    cellwidth = 1;
  }
  if (cellheight < 1) {
    canvas.height = n;
    cellheight = 1;
  }

  if (shouldShowGridLines) {
    ctx.beginPath();
    for (let i = 0; i <= len; i++) {
      ctx.moveTo(cellwidth * i, 0);
      ctx.lineTo(cellwidth * i, height);
    }
    for (let i = 0; i <= n; i++) {
      ctx.moveTo(0, cellheight * i);
      ctx.lineTo(width, cellheight * i);
    }
    ctx.stroke();
  }

  //fill the grid
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j < len; j++)
      if (input[j] == "1")
        ctx.fillRect(j * cellwidth, i * cellheight, cellwidth, cellheight);
    input = evalinput(input);
  }
  return () => ctx.clearRect(0, 0, width, height);
}


/**
 * @param {string[]|string} init_input
 * @param {number} _n
 */
function drawOneInput(init_input, _n) {
  var input = init_input;

  var width = canvas.width;
  var height = canvas.height;
  var len = input.length;
  var cellwidth = width / len;
  var cellheight = cellwidth;
  var showgrid = shouldShowGrid();

  ctx.clearRect(0, 0, width, cellheight);

  if (cellwidth <= 1) {
    canvas.width = len;
    cellwidth = 1;
    showgrid = false;
  }

  if (showgrid) {
    ctx.beginPath();
    for (var i = 0; i <= len; i++) {
      ctx.moveTo(cellwidth * i, 0);
      ctx.lineTo(cellwidth * i, cellheight);
    }
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.moveTo(0, cellheight);
    ctx.lineTo(width, cellheight);
    ctx.stroke();
  }

  ctx.fillStyle = '#000';
  for (var j = 0; j < len; j++) {
    if (input[j] == "1")
      ctx.fillRect(j * cellwidth, 0, cellwidth, cellheight);
  }
  return () => {
    shouldStop = true;
    ctx.clearRect(0, 0, width, height);
  }
}

/** @type {string|string[]}*/
var input = "0".repeat(500) + "10";
//var input = "0010001001";

let shouldStop = false;
let start = 0;
/**
 * @param {number} timestamp
 * */
function iterationStep(timestamp) {
  const speed = speedElem.valueAsNumber;
  const time_interval = 1000 - speed;
  const elapsed = timestamp - start;

  if (elapsed > time_interval) {
    start = timestamp;
    input = evalinput(input);
    //console.log(input);
    drawOneInput(input, input.length - 1)
  }

  if (!shouldStop) {
    window.requestAnimationFrame(iterationStep);
  }
}


//drawOneInput(input, input.length-1);
//window.requestAnimationFrame(iterationStep);

/**
 * @param {number} n
 * @param {boolean} isSparse
 */
function generateBinaryString(n, isSparse) {
  if (n <= 0) {
    return "";
  }
  let result = "";
  for (let i = 0; i < n; i++) {
    if (isSparse) {
      result += Math.round(Math.random() * 4) === 0 ? "1" : "0"; // ~20% chance of being 1
    } else {
      result += Math.round(Math.random());
    }
  }
  const oneCount = result.split('').map(Number).reduce((acc, current) => acc + current, 0);
  console.log("number of 1s", oneCount, " / ", n, " i.e. ", oneCount / n);
  return result;
}


