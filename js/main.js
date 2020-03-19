'use strict'
const MINE = '💣'
const FLAG = '🚩'

// basic 
//todo - modal for game over msgs (lost live/ win / lose)
//todo - check right-click with windows..

//bonus
//todo - Full expned (recursson!)
//todo - keep records in local storage and display

//nice to have
//todo - add sound fx
//todo - undo
//todo - block non-numeric input



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
    markedMines: 0,
    autoPlaceMines: true

}
var gLevel = {
    SIZE: 8,
    MINES: 1
}

var gPlayer = {
    hintCount: 3,
    liveCount: 3,
    safeClickCount: 3,
    hintActive: false
}


function initGame() {
    gPlayer.safeClickCount = 3
    if (gTimeInterval) {
        clearInterval(gTimeInterval)
        gTimeInterval = null
    }
    document.querySelector('.myButton').classList.add('btn-disabled')
    document.querySelector('.myButton').classList.remove('safe-cell-btn')
    document.querySelector('.myButton').innerText = `${gPlayer.safeClickCount} safe-clicks remaining`
    document.querySelector('.flag-counter').innerText = gLevel.MINES
    document.querySelector('.seconds').innerText = '0 seconds'
    document.querySelector('.life1').src = "img/heart.png"
    document.querySelector('.life2').src = "img/heart.png"
    document.querySelector('.life3').src = "img/heart.png"
    document.querySelector('.hint-label').style.display = 'none'
    document.querySelector('.hint-label').innerText = ''

    var hints = document.querySelectorAll('.hint')
    for (var i = 0; i < hints.length; i++) {
        hints[i].src = "img/bulb.jpg"
        hints[i].classList.remove('hint-disabled')
        hints[i].classList.add('hint-active')
    }
    document.querySelector('.message').style.display = 'none'
    document.querySelector('.smiley').src = 'img/smiley_normal.png'
    gFirstMove = true
    gGame.markedMines = 0
    gGame.markedCount = 0
    gGame.shownCount = 0
    gBoard = buildBoard(gLevel.SIZE)
    gPlayer.hintCount = 3
    gPlayer.liveCount = 3
    gPlayer.hintActive = false;
    renderBoard(gBoard)
    disableContextMenu();
    if (!gGame.autoPlaceMines) {
        manualPlaceMines()
    }
    play()
}

function play() {
    gGame.isON = true
}

function disableContextMenu() {
    var elCells = document.querySelectorAll('td')
    for (var i = 0; i < elCells.length; i++) {
        elCells[i].addEventListener('contextmenu', function (e) {
            e.preventDefault();
        }, false);
    }
}

function setDiffulty(elDifficultyInput) {

    if (elDifficultyInput.value === 'Beginner') {
        gLevel.SIZE = 7
        gLevel.MINES = 1
    }
    else if (elDifficultyInput.value === 'Medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 12
    }
    else if (elDifficultyInput.value === 'Expert') {
        gLevel.SIZE = 12
        gLevel.MINES = 30
    }
    initGame();
}

function markSafeCell() {
    if (gFirstMove) return
    if (gPlayer.safeClickCount === 0) return
    gPlayer.safeClickCount--
    document.querySelector('.myButton').innerText = `${gPlayer.safeClickCount} safe-clicks remaining`
    if (gPlayer.safeClickCount === 0) {
        document.querySelector('.myButton').classList.add('btn-disabled')
        document.querySelector('.myButton').classList.remove('safe-cell-btn')
    }
    var cells = []
    var id = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            //var currElCell =  getCellElement (i,j)
            if (!currCell.isMine && !currCell.isMarked && !currCell.isShown) {
                cells[id] = ({ id: id, i: i, j: j }) //coords of all safe cells
                id++
            }
        }
    }
    var randomIndex = getRandomIntInclusive(0, cells.length - 1)
    var mineCell = cells.splice(randomIndex, 1)
    if (mineCell.length === 0) {
        console.log('no more safe cell')
    }
    else {
        renderSafeCell(mineCell[0].i, mineCell[0].j, true)
        setTimeout(function () {
            renderSafeCell(mineCell[0].i, mineCell[0].j, false)
        }, 1000);

    }

}

function renderSafeCell(cellI, cellJ, isShow) {
    var elCell = getCellElement(cellI, cellJ)
    if (isShow) elCell.classList.add('safe-cell')
    else elCell.classList.remove('safe-cell')
}


function getHint(elHint) {

    gPlayer.hintActive = true;
    gPlayer.hintCount--;
    elHint.src = 'img/bulb_off.jpg'
    elHint.onclick = ''
    elHint.classList.add('hint-disabled')
    elHint.classList.remove('hint-active')
    //elHint.style.display = "none"
    document.querySelector('.hint-label').style.display = 'block'
    document.querySelector('.hint-label').innerText = 'Take a sneak-peek into one cell and its surrondings'
}


function renderHint(cellI, cellJ, isShow) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue; //Check illegel rows
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue; //Check illegel cols
            var elCell = getCellElement(i, j)
            if (gBoard[i][j].isMarked) continue
            if (isShow) elCell.classList.add('revealed')
            else elCell.classList.remove('revealed')
        }
    }
}

