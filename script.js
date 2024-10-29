const MAX_HISTORY_SIZE = 200;
const MAX_COLOR_HISTORY_SIZE = 10;
let colorHistory = [];

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
//para guardar el ultimo colo usado antes de que activen el eraser:
let colorTemp;
const undoButton = document.querySelector('#undo-button');
const redoButton = document.querySelector('#redo-button');
let history = [];
let redoHistory = [];
let isPainting = false;

const shadeButton = document.querySelector('#shade-button');
let shading = false;

const lightenButton = document.querySelector('#lighten-button');
let lightening = false;

clearButton.addEventListener("click", function() {
    if (window.confirm("¿Estás segurx de que quieres limpiar el tablero?")) {
        resetGrid(); 
    }
});
changeButton.addEventListener("click", changeSize);
window.addEventListener("load", setGrid);
container.addEventListener("click", setPainting);
randomButton.addEventListener("click", setRandom);
changeColor.addEventListener('input', chooseColor);
eraserButton.addEventListener("click", toggleEraser);
gridLinesButton.addEventListener("click", toggleGridLines);
undoButton.addEventListener("click", undoStep);
redoButton.addEventListener("click", redoStep);
shadeButton.addEventListener("click", toggleShading);
lightenButton.addEventListener("click", toggleLightening);

// event listener para detectar Ctrl+Z y Ctrl+Y
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'z') {
        undoStep();
        event.preventDefault(); 
    }
    if (event.ctrlKey && event.key === 'y') {
        redoStep();
        event.preventDefault(); 
    }
});

