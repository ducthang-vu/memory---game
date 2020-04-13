console.log('main.js is working')
console.log($)


/* UTILITIES FUNCTION */
function randomNumberSet(n, min, max) {
    var randomNumbers = new Set()

    if (isNaN(n) || n < 1 || isNaN(max) || isNaN(min)) {return -1}  // Validation

    while (randomNumbers.size < n) {
        randomNumbers.add(Math.floor(Math.random() * (max - min)) + min)
    }
    
    return randomNumbers
}


function shuffle(array) {
    //Shuffling randmoly array item's position
    var m = array.length, t, i;
    while (m) { // While there remain elements to shuffle…
        i = Math.floor(Math.random() * m--) // Pick a remaining element…
        t = array[m]; // And swap it with the current element.
        array[m] = array[i]
        array[i] = t
    }
}


function buildTable($el, level) {
    var content = '<div class="board-wrapper inline-fl-w '+ boardClass_per_level[level][0] + '">'
    for (let i = 0; i < nCard_per_level[level]; i++) {
        content += '<div class="scene ' + boardClass_per_level[level][1] + '"><div position="' + i + '" class="card relative"><div class="card-face card-down absolute"></div>  <div class="card-face card-up absolute"></div></div></div>'
    }
    $el.html(content + '</div>')
}


/* CLASSES */
class Card {
    constructor(value, back='?') {
        this.value = value;
        this.back = back;
    }

    printFace(n) {
        return n ? '<span>' + this.value + '</span>' : '<span>' + this.back + '</span>'
    }
}


class Deck {
    // A deck of n/2 pairs of cards, bearing the cards of each card the same random value from 10 to 99, both included.
    constructor(n) {
        this.cards = []
        for (let number of randomNumberSet(n/2, 10, 100)) {
            this.cards.push(new Card(number), new Card(number))
        }
        shuffle(this.cards)
    }

    printDeck($el_front, $el_back) {
        for (let i = 0; i < this.cards.length; i ++) {
            $el_front[i].innerHTML = this.cards[i].printFace(1) 
            $el_back[i].innerHTML = this.cards[i].printFace(0)  
        }
    }
}


class SingleAttempt {
    constructor(cards, posision_first) {
        this.cards = cards
        this.posision_first = posision_first
        this.value_first = this.cards[this.posision_first].value
        this.position_second = null
        this.value_second = null
        this.result = -1
    }

    complete(position_second) {
        this.position_second = position_second
        this.value_second = this.cards[position_second].value
        this.result = this.value_first == this.value_second
    }
}


class Attempts {
    constructor(deck) {
        this.cards = deck.cards
        this.list = []
    }

    last() {
        return this.list[this.list.length - 1]
    }

    isClosed() {
        return this.list[this.list.length - 1] == undefined || this.list[this.list.length - 1].result != -1
    }

    push(position) {
        var isClosed = this.isClosed()
        if (isClosed) {
            this.list.push(new SingleAttempt(this.cards, position))
        }
        else {
            this.list[this.list.length - 1].complete(position)
        }    
    }

    lastResult() {
        return this.list[this.list.length - 1] == undefined ? null : this.list[this.list.length - 1].result
    }
}


class Timer {
    constructor() {
        this.startTime
        this.count
    }

    start() {
        this.startTime = performance.now()
    }

    elapsed() {
        return performance.now() - this.startTime
    }

    printTime($el) {
        this.count = setInterval(() => {
            $el.html(Math.round(this.elapsed() / 1000))
        }, 1000);
    }

    stopPrintTime() {
        clearInterval(this.count)
    }
}


/* FUNCTIONS */
function resetCards() {
    $('.card[position="' + attempts.last().posision_first + '"]').toggleClass('flipped')
    $('.card[position="' + attempts.last().position_second + '"]').toggleClass('flipped')

    if (attempts.lastResult()) {
        $('.card[position="' + attempts.last().posision_first + '"]').slideUp() 
        $('.card[position="' + attempts.last().posision_first + '"]').addClass('removed')
        $('.card[position="' + attempts.last().position_second + '"]').slideUp() 
        $('.card[position="' + attempts.last().position_second + '"]').addClass('removed')
        if ($('.card').not('.removed').length == 0) endgame()
    }
    $('.card').parent().toggleClass('layer')
}


function resetAll() {
    try {
        timer.stopPrintTime()
        attempts.list = []
    } catch {}
    $('#attempts').html('0')
    $('#time').html('00')
    $('#board').html('')
}


/* MAIN FUNCTIONS */
function startGame() {
    resetAll()
    
    $('#text-admin').html('Game started!<br><br>Choose a card to start the clock.')
    level = parseInt($('input[name="level"]:checked').attr('value'))
    $('#level').html(level)
    
    buildTable(board, level)
    
    deck = new Deck(nCard_per_level[level])
    deck.printDeck($('.card-up'), $('.card-down'))

    attempts = new Attempts(deck)
    timer = new Timer()

    // Timer start at first click on the board
    board.click(function() {
        self.timer.start()
        self.timer.printTime($('#time')) 
        board.unbind('click')   //Timer start only once
    })

    $('.card').click(user_click)
}


function user_click() {
    $(this).toggleClass('flipped')
    $(this).parent().toggleClass('layer')

    attempts.push($(this).attr('position'))

    if (attempts.isClosed()) {
        $('.card').parent().not('.layer').toggleClass('layer')
        setTimeout(resetCards, 1000)
        if (attempts.lastResult()) {
            $('#text-admin').html('Great! Go ahead.')
        } else {
            $('#text-admin').html('Wrong! Try again!')
        }
    } else {$('#text-admin').html('Pick another card.')}

    $('#attempts').html(attempts.list.length) 
}


function endgame() {
    end_time = timer.elapsed()/1000
    timer.stopPrintTime()
    final_score = Math.round(1000 / (attempts.list.length/2 + end_time))

    $('#text-admin').html('Congratulations, you win!')
}




/*******************************/
/********* MAIN SCRITP *********/
/*******************************/

/* GLOBAL VARIABLE */
const nCard_per_level = [null, 16, 32, 48, 64]
const boardClass_per_level =  [
    null, 
    ['board_size1', 'scene_size1'], 
    ['board_size2', 'scene_size2'], 
    ['board_size3', 'scene_size3'], 
    ['board_size1', 'scene_size4']
]
const board = $('#board')
const play_button = $('#play-button')

var level
var deck
var attempts
var timer
var end_time


/* EVENTS */
play_button.click(startGame);
