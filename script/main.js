console.log('main.js is working')
console.log($)


/*******************************************/
/********* --- GLOBAL VARIABLE --- *********/
/*******************************************/
const attempts_display = $('#attempts')
const audioBleep = document.getElementById('audio-bleep')
const audioSuccess = document.getElementById('audio-success')
const audioVictory = document.getElementById('audio-victory')
const board = $('#board')
const icon_switch = $('#icon-switch')
const icon_volume = $('#icon-volume')
const level_display = $('#level')
const level_inputs = $('input[name="level"]')
const mess_box = $('#text-admin')
const rules_box = $('#rules')
const temp_board = $('.template .board-wrapper')
const templ_scene = $('.template .scene')
const time_display = $('#time')


/***********************************************/
/********* --- CLASSES & FUNCTIONS --- *********/
/***********************************************/

/** UTILITY FUNCTIONS **/

function randomNumberSet(n, min, max) {
    //Accepts integers n, min, max; and returns a set of different n integers, between min, included, and max, excluded. 
    let randomNumbers = new Set()

    if (isNaN(n) || isNaN(max) || isNaN(min) || min >  max || n > (max - min)) throw 'Parameters are invalid'

    while (randomNumbers.size < n) randomNumbers.add(Math.floor(Math.random() * (max - min)) + min)
    
    return randomNumbers
}


function shuffle(array) {
    //Shuffling randomly array item's positions
    let m = array.length, t, i;
    while (m) { 
        i = Math.floor(Math.random() * m--) 
        t = array[m]; 
        array[m] = array[i]
        array[i] = t
    }
}


/** CLASSES **/

class Deck {
    // A deck of n/2 pairs of cards of same rank; each pair having a different and random rank from 10 to 99, both included.
    constructor(n) {
        this.cards = []
        for (let number of randomNumberSet(n/2, 10, 100)) {
            this.cards.push(number, number)
        }
        shuffle(this.cards)
    }

    printDeck($el_front) {
        for (const [index, card] of this.cards.entries()) {
            $el_front[index].innerHTML = card
        }
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

    printTime($el) {
        this.count = setInterval(() => {
            $el.html(Math.round((performance.now() - this.startTime) / 1000))
        }, 1000);
    }

    stopPrintTime() {
        clearInterval(this.count)
    }
}


class Attempt {
    //An attempt is made of two tries; is successful if cards' ranks are equal.
    constructor(position, rank) {
        this.first_pos = position
        this.first_rank = rank
        this.second_pos = null  //An istance of the class is initialized when the player pick the first card.
        this.second_rank = null
        this.result = -1    //Default value is -1 for incomplite attempts, otherwise a boolean.
    }

    complete(position, rank) {
        this.second_pos = position
        this.second_rank = rank
        this.result = this.first_rank == this.second_rank
    }
}


class Game {
    static nCard_per_level = [null, 16, 32, 48, 64]

    static boardClass_per_level = [
        null, 
        ['board_size1', 'scene_size1'], 
        ['board_size2', 'scene_size2'], 
        ['board_size3', 'scene_size3'], 
        ['board_size1', 'scene_size4']
    ]

    static messages = {
        'start': 'Game started!<br><br>Choose a card to start the clock.',
        'invitesComplete': 'Pick another card.',
        'successAttempt': 'Great!',
        'failedAttempt': 'Wrong! Try again!',
        'victory': 'Congratulations, you win!'
    }

    constructor() {
        self = this
        this.level = level_inputs.filter(':checked').attr('value')
        this.deck = new Deck(Game.nCard_per_level[this.level])      
        this.timer = new Timer
        this.attempts = []  //List of all attempts
        this.successfulAttempts = 0
    }
    
    messageUser(kind) {
        mess_box.html(Game.messages[kind])
    }

    activateTimer() {
        board.children().click(() => {
            self.timer.start()
            self.timer.printTime(time_display) 
            audioBleep.play()
            board.children().unbind('click')   //Timer starts only once
            }
        )
    }

