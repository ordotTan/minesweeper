'use strict'
const MINE = '💣'
const FLAG = '🚩'

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
    seconds: 0,
    autoPlaceMines: true,
    currentHintUsed: false

}
var gLevel = {
    SIZE: 4,
    MINES: 2,
    levelName: 'easy'
}

var gPlayer = {
    hintCount: 3,
    liveCount: 3,
    safeClickCount: 3,
    hintActive: false
}

function initGame() {
    gBoard = buildBoard(gLevel.SIZE)
    displayRecords(gLevel.levelName)
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
    document.querySelector('.user-message').style.display = 'none'
    document.querySelector('.smiley').src = 'img/smiley_normal.png'
    gFirstMove = true
    gGame.currentHintUsed = false
    gGame.markedMines = 0
    gGame.markedCount = 0
    gGame.seconds = 0
    gGame.shownCount = 0
    gPlayer.hintCount = 3
    gPlayer.liveCount = 3
    gPlayer.hintActive = false;
    renderBoard(gBoard)
    disableContextMenu();
    if (!gGame.autoPlaceMines) {
        manualPlaceMines()
    }
    gGame.isON = true
}

function displayRecords(levelName) {
    //Check if we have game records in the browser's localStorage, and update it if not
    var recordType = levelName+'Record'
    var elRecordClass = '.best-time-'+gLevel.levelName
    var Record = localStorage.getItem(recordType);
    if (!Record) {
        document.querySelector(elRecordClass).innerText = 'No record yet'
    }
    else {
         document.querySelector(elRecordClass).innerText = '(Record: '+Record + ' sec.)';
    }
}


function disableContextMenu() { // disable right click from all table cells.
    var elCells = document.querySelectorAll('td')
    for (var i = 0; i < elCells.length; i++) {
        elCells[i].addEventListener('contextmenu', function (e) {
            e.preventDefault();
        }, false);
    }
}

function setDiffulty(elDifficultyInput) {

    if (elDifficultyInput.value === 'Beginner') {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        gLevel.levelName = 'easy'
        document.querySelector('.best-time-easy').style.display='block'
        document.querySelector('.best-time-medium').style.display='none'
        document.querySelector('.best-time-hard').style.display='none'
    }
    else if (elDifficultyInput.value === 'Medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 12
        gLevel.levelName = 'medium'
        document.querySelector('.best-time-easy').style.display='none'
        document.querySelector('.best-time-medium').style.display='block'
        document.querySelector('.best-time-hard').style.display='none'
    }
    else if (elDifficultyInput.value === 'Expert') {
        gLevel.SIZE = 12
        gLevel.MINES = 30
        gLevel.levelName = 'hard'
        document.querySelector('.best-time-easy').style.display='none'
        document.querySelector('.best-time-medium').style.display='none'
        document.querySelector('.best-time-hard').style.display='block'
    }
    initGame();
}

function markSafeCell() {
    if (gFirstMove) return
    if (!gGame.isON) return
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
        document.querySelector('.user-message').innerText = 'No more safe cell!'
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
    if (!gGame.isON) return
    gPlayer.hintActive = true;
    gPlayer.hintCount--;
    elHint.src = 'img/bulb_off.jpg'
    elHint.onclick = ''
    elHint.classList.add('hint-disabled')
    elHint.classList.remove('hint-active')
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
    document.querySelector('.user-message').style.display = 'block'
    gGame.isON = false
    if (isWin) {// Game Won!
        var winSound = new Audio("sound/tada.wav");
        winSound.play();
        document.querySelector('.smiley').src = 'img/smiley_happy.png'
        document.querySelector('.user-message').innerText = 'Well Done!!'
        checkRecords()
        return
    } //Game over protocol.... 
    setTimeout(function () {
        var loseSound = new Audio("sound/game_over.wav");
        loseSound.play();
    }, 1000);

    document.querySelector('.smiley').src = 'img/smiley_sad.png'
    document.querySelector('.user-message').innerText = 'Game Over. Better luck next time...'
    var cells = document.querySelectorAll('.cell')
    for (var i = 0; i < cells.length; i++) {       //Show remaining mines
        var currCellClass = (cells[i].classList[1])
        var currCoords = getCellCoord(currCellClass)
        var currCell = gBoard[currCoords.i][currCoords.j]
        if (currCell.isMine) {
            currCell.isShown = true
            cells[i].classList.add('mine')
        }
    }
}

