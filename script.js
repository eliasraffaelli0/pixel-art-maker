const container = document.querySelector('#grid-container');
const clearButton = document.querySelector('#clear-button');
const changeButton = document.querySelector('#change-button');
const changeColor = document.querySelector('#colorpicker');
const randomButton = document.querySelector('#random-button');
const gridLinesButton = document.querySelector('#grid-lines-button');
const eraserButton = document.querySelector("#eraser-button")
let size=16;
let paint = false;
let random = false;
let gridLines = true;
let eraser = false;
let color = "black";
//to save the last color used before eraser is activated
let colorTemp;

clearButton.addEventListener("click", resetGrid);
changeButton.addEventListener("click", changeSize);
window.addEventListener("load", setGrid);
container.addEventListener("click", setPainting);
randomButton.addEventListener("click", setRandom);
changeColor.addEventListener('input', chooseColor);
eraserButton.addEventListener("click", toggleEraser);
gridLinesButton.addEventListener("click", toggleGridLines);

function toggleEraser() {
    if (!eraser){
        colorTemp = color;
        console.log(colorTemp)
        color = "#FFF";
        eraser = true;
        random = false;
        eraserButton.style.backgroundColor = "#333";
        eraserButton.style.border = "2px solid #222";
        eraserButton.style.color = "#FFF"
    } else {
        color = colorTemp;
        eraser = false;
        eraserButton.style.backgroundColor = "#F0EEEE";
        eraserButton.style.border = "2px solid #d3dae8";
        eraserButton.style.color = "#000"
    }
}

function setColor() {
    (random) ? color = randomColor() : color;
    return color;
}

function setRandom() {
    random = true;
}

function toggleGridLines () {
    let allItems = container.childNodes; 
    if (gridLines) {
        allItems.forEach(item => (item.style.border = "white"));
        gridLines = false;
    } else {
        allItems.forEach(item => (item.style.border = "1px solid rgb(0, 0, 0)"));
        gridLines = true;
    }
}

function chooseColor() {
    random = false;
    color = this.value;
}

function setGrid() {
    let i, j;
    for (i=0; i<size; i++){
        for (j=0; j<size; j++){
            let grd = document.createElement('div');
            grd.classList.add('gridItem');
            grd.setAttribute('onmouseover', 'mouseOver(this)');
            container.appendChild(grd);
        }
    }
}

function setPainting() {
    paint = !paint;
}

function randomColor() {
    let colorStr = 'rgb(';
    let randomNum = Math.floor(Math.random()* 255);
    colorStr+=randomNum +',';
    randomNum = Math.floor(Math.random()* 255);
    colorStr+=randomNum+',';
    randomNum = Math.floor(Math.random()* 255);
    colorStr+=randomNum+')';
    return colorStr;
}

function mouseOver(aItem){
    if (paint) aItem.style.backgroundColor =  setColor();
}

function resetGrid() {
    let allItems = container.childNodes; 
    allItems.forEach(item => (item.style.backgroundColor = "white"));
}

function changeSize() {
    let newSize = prompt('Enter a new size between 1 and 80! :)');
    if (newSize !== null){
        if ((isNaN(newSize)) || (newSize < 1 || newSize > 80)) {
            alert('The number has to be between 0 and 80!');
            changeSize();
        } else {
            size = parseInt(newSize);
            clearGrid();
            container.style.gridTemplateColumns = `repeat(${size}, 1fr)`
            setGrid();
        }
    }
}

function clearGrid(){
    Array.from(container.childNodes).forEach(item => container.removeChild(item))
}