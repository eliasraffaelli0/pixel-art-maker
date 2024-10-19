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
let history = []; // Para almacenar los estados de la cuadrícula
let redoHistory = []; // Para almacenar los pasos deshechos
let isPainting = false; // Variable para controlar cuándo se empieza y se deja de pintar

const shadeButton = document.querySelector('#shade-button');
let shading = false; // Variable para controlar cuándo está activa la funcionalidad de sombreado

const lightenButton = document.querySelector('#lighten-button');
let lightening = false; // Variable para controlar cuándo está activa la funcionalidad de aclarar

// clearButton.addEventListener("click", resetGrid);
clearButton.addEventListener("click", function() {
    if (window.confirm("¿Estás segurx de que quieres limpiar el tablero?")) {
        resetGrid(); // Llama a la función para limpiar la cuadrícula
    }
});
changeButton.addEventListener("click", changeSize);
window.addEventListener("load", setGrid);
container.addEventListener("click", setPainting);
randomButton.addEventListener("click", setRandom);
changeColor.addEventListener('input', chooseColor);
eraserButton.addEventListener("click", toggleEraser);
gridLinesButton.addEventListener("click", toggleGridLines);
// Escuchar el evento del botón de "Undo"
undoButton.addEventListener("click", undoStep);

// Escuchar el evento del botón de "Redo"
redoButton.addEventListener("click", redoStep);

// Event listener para el botón de sombreado
shadeButton.addEventListener("click", toggleShading);

// Event listener para el botón de aclarado
lightenButton.addEventListener("click", toggleLightening);

// Agregar un event listener para detectar Ctrl+Z y Ctrl+Y
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'z') {
        // Ctrl + Z -> Deshacer
        undoStep();
        event.preventDefault(); // Evitar el comportamiento por defecto del navegador
    }
    if (event.ctrlKey && event.key === 'y') {
        // Ctrl + Y -> Rehacer
        redoStep();
        event.preventDefault(); // Evitar el comportamiento por defecto del navegador
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
    color = this.value;
    //las siguientes lines son por si activan seleccionador de color mientras está el eraser activado
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
        if (!isPainting) {
            saveState(); // Guardamos el estado justo antes de comenzar a pintar
            redoHistory = []; // Limpiamos el historial de redo ya que es un nuevo paso
        }
        isPainting = true;
    } else {
        container.style.cursor = "";
        isPainting = false;
        saveState(); // Guardamos el estado después de terminar de pintar
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

// Modificar la función mouseOver
function mouseOver(aItem) {
    if (paint) {
        const currentColor = aItem.style.backgroundColor || "white"; // Obtener el color actual
        if (shading) {
            aItem.style.backgroundColor = darkenColor(currentColor); // Oscurecer el color actual
        } else if (lightening) {
            aItem.style.backgroundColor = lightenColor(currentColor); // Aclarar el color actual
        } else {
            aItem.style.backgroundColor = setColor(); // Aplicar el color seleccionado
        }
    }
}

// Modificar la función para resetear la cuadrícula y guardar el estado inicial
function resetGrid() {
    let allItems = container.childNodes; 
    allItems.forEach(item => (item.style.backgroundColor = "white"));
    saveState(); // Guardar el estado después de limpiar la cuadrícula
}

// Al cambiar el tamaño de la cuadrícula también se reinicia el historial
function changeSize() {
    let newSize = prompt('Enter a new size between 1 and 80! :)');
    if (newSize !== null){
        if ((isNaN(newSize)) || (newSize < 1 || newSize > 80)) {
            alert('The number has to be between 1 and 80!');
            changeSize();
        } else {
            size = parseInt(newSize);
            clearGrid();
            container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
            setGrid();
            saveState(); // Guardar el estado después de cambiar el tamaño
        }
    }
}

// Limpiar la cuadrícula
function clearGrid(){
    while(container.firstChild){
        container.removeChild(container.firstChild);
    }
}

// Guardar el estado actual de la cuadrícula
function saveState() {
    let currentGridState = [];
    container.childNodes.forEach(item => {
        currentGridState.push(item.style.backgroundColor || "white"); // Guardar el color de fondo de cada celda
    });
    history.push([...currentGridState]); // Guardar una copia del estado
}

// Deshacer el último paso
function undoStep() {
    if (history.length > 1) { // Dejar al menos un estado inicial para evitar borrar todo
        redoHistory.push(history.pop()); // Guardar el último estado en redoHistory
        const previousState = history[history.length - 1]; // Recuperar el penúltimo estado guardado
        restoreGrid(previousState); // Restaurar la cuadrícula
    } else {
        alert('No hay más pasos para deshacer.');
    }
}

// Rehacer el último paso deshecho
function redoStep() {
    if (redoHistory.length > 0) {
        const nextState = redoHistory.pop(); // Recuperar el último paso de redoHistory
        history.push([...nextState]); // Guardar este estado en el historial de "Undo"
        restoreGrid(nextState); // Restaurar la cuadrícula
    } else {
        alert('No hay más pasos para rehacer.');
    }
}

// Restaurar la cuadrícula a un estado anterior
function restoreGrid(gridState) {
    container.childNodes.forEach((item, index) => {
        item.style.backgroundColor = gridState[index]; // Restaurar el color de fondo de cada celda
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
    // shadeButton.style.backgroundColor = shading ? "#333" : "#F0EEEE"; // Cambiar el color del botón
}

// Función para oscurecer un color
function darkenColor(color, amount = 0.1) {
    // Convertir el color a RGB
    const rgb = color.match(/\d+/g).map(Number);
    const darkened = rgb.map(channel => Math.max(0, Math.min(255, Math.floor(channel * (1 - amount))))); // Asegurarse de que no supere 255 ni sea menor que 0
    return `rgb(${darkened.join(", ")})`; // Devolver el nuevo color en formato RGB
}

// Cambiar el modo de aclarado
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
    // lightenButton.style.backgroundColor = lightening ? "#333" : "#F0EEEE"; // Cambiar el color del botón
}

// Función para aclarar un color
function lightenColor(color, amount = 0.1) {
    // Convertir el color a RGB
    const rgb = color.match(/\d+/g).map(Number);
    const lightened = rgb.map(channel => Math.min(255, Math.floor(channel + (255 - channel) * amount))); // Asegurarse de que no supere 255
    return `rgb(${lightened.join(", ")})`; // Devolver el nuevo color en formato RGB
}