function checkRecords() {

    var gameType = gLevel.levelName
    var record = localStorage.getItem(gameType + 'Record');
    var inputs = (document.querySelectorAll('.difficulty-picker'))
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].checked) break
    }
    if (gGame.seconds < record || record === null) {
        localStorage.setItem(gameType + 'Record', gGame.seconds);
        document.querySelector('.best-time-' + gameType).innerHTML = '(Record: '+gGame.seconds + ' sec)';
    }
}

function startTimer() {
    gStartTime = Date.now();
    gTimeInterval = setInterval(() => {
        var gameTime = parseInt((Date.now() - gStartTime) / 1000)
        gGame.seconds = gameTime+1 //adding 1 sec to compensate for the last interval
        var elMlSeconds = document.querySelector('.seconds');
        elMlSeconds.innerText = gameTime + ' seconds';
        if (!gGame.isON) {
            clearInterval(gTimeInterval)
            gTimeInterval = null
        }
    }, 1000);
}

function cellClicked(elCell, i, j) {
    if (gGame.currentHintUsed) return // protection from "abusing" single hint for multiple times
    if (!gGame.isON) return
    var cell = gBoard[i][j]
    if (gFirstMove) {  //Handle first move case
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

    if (gPlayer.hintActive) { //Handle click post "hint" request
        gGame.currentHintUsed = true
        renderHint(i, j, true)
        setTimeout(function () {
            renderHint(i, j, false)
            gPlayer.hintActive = false
            gGame.currentHintUsed=false
            document.querySelector('.hint-label').style.display = 'none'
        }, 1000);
        return;
    }

    if (cell.isMarked) return
    if (cell.isShown) return
    var audioClick = new Audio("sound/click.wav");
    audioClick.play();
    if (cell.isMine) { //Clicked on a mine
        var QuakeInterval = setInterval(explode, 100);
        setTimeout(function () {
            clearInterval(QuakeInterval)
            QuakeInterval = null
            document.querySelector('.board').classList.remove('rotated-left')
        }, 1200);
        var explosion = new Audio("sound/explosion.wav");
        explosion.play();
        var currentLife = '.life' + gPlayer.liveCount
        document.querySelector(currentLife).src = "img/broken_heart.png"
        gPlayer.liveCount--
        if (gPlayer.liveCount === 0) {
            elCell.classList.add('mine-touch')
            finishGame(false)
        }
        else {
            document.querySelector('.user-message').style.display = 'block'
            document.querySelector('.user-message').innerText = 'Oops.. You landed on a mine. Try again'
            setTimeout(function () {
                if (gGame.isON) document.querySelector('.user-message').style.display = 'none'
            }, 3000);
        }
    } else if (cell.minesAroundCount > 0) { //reveal a single number
        gBoard[i][j].isShown = true
        gGame.shownCount++
        var classToAdd = 'neg' + cell.minesAroundCount
        var elCell = getCellElement(i, j)
        elCell.classList.add(classToAdd)
    } else { //need to expend..
        expendedReveal(i, j)
    }
    checkGameOver()
}

function expendedReveal(cellI, cellJ) {
    if (cellI < 0 ||
        cellJ < 0 ||
        cellI === gBoard.length ||
        cellJ === gBoard.length ||
        gBoard[cellI][cellJ].isMine ||
        gBoard[cellI][cellJ].isShown) {
        return
    }
    //Handle current Cell
    var currentElement = getCellElement(cellI, cellJ)
    if (currentElement.innerText === FLAG && gBoard[cellI][cellJ].minesAroundCount === 0 && !gBoard[cellI][cellJ].isMine) { //removing "floating" flags 
        gBoard[cellI][cellJ].isMarked = false
        currentElement.innerText = ''
        console.log('removed floating flag')
        gGame.markedCount--
        document.querySelector('.flag-counter').innerText = gLevel.MINES - gGame.markedCount
    }
    var classToAdd = 'neg' + gBoard[cellI][cellJ].minesAroundCount
    currentElement.classList.add(classToAdd)
    gBoard[cellI][cellJ].isShown = true
    gGame.shownCount++
    // Stop also when getting to cell with some negs
    if (gBoard[cellI][cellJ].minesAroundCount > 0) {
        return
    }
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            expendedReveal(i, j)
        }
    }
}


