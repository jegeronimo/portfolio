// Import perlin noise library
import * as ChriscoursesPerlinNoise from "https://esm.sh/@chriscourses/perlin-noise";

// Editable values
const thresholdIncrement = 5;
const thickLineThresholdMultiple = 3;
const res = 10;
const baseZOffset = 0.00035;
const lineColor = '#{{ site.color.secondary }}20'; // Using secondary color with 12% opacity

let canvas;
let ctx;
let inputValues = [];

let currentThreshold = 0;
let cols = 0;
let rows = 0;
let zOffset = 0;
let zBoostValues = [];
let noiseMin = 100;
let noiseMax = 0;

let lastFrameTime = 0;
const targetFPS = 30;

function initTopography() {
    setupCanvas();
    animate();
}

function setupCanvas() {
    canvas = document.getElementById('topography-canvas');
    ctx = canvas.getContext('2d');
    
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

    canvasSize();
    window.addEventListener('resize', canvasSize);
}

function canvasSize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    cols = Math.floor(canvas.width / res) + 1;
    rows = Math.floor(canvas.height / res) + 1;
    
    // Reuse or reinitialize inputValues and zBoostValues
    if (!Array.isArray(inputValues) || inputValues.length !== rows) {
        inputValues = Array.from({ length: rows }, () => Array(cols + 1).fill(0));
    } else {
        for (let y = 0; y < rows; y++) {
            if (!Array.isArray(inputValues[y]) || inputValues[y].length !== cols + 1) {
                inputValues[y] = Array(cols + 1).fill(0);
            }
        }
    }
    if (!Array.isArray(zBoostValues) || zBoostValues.length !== rows) {
        zBoostValues = Array.from({ length: rows }, () => Array(cols).fill(0));
    } else {
        for (let y = 0; y < rows; y++) {
            if (!Array.isArray(zBoostValues[y]) || zBoostValues[y].length !== cols) {
                zBoostValues[y] = Array(cols).fill(0);
            }
        }
    }
}

function animate(now) {
    if (now - lastFrameTime < 1000 / targetFPS) {
        requestAnimationFrame(animate);
        return;
    }
    lastFrameTime = now;
    const startTime = performance.now();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    zOffset += baseZOffset;
    generateNoise();
    
    const roundedNoiseMin = Math.floor(noiseMin / thresholdIncrement) * thresholdIncrement;
    const roundedNoiseMax = Math.ceil(noiseMax / thresholdIncrement) * thresholdIncrement;
    
    for (let threshold = roundedNoiseMin; threshold < roundedNoiseMax; threshold += thresholdIncrement) {
        currentThreshold = threshold;
        renderAtThreshold();
    }
    
    noiseMin = 100;
    noiseMax = 0;
    
    requestAnimationFrame(animate);
}

function generateNoise() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x <= cols; x++) {
            inputValues[y][x] = ChriscoursesPerlinNoise.noise(x * 0.02, y * 0.02, zOffset + zBoostValues[y]?.[x]) * 100;
            if (inputValues[y][x] < noiseMin) noiseMin = inputValues[y][x];
            if (inputValues[y][x] > noiseMax) noiseMax = inputValues[y][x];
            if (zBoostValues[y]?.[x] > 0) {
                zBoostValues[y][x] *= 0.99;
            }
        }
    }
}

function renderAtThreshold() {
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = currentThreshold % (thresholdIncrement * thickLineThresholdMultiple) === 0 ? 2 : 1;

    for (let y = 0; y < inputValues.length - 1; y++) {
        for (let x = 0; x < inputValues[y].length - 1; x++) {
            if (inputValues[y][x] > currentThreshold && inputValues[y][x + 1] > currentThreshold && 
                inputValues[y + 1][x + 1] > currentThreshold && inputValues[y + 1][x] > currentThreshold) continue;
            if (inputValues[y][x] < currentThreshold && inputValues[y][x + 1] < currentThreshold && 
                inputValues[y + 1][x + 1] < currentThreshold && inputValues[y + 1][x] < currentThreshold) continue;
            
            let gridValue = binaryToType(
                inputValues[y][x] > currentThreshold ? 1 : 0,
                inputValues[y][x + 1] > currentThreshold ? 1 : 0,
                inputValues[y + 1][x + 1] > currentThreshold ? 1 : 0,
                inputValues[y + 1][x] > currentThreshold ? 1 : 0
            );

            placeLines(gridValue, x, y);
        }
    }
    ctx.stroke();
}

function placeLines(gridValue, x, y) {
    let nw = inputValues[y][x];
    let ne = inputValues[y][x + 1];
    let se = inputValues[y + 1][x + 1];
    let sw = inputValues[y + 1][x];
    let a, b, c, d;

    switch (gridValue) {
        case 1:
        case 14:
            c = [x * res + res * linInterpolate(sw, se), y * res + res];
            d = [x * res, y * res + res * linInterpolate(nw, sw)];
            line(d, c);
            break;
        case 2:
        case 13:
            b = [x * res + res, y * res + res * linInterpolate(ne, se)];
            c = [x * res + res * linInterpolate(sw, se), y * res + res];
            line(b, c);
            break;
        case 3:
        case 12:
            b = [x * res + res, y * res + res * linInterpolate(ne, se)];
            d = [x * res, y * res + res * linInterpolate(nw, sw)];
            line(d, b);
            break;
        case 11:
        case 4:
            a = [x * res + res * linInterpolate(nw, ne), y * res];
            b = [x * res + res, y * res + res * linInterpolate(ne, se)];
            line(a, b);
            break;
        case 5:
            a = [x * res + res * linInterpolate(nw, ne), y * res];
            b = [x * res + res, y * res + res * linInterpolate(ne, se)];
            c = [x * res + res * linInterpolate(sw, se), y * res + res];
            d = [x * res, y * res + res * linInterpolate(nw, sw)];
            line(d, a);
            line(c, b);
            break;
        case 6:
        case 9:
            a = [x * res + res * linInterpolate(nw, ne), y * res];
            c = [x * res + res * linInterpolate(sw, se), y * res + res];
            line(c, a);
            break;
        case 7:
        case 8:
            a = [x * res + res * linInterpolate(nw, ne), y * res];
            d = [x * res, y * res + res * linInterpolate(nw, sw)];
            line(d, a);
            break;
        case 10:
            a = [x * res + res * linInterpolate(nw, ne), y * res];
            b = [x * res + res, y * res + res * linInterpolate(ne, se)];
            c = [x * res + res * linInterpolate(sw, se), y * res + res];
            d = [x * res, y * res + res * linInterpolate(nw, sw)];
            line(a, b);
            line(c, d);
            break;
    }
}

function line(from, to) {
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0], to[1]);
}

function linInterpolate(x0, x1, y0 = 0, y1 = 1) {
    if (x0 === x1) return 0;
    return y0 + ((y1 - y0) * (currentThreshold - x0)) / (x1 - x0);
}

function binaryToType(nw, ne, se, sw) {
    let a = [nw, ne, se, sw];
    return a.reduce((res, x) => (res << 1) | x);
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initTopography); 