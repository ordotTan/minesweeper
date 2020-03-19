'use strict'

// Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] };
    return coord;
}

function getCellElement(i, j) {
    var className = '.cell-' + i + '-' + j
    var elCell = document.querySelector(className)
    return elCell
}

function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = createCell()
        }
    }
    return board;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}