function cellMarked(elCell, event) {
    if (event.button != 2) return // handle only right-click
    if (!gGame.isON) return
    if (gFirstMove) return // can't put flags before game starts
    var currCellClass = (elCell.classList[1])
    var currCoords = getCellCoord(currCellClass)
    var currCell = gBoard[currCoords.i][currCoords.j]
    if (currCell.isShown) return
    var audioClick = new Audio("sound/click.wav");
    audioClick.play();
    if (currCell.isMarked) {
        gGame.markedCount--
        if (currCell.isMine) gGame.markedMines--
        elCell.innerText = currCell.isMine ? MINE : currCell.minesAroundCount //reverting to what belwo the flag
        currCell.isMarked = false
        elCell.classList.remove('revealed') //hide the cell again
    }
    else {
        gGame.markedCount++;
        if (currCell.isMine) gGame.markedMines++
        elCell.innerText = FLAG
        currCell.isMarked = true
        elCell.classList.add('revealed')
        checkGameOver() //Marking can be a winning condition (marking the last mine)
    }
    document.querySelector('.flag-counter').innerText = gLevel.MINES - gGame.markedCount
}

function checkGameOver() {
    if (gGame.markedCount === gGame.markedMines &&
        gGame.shownCount === (gLevel.SIZE ** 2) - gGame.markedMines &&
        gGame.markedMines > 0) finishGame(true)
}


function toggleMinePlacment(elMinesPlaceInput) {8

    gGame.autoPlaceMines = elMinesPlaceInput.value === 'Auto' ? true : false
    //Need to render the booard according to the new difficuly level
    var inputs = (document.querySelectorAll('.difficulty-picker'))
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].checked) {
            setDiffulty(inputs[i])
        }
    }
}

function placeMines(numOfBombs) {
    if (!gGame.autoPlaceMines) manualPlaceMines()
    else { //auto place mines in random places
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
    var numOfMines = +prompt('How many mines you want to plant?')
    gLevel.MINES = numOfMines
    document.querySelector('.flag-counter').innerText = gLevel.MINES

    for (var i = 0; i < numOfMines; i++) {
        var minePlaced = false
        var currMineCoord = prompt('Please input cordinates of mine # ' + (i + 1), 'x,y')
        while (!minePlaced) {
            var loc = currMineCoord.split(',')
            if (loc[0] > gBoard.length || loc[1] > gBoard.length || loc[0] < 1 || loc[1] < 1) {
                currMineCoord = prompt('Wrong input! Please input cordinates of mine # ' + (i + 1), 'x,y')
            }
            else if (gBoard[loc[0] - 1][loc[1] - 1].isMine) {
                currMineCoord = prompt('This cell is alreay mine! Please input cordinates of mine # ' + (i + 1), 'x,y')
            }
            else {
                gBoard[loc[0] - 1][loc[1] - 1].isMine = true
                minePlaced = true
            }
        }
    }
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

function explode() {
    var elBoard = document.querySelector('.board')
    elBoard.classList.toggle('rotated-left')
}