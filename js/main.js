'use strict'
const MINE = '💣'
const FLAG = '🚩'


// basic 
//todo - fix the right click menu!!!
//todo - support 3 levels of game
// Beginner (4*4 with 2 MINES)
// o Medium (8 * 8 with 12 MINES) o 
// Expert (12 * 12 with 30 MINES)
//todo - fix design issues -- make sure block/board won't 'jump..'

//nice to have
//todo - add sound fx

//bonus
//todo - keep records in local storage and display
//todo - Full expned (recursson!)
//todo - "safe clicks"
//todo - mannualy position 
//todo - undo


//The model
var gCellId = 101
var gBoard
var gFirstMove = true
var gStartTime
var gTimeInterval

var gGame = {
    isON: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    markedMines: 0

}
var gLevel = {
    SIZE: 8,
    MINES: 10
}

var gPlayer = {
    hints: 3,
    lives: 3,
    hintActive: false
}


function initGame() {
    clearInterval(gTimeInterval)
    gTimeInterval = null
    document.querySelector('.mil-seconds').innerText = '0 seconds'
    document.querySelector('.life1').style.display = 'inline-block'
    document.querySelector('.life2').style.display = 'inline-block'
    document.querySelector('.life3').style.display = 'inline-block'
    document.querySelector('.hints-section').style.display = 'none'
    var hints = document.querySelectorAll('.hint')
    for (var i = 0; i < hints.length; i++) {
        hints[i].style.display = 'inline-block'
    }
    document.querySelector('.message').style.display = 'none'
    document.querySelector('.smiley').src = 'img/smiley_normal.png'
    gFirstMove = true
    gGame.markedMines = 0
    gGame.markedCount = 0
    gGame.shownCount = 0
    gBoard = buildBoard(gLevel.SIZE)
    gPlayer.hints = 3
    gPlayer.lives = 3
    gPlayer.hintActive = false;
    renderBoard(gBoard)
    play()
}

function play() {
    gGame.isON = true
}

function markSafeCell() {
    var cells = []
    var id = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            // debugger
            var currCell = gBoard[i][j]
            //var currElCell =  getCellElement (i,j)
            if (!currCell.isMine && !currCell.isMarked && !currCell.isShown) {
                cells[id] = ({ id: id, i: i, j: j })
                id++
            }

        }
    }
    var randomIndex = getRandomIntInclusive(0, cells.length - 1)
    var mineCell = cells.splice(randomIndex, 1)

    renderSafeCell(mineCell[0].i, mineCell[0].j, true)
    setTimeout(function () {
        renderSafeCell(mineCell[0].i, mineCell[0].j, false)
    }, 1000);
}

// function renderSafeCell(cellI, cellJ,isShow) {
//     for (var i = cellI - 1; i <= cellI + 1; i++) {
//         if (i < 0 || i >= gBoard.length) continue; //Check illegel rows
//         for (var j = cellJ - 1; j <= cellJ + 1; j++) {
//             if (j < 0 || j >= gBoard.length) continue; //Check illegel cols
//             //var cell = gBoard[i][j]
//             var elCell = getCellElement(i,j)
//             if (isShow) elCell.classList.add('revealed')
//             else elCell.classList.remove('revealed')
//         }
//     }
// }

function getHint(elHint) {

    gPlayer.hintActive = true;
    gPlayer.hints--;
    elHint.style.display = "none"
    document.querySelector('.hint-label').style.display = 'block'
    document.querySelector('.hint-label').innerText = 'Take a sneak-peek into one cell and its surrondings'
}


function renderHint(cellI, cellJ, isShow) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue; //Check illegel rows
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue; //Check illegel cols
            var elCell = getCellElement(i, j)
            if (isShow) elCell.classList.add('revealed')
            else elCell.classList.remove('revealed')
        }
    }
}

function finishGame(isWin) {
    document.querySelector('.message').style.display = 'block'
    gGame.isON = false
    if (isWin) {
        document.querySelector('.smiley').src = 'img/smiley_happy.png'
        document.querySelector('.message').innerText = 'Well Done!!'
        return
    } //Game over protocol.... 
    document.querySelector('.smiley').src = 'img/smiley_sad.png'
    document.querySelector('.message').innerText = 'Try again next time..'
    var cells = document.querySelectorAll('.cell')
    for (var i = 0; i < cells.length; i++) {       //Expose only mines..
        var currCellClass = (cells[i].classList[1])
        var currCoords = getCellCoord(currCellClass)
        var currCell = gBoard[currCoords.i][currCoords.j]
        if (currCell.isMine) {
            currCell.isShown = true
            cells[i].classList.add('mine')
        }
    }
}

// Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] };
    return coord;
}

function startTimer() {
    gStartTime = Date.now();
    gTimeInterval = setInterval(() => {
        var dif = parseInt((Date.now() - gStartTime) / 1000)
        var elMlSeconds = document.querySelector('.mil-seconds');
        elMlSeconds.innerText = dif + ' seconds';
        if (!gGame.isON) {
            clearInterval(gTimeInterval)
            gTimeInterval = null
        }
    }, 1000);
}