function finishGame(isWin) {
    document.querySelector('.myButton').classList.remove('safe-cell-btn')
    document.querySelector('.myButton').classList.add('btn-disabled')
    var hints = document.querySelectorAll('.hint')
    for (var i = 0; i < hints.length; i++) {
        hints[i].src = "img/bulb_off.jpg"
        hints[i].classList.add('hint-disabled')
        hints[i].classList.remove('hint-active')
    }
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
        var elMlSeconds = document.querySelector('.seconds');
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
        document.querySelector('.myButton').classList.add('safe-cell-btn')
        document.querySelector('.myButton').classList.remove('btn-disabled')
        cell.isFirst = true
        if (gGame.autoPlaceMines) placeMines(gLevel.MINES)
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
        disableContextMenu();
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
        var currentLife = '.life' + gPlayer.liveCount
        //document.querySelector(currentLife).style.display = 'none'
        document.querySelector(currentLife).src = "img/broken_heart.png"
        gPlayer.liveCount--
        if (gPlayer.liveCount === 0) {
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

    if (cellI < 0 ||
        cellJ < 0 ||
        cellI >= gBoard.length ||
        cellJ >= gBoard.length ||
        gBoard[cellI][cellJ].minesAroundCount > 0 ||
        gBoard[cellI][cellJ].isMine) {
        // console.log('return')
        return
    }

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue; //Check illegel rows
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue; //Check illegel col
            //if (i === cellI && j === cellJ) continue; //Ignore the middle cell
            //debugger
            var currentElement = getCellElement(i, j)
            if (!gBoard[i][j].isShown) { //  in order not to double count gRevealedCells
                gBoard[i][j].isShown = true
                gGame.shownCount++
            }
            //debugger
            if (currentElement.innerText === FLAG && gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) { //removing "floating" flags 
                gBoard[i][j].isMarked = false
                currentElement.innerText = ''
                gGame.markedCount--
                document.querySelector('.flag-counter').innerText = gLevel.MINES - gGame.markedCount

            }
            // debugger
            var classToAdd = 'neg' + gBoard[i][j].minesAroundCount
            currentElement.classList.add(classToAdd)
            // expendedReveal(i, j)

        }
        //    expendedReveal(i+1, j)
        //    expendedReveal(i-1, j)
        expendedReveal(i, j)
        //cellClicked(i,j,currentElement)
    }
    // expendedReveal(i, j+1)
    // expendedReveal(i, j-1)
    expendedReveal(i, j)
    //cellClicked(i,j,currentElement)
    //debugger
}

function getCellElement(i, j) {
    var className = '.cell-' + i + '-' + j
    var elCell = document.querySelector(className)
    return elCell
}

function cellMarked(elCell, event) {
    if (gFirstMove) return // can't put flags before game starts
    if (event.button != 2) return // handle only right-click
    var currCellClass = (elCell.classList[1])
    var currCoords = getCellCoord(currCellClass)
    var currCell = gBoard[currCoords.i][currCoords.j]
    if (currCell.isShown) return
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
    document.querySelector('.flag-counter').innerText = gLevel.MINES - gGame.markedCount
}


function checkGameOver() {
    if (gGame.markedCount === gGame.markedMines &&
        gGame.shownCount === (gLevel.SIZE ** 2) - gLevel.MINES &&
        gGame.markedMines > 0) finishGame(true)
}


function toggleMinePlacment(elMinesPlaceInput) {
    gGame.autoPlaceMines = elMinesPlaceInput.value === 'Auto' ? true : false
    var inputs = (document.querySelectorAll('.difficulty-picker'))
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].checked) {
            setDiffulty(inputs[i])
        }
    }
    initGame()
}

function placeMines(numOfBombs) {
    if (!gGame.autoPlaceMines) manualPlaceMines()
    else { //auto place mines
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
}


function manualPlaceMines() {
    //initGame()
    var numOfMines = +prompt('How many mines you want to plant?')
    gLevel.MINES = numOfMines
    document.querySelector('.flag-counter').innerText = gLevel.MINES
    for (var i = 0; i < numOfMines; i++) {
        var minePlaced = false
        var currMineCoord = prompt('i,j of ' + (i + 1) + ' mine?', 'i,j')
        while (!minePlaced) {
            var loc = currMineCoord.split(',')
            if (loc[0] >= gBoard.length || loc[1] >= gBoard.length || loc[0] < 0 || loc[1] < 0) {
                currMineCoord = prompt('Wrong input... i,j of ' + (i + 1) + ' mine?', 'i,j')
            }
            else if (gBoard[loc[0]][loc[1]].isMine) {
                currMineCoord = prompt('Place taken... i,j of ' + (i + 1) + ' mine?', 'i,j')
            }
            else {
                gBoard[loc[0]][loc[1]].isMine = true
                minePlaced = true
            }
        }
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
        }
        strHtml += '</tr>'
    }
    document.querySelector('.board').innerHTML = strHtml
}