function toggleEraser() {
    if (!eraser){
        colorTemp = color;
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
    randomButton.style.backgroundColor = "#333";
    randomButton.style.border = "2px solid #222";
    randomButton.style.color = "#FFF"
    //las siguientes lines son por si activan el color random mientras está el eraser activado
    eraser = true;
    colorTemp = color;
    toggleEraser();
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
    randomButton.style.backgroundColor = "#F0EEEE";
    randomButton.style.border = "2px solid #d3dae8";
    randomButton.style.color = "#000"

    color = this.value;

    // Las siguientes líneas son por si activan seleccionador de color mientras está el eraser activado
    eraser = true;
    colorTemp = color;
    toggleEraser();
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

    if (paint) {
        container.style.cursor = "pointer";

        // Guardar el color en el historial
        addColorToHistory(color);
        if (!isPainting) {
            // saveState(); 
            redoHistory = []; 
        }
        isPainting = true;
    } else {
        container.style.cursor = "";
        isPainting = false;
        saveState();
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

function mouseOver(aItem) {
    if (paint) {
        const currentColor = aItem.style.backgroundColor || "white";
        if (shading) {
            aItem.style.backgroundColor = darkenColor(currentColor); 
        } else if (lightening) {
            aItem.style.backgroundColor = lightenColor(currentColor);
        } else {
            aItem.style.backgroundColor = setColor(); 
        }
    }
}


function resetGrid() {
    let allItems = container.childNodes; 
    allItems.forEach(item => (item.style.backgroundColor = "white"));
    saveState();
}

function changeSize() {
    let newSize = prompt('Enter a new size between 1 and 100! :)');
    if (newSize !== null){
        if ((isNaN(newSize)) || (newSize < 1 || newSize > 100)) {
            alert('The number has to be between 1 and 100!');
            changeSize();
        } else {
            size = parseInt(newSize);
            if(size > 80) {
                container.style.width = '600px'; 
                container.style.height = '600px';
            } else {
                container.style.width = '500px'; 
                container.style.height = '500px';
            }
            clearGrid();
            container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
            setGrid();
            saveState();
        }
    }
}

function clearGrid(){
    while(container.firstChild){
        container.removeChild(container.firstChild);
    }
}

function saveState() {
    let currentGridState = [];
    container.childNodes.forEach(item => {
        currentGridState.push(item.style.backgroundColor || "white"); // Guardar el color de fondo de cada celda
    });

    history.push([...currentGridState]); // Guardar una copia del estado
    if (history.length > MAX_HISTORY_SIZE) {
        history.shift(); // Eliminar el estado más antiguo si se supera el límite
    }
}
o
function undoStep() {
    if (history.length > 1) { // Dejar al menos un estado inicial para evitar borrar todo
        redoHistory.push(history.pop());
        // Eliminar el estado más antiguo si se supera el límite
        if (redoHistory.length > MAX_HISTORY_SIZE) {
            redoHistory.shift(); 
        }
        const previousState = history[history.length - 1]; // Recuperar el penúltimo estado guardado
        restoreGrid(previousState);
    } else {
        alert('No hay más pasos para deshacer.');
    }
}

function redoStep() {
    if (redoHistory.length > 0) {
        const nextState = redoHistory.pop();
        history.push([...nextState]); 
         // Eliminar el estado más antiguo si se supera el límite
        if (history.length > MAX_HISTORY_SIZE) {
            history.shift();
        }
        restoreGrid(nextState);
    } else {
        alert('No hay más pasos para rehacer.');
    }
}


function restoreGrid(gridState) {
    container.childNodes.forEach((item, index) => {
        item.style.backgroundColor = gridState[index]; 
    });
}

// Cambiar el modo de sombreado
function toggleShading() {
    shading = !shading;
    if (shading){
        lightening = true;
        toggleLightening();
        shadeButton.style.backgroundColor = "#333";
        shadeButton.style.border = "2px solid #222";
        shadeButton.style.color = "#FFF"
    } else {
        shadeButton.style.backgroundColor = "#F0EEEE";
        shadeButton.style.border = "2px solid #d3dae8";
        shadeButton.style.color = "#000"
    }
    // shadeButton.style.backgroundColor = shading ? "#333" : "#F0EEEE"; 
}

function darkenColor(color, amount = 0.1) {
    // Convertir el color a RGB
    const rgb = color.match(/\d+/g).map(Number);
    const darkened = rgb.map(channel => Math.max(0, Math.min(255, Math.floor(channel * (1 - amount))))); // Asegurarse de que no supere 255 ni sea menor que 0
    return `rgb(${darkened.join(", ")})`; // Devolver el nuevo color en formato RGB
}

function toggleLightening() {
    lightening = !lightening;
    if (lightening){
        shading = true;
        toggleShading();
        lightenButton.style.backgroundColor = "#333";
        lightenButton.style.border = "2px solid #222";
        lightenButton.style.color = "#FFF"
    } else {
        lightenButton.style.backgroundColor = "#F0EEEE";
        lightenButton.style.border = "2px solid #d3dae8";
        lightenButton.style.color = "#000"
    }
    // lightenButton.style.backgroundColor = lightening ? "#333" : "#F0EEEE";
}

function lightenColor(color, amount = 0.1) {
    // Convertir el color a RGB
    const rgb = color.match(/\d+/g).map(Number);
    const lightened = rgb.map(channel => Math.min(255, Math.floor(channel + (255 - channel) * amount))); // Asegurarse de que no supere 255
    return `rgb(${lightened.join(", ")})`; // Devolver el nuevo color en formato RGB
}

function addColorToHistory(newColor) {
    // Evitar duplicados en el historial
    if (!colorHistory.includes(newColor) && !random) {
        colorHistory.push(newColor);
        if (colorHistory.length > MAX_COLOR_HISTORY_SIZE) {
            colorHistory.shift(); // Eliminar el color más antiguo si se supera el límite
        }
    }
    updateColorHistoryDisplay();
}

function updateColorHistoryDisplay() {
    const colorHistoryContainer = document.querySelector('#color-history'); 
    colorHistoryContainer.innerHTML = ''; // Limpiar el contenedor

    colorHistory.forEach(squareColor => {
        const colorSquare = document.createElement('div');
        colorSquare.style.backgroundColor = squareColor;
        colorSquare.classList.add('color-square'); 
        colorSquare.addEventListener('click', () => {
            color = squareColor; // Cambia el color seleccionado al hacer clic en el cuadrado
            changeColor.value = squareColor; // Actualiza el input del color
            random = false;
            randomButton.style.backgroundColor = "#F0EEEE";
            randomButton.style.border = "2px solid #d3dae8";
            randomButton.style.color = "#000"
        });
        colorHistoryContainer.appendChild(colorSquare);
    });
}