function cellClicked(elCell, i, j) {
    if (!gGame.isON) return
    var cell = gBoard[i][j]

    if (gFirstMove) {
        startTimer()
        document.querySelector('.hints-section').style.display = 'block'
        cell.isFirst = true
        placeMines(gLevel.MINES)
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
        gFirstMove = false
    }

    if (gPlayer.hintActive) {
        renderHint(i, j, true)
        setTimeout(function () {
            renderHint(i, j, false)
            gPlayer.hintActive = false
            document.querySelector('.hint-label').style.display = 'none'
        }, 1000);
        return;
    }

    if (cell.isMarked) return
    if (cell.isShown) return
    if (cell.isMine) { //Clicked on a mine
        var currentLife = '.life' + gPlayer.lives
        document.querySelector(currentLife).style.display = 'none'
        gPlayer.lives--
        if (gPlayer.lives === 0) {
            elCell.classList.add('mine-touch')
            finishGame(false)
        }
        else {
            document.querySelector('.message').style.display = 'block'
            document.querySelector('.message').innerText = 'Oops.. You landed on a mine. Try again'
            setTimeout(function () {
                document.querySelector('.message').style.display = 'none'
            }, 1000);
        }
    } else if (cell.minesAroundCount > 0) { //reveal a number
        gBoard[i][j].isShown = true
        gGame.shownCount++
        var classToAdd = 'neg' + cell.minesAroundCount
        //todo - why it's not working with elCell??
        //elCell.classList.add(classToAdd) 
        var el = getCellElement(i, j)
        el.classList.add(classToAdd)
        //console.log(el)
        // console.log(elCell)
    } else { //need to expend..
        expendedReveal(i, j)
    }
    checkGameOver()
}

function expendedReveal(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue; //Check illefel rows
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue; //Check illegel cols
            var currentElement = getCellElement(i, j)
            if (!gBoard[i][j].isShown) { //  in order not to double count gRevealedCells
                gBoard[i][j].isShown = true
                gGame.shownCount++
            }
            if (gBoard[i][j] === FLAG && gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) { //removing "floating" flags 
                gBoard[i][j].isMarked = false
                currentElement.innerText = 0
                gGame.markedCount--
            }
            var classToAdd = 'neg' + gBoard[i][j].minesAroundCount
            currentElement.classList.add(classToAdd)
        }
    }
}

function getCellElement(i, j) {
    var className = '.cell-' + i + '-' + j
    var elCell = document.querySelector(className)
    return elCell
}

function cellMarked(elCell, event) {
    if (event.button != 2) return // handle only right-click
    var currCellClass = (elCell.classList[1])
    var currCoords = getCellCoord(currCellClass)
    var currCell = gBoard[currCoords.i][currCoords.j]
    if (currCell.isShown) return
    //todo - fix the right click menu!!!
    //event.defaultPrevented=true; 
    var currCellClass = (elCell.classList[1])
    var currCoords = getCellCoord(currCellClass)
    var currCell = gBoard[currCoords.i][currCoords.j]
    if (currCell.isMarked) {
        gGame.markedCount--
        elCell.innerText = currCell.isMine ? MINE : currCell.minesAroundCount
        currCell.isMarked = false
        elCell.classList.remove('revealed')
        checkGameOver()
    }
    else {
        gGame.markedCount++;
        if (currCell.isMine) gGame.markedMines++
        elCell.innerText = FLAG
        currCell.isMarked = true
        elCell.classList.add('revealed')
        checkGameOver()
    }
}


function checkGameOver() {
    if (gGame.markedCount === gGame.markedMines &&
        gGame.shownCount === (gLevel.SIZE ** 2) - gLevel.MINES &&
        gGame.markedMines > 0) finishGame(true)
}


function placeMines(numOfBombs) {
    var cells = []
    var id = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            cells[id] = ({ id: id, i: i, j: j })
            id++
        }
    }

    for (var i = 0; i < numOfBombs; i++) {
        var randomIndex = getRandomIntInclusive(0, cells.length - 1)
        var mineCell = cells.splice(randomIndex, 1)
        var cell = gBoard[mineCell[0].i][mineCell[0].j]
        if (cell.isFirst) i-- //making sure not to put the mine on the first clicked cell
        else cell.isMine = true
    }
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


function createCell(minesAroundCount = 0, isShown = false, isMine = false, isMarked = false, isFirst = false) {
    var cell = {
        id: gCellId++,
        minesAroundCount: minesAroundCount,
        isShown: isShown,
        isMine: isMine,
        isMarked: isMarked,
        isFirst: isFirst

    }
    return cell
}


function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var NegCount = countNegMines(i, j, board)
            board[i][j].minesAroundCount = NegCount
        }
    }
}


function countNegMines(cellI, cellJ, mat) {
    var minesAroundCellCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue; //Check illegel rows
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue; //Ignore the middle cell
            if (j < 0 || j >= mat.length) continue; //Check illegel cols
            if (mat[i][j].isMine) minesAroundCellCount++;
        }
    }
    return minesAroundCellCount;
}

function renderBoard(board) {
    var strHtml = ''
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>'
        for (var j = 0; j < board.length; j++) {
            var currCell = (board[i][j])
            var className = 'cell cell-' + i + '-' + j;
            var cellContent = currCell.isMine ? MINE : currCell.minesAroundCount
            strHtml += `<td  onmousedown="cellMarked(this,event)" onclick="cellClicked(this,${i},${j})" class="${className}">${cellContent}</td>`
            // if (currCell.isMine) {
            //     var className = 'mine'
            // } else if (currCell === CORONA) className = 'corona'
            // else className = ''
            // var dataName = `data-i="${i}" data-j="${j}"`
            // strHtml += `<td ${dataName} onclick="cellClicked(this ,${i}, ${j} )"
            //  class="${className}"  >
            // ${board[i][j]}
            // </td> `
        }
        strHtml += '</tr>'
    }
    document.querySelector('.board').innerHTML = strHtml
}