    buildBoard() {
        //Building a board, assigning classes, and printing the deck on the board.
        board.html(temp_board.clone().addClass(Game.boardClass_per_level[this.level][0]))

        for (let i = 0; i < this.deck.cards.length; i++) {
            let new_scene = templ_scene.clone()

            new_scene.addClass(Game.boardClass_per_level[this.level][1])
            new_scene.children('.card').attr( "data-position", i)
            new_scene.appendTo(board.children('.board-wrapper'))
        }

        this.deck.printDeck($('.card-up'))

        board.slideDown('slow')
    }

    removeCards() {
        //Removes cards from the board chosen in last attempt (two tries).
        $('.card[data-position="' + self.attempts.slice(-1)[0].first_pos + '"]').slideUp() 
        $('.card[data-position="' + self.attempts.slice(-1)[0].second_pos + '"]').slideUp() 
    }

    mainPhase() {
        /* MAIN PHASE FUNCTIONs */
        function newAttempt(position, rank) {
            //The player stars a new attempt, having picked the first card 
            self.attempts.push(new Attempt(position, rank))
            self.messageUser('invitesComplete')
        }


        function completeAttempt(position, rank) {
            // The player is compliting a pending attempt, haing picked the second card 
            try {
                self.attempts.slice(-1)[0].complete(position, rank)
            } catch {} 
            
            $('.card').parent().not('.layer').toggleClass('layer')  //Blocks every card for animation

            setTimeout(()=> {
                if (self.attempts.slice(-1)[0].result) { 
                    self.removeCards()
                    self.successfulAttempts++
                    audioSuccess.play()

                    if (2 * self.successfulAttempts == Game.nCard_per_level[self.level]) {    //Player has cleared the board
                        self.timer.stopPrintTime()
                        self.messageUser('victory')
                        audioVictory.play()
                    }
                }

                $('.card[data-position="' + self.attempts.slice(-1)[0].first_pos + '"]').toggleClass('flipped')
                $('.card[data-position="' + self.attempts.slice(-1)[0].second_pos + '"]').toggleClass('flipped')
                $('.card').parent().toggleClass('layer')    //The board is reactivated
                }, 
                1000
            )

            self.attempts.slice(-1)[0].result ?  self.messageUser('successAttempt') : self.messageUser('failedAttempt')
        }


        /* MAIN PHASE SCRIPT */
        var pendingAttempt = false  //An attempt is pending after the first try and completed after the second.
    
        $('.card').click(function() {
            let position = $(this).attr('data-position')
            let rank = self.deck.cards[position]
    
            $(this).toggleClass('flipped')
            $(this).parent().toggleClass('layer') //Blocks card from being clicked again in the next try
    
            pendingAttempt ? completeAttempt(position, rank) : newAttempt(position, rank)
    
            pendingAttempt = !pendingAttempt
            attempts_display.html(self.attempts.length) 
        })
    }

    start() {
        this.messageUser('start')
        audioBleep.play()
        level_display.html(this.level)
        this.buildBoard()
        this.activateTimer()
        this.mainPhase()
    }
}


function resetAll() {
    // Resets clock and messages boxes.
    try {
        game.timer.stopPrintTime()
    } catch {}

    attempts_display.html('0')
    time_display.html('00')
    board.html('')
    board.hide()
}


function showInfo() {
    rules_box.toggle()
    $('#info-button').toggleClass('darkred-color')
    $('#info-button').children().toggleClass('fa-question-circle fa-window-close')
} 


function switchVolume() {
    Array.from($('audio')).forEach(audio => audio.muted = !audio.muted)
    
    icon_volume.toggleClass('fa-volume-up fa-volume-mute')
    icon_switch.toggleClass('fa-toggle-on fa-toggle-off')
    icon_switch.toggleClass('darkgreen-color darkred-color')
}


/***************************************/
/********* --- MAIN SCRITP --- *********/
/***************************************/

/* EVENTS */
$('#volume-button').click(switchVolume)
$('#info-button').click(showInfo)

$('#play-button').click(() => {
    resetAll()
    game = new Game
    game.start()
    }
)
