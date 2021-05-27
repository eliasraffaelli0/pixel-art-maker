const container = document.querySelector('#grid-container');
const clearButton = document.querySelector('#clear-button');

clearButton.addEventListener("click", resetGrid);

let i, j;
for (i=0; i<16; i++){
    for (j=0; j<16; j++){
        let grd = document.createElement('div');
        grd.classList.add('gridItem');
        grd.setAttribute('onmouseover', 'mouseOver(this)');
        container.appendChild(grd);
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