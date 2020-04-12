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


function buildTable($el, n) {
    size_array = []
    switch (n) {
        case 16:
            size_array = ['board_size1', 'scene_size1']
            break
        case 32:
            size_array = ['board_size2', 'scene_size2']
            break
        case 48:
            size_array = ['board_size3', 'scene_size3']
            break
        case 64:
            size_array = ['board_size1', 'scene_size4']
            break
        default:
            console.log('BoardSize Error')  
            return -1
    }

    content = '<div class="board-wrapper inline-fl-w '+ size_array[0] + '">'
    for (let i = 0; i < n; i++) {
        content += '<div class="scene ' + size_array[1] + '"><div position="' + i + '" class="card relative"><div class="card-face card-down absolute"></div>  <div class="card-face card-up absolute"></div></div></div>'
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
    constructor(cards=[]) {
        this.cards = cards
    }
    
    buildDeck(n) {
        for (let number of randomNumberSet(n/2, 10, 100)) {
            this.cards.push(new Card(number), new Card(number))
        }
    }

    shuffle() {
        var m = this.cards.length, t, i;
        while (m) { // While there remain elements to shuffle…
            i = Math.floor(Math.random() * m--) // Pick a remaining element…
            t = this.cards[m]; // And swap it with the current element.
            this.cards[m] = this.cards[i]
            this.cards[i] = t
        }
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

    elapsed_seconds() {
        return Math.round(this.elapsed() / 1000)
    }

    printTime($el) {
        this.count = setInterval(() => {
            $el.html(this.elapsed_seconds())
        }, 1000);
    }

    stopPrintTime() {
        clearInterval(this.count)
    }
}


/* FUNCTIONS */
function difficultLevel(userChoise) {
    switch (userChoise) {
        case 1:
            return 16
        case 2:
            return 32
        case 3: 
            return 48
        case 4: 
            return 64
        default:
            return -1
    }
}


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

    $('#level').html(level)
    $('#text-admin').html('Game started!<br><br>Choose a card to start the clock.')
    level = parseInt($('input[name="level"]:checked').attr('value'))
    
    n_cards = difficultLevel(level)
    
    buildTable(board, n_cards)
    
    deck = new Deck()
    deck.buildDeck(n_cards)
    deck.shuffle()
    deck.printDeck($('.card-up'), $('.card-down'))

    attempts = new Attempts(deck)
    timer = new Timer()

    $('.card').click(user_click)
}


function user_click() {
    $(this).toggleClass('flipped')
    $(this).parent().toggleClass('layer')

    if (attempts.list.length == 0) {
        timer.start()
        timer.printTime($('#time')) 
    }

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
const board = $('#board')
const play_button = $('#play-button')

var level
var deck
var attempts
var timer
var end_time
// var final_score


/* EVENTS */
play_button.click(startGame);
