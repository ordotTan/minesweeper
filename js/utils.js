'use strict'

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}

function bubbleSortNums(nums) { //gets an array, and returns a new sorted array.
    var numsCopy = nums.slice();
    for (var i = 0; i < numsCopy.length - 1; i++) {
        for (var j = 0; j < numsCopy.length - i - 1; j++) {
            if (numsCopy[j] > numsCopy[j + 1]) {
                var temp = numsCopy[j];
                numsCopy[j] = numsCopy[j + 1];
                numsCopy[j + 1] = temp;
            }
        }
    }
    return numsCopy
}

//Build rowsXcols 2-d array, filled with random digits (1-9), with repetitions. 

function buildMat(rows,cols) {
    var board=[];
    for (var i=0;i<rows;i++) {
        board[i]=[];
        for (var j=0;j<cols;j++) {
            board[i][j]=getRandomInt(1,10)
        }
    }
    return board
 }
 
 function getTime() { //hh:mm:ss format
    return new Date().toString().split(' ')[4];
 }
 
// Render board on HTML from a given array, where each cell has some function on it
function renderBoard(board) {
    var elBoard = document.querySelector('.board'); var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var cellClass = 'cell-' + i + '-' + j + ' ';
            strHTML += '\t<td class="cell ' + cellClass +
                '" onclick="moveTo(' + i + ',' + j + ')" >\n';
            strHTML += currCell;
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    elBoard.innerHTML = strHTML;
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}


// Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] };
    return coord;
}

//gets a loc {i,j} and returns the class name of the cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}


