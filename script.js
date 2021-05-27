const container = document.querySelector('#grid-container');
const clearButton = document.querySelector('#clear-button');
const changeButton = document.querySelector('#change-button');
let size=16;

clearButton.addEventListener("click", resetGrid);
changeButton.addEventListener("click", changeSize);
window.addEventListener("load", setGrid);

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
    aItem.style.backgroundColor = randomColor();
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