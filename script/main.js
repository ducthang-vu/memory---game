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
const info_button = $('#info-button')
const level_display = $('#level')
const level_inputs = $('input[name="level"]')
const mess_box = $('#text-admin')
const play_button = $('#play-button')
const rules_box = $('#rules')
const temp_board = $('.template .board-wrapper')
const templ_scene = $('.template .scene')
const time_display = $('#time')
const volume_button = $('#volume-button')

var activeAudio = true


/***********************************************/
/********* --- CLASSES & FUNCTIONS --- *********/
/***********************************************/

/** UTILITY FUNCTIONS **/

function randomNumberSet(n, min, max) {
    //Accepts integers n, min, max; and returns a set of different n integers, between min, included, and max, excluded. 
    var randomNumbers = new Set()

    if (isNaN(n) || isNaN(max) || isNaN(min) || min >  max || n > (max - min)) throw 'Parameters are invalid'

    while (randomNumbers.size < n) randomNumbers.add(Math.floor(Math.random() * (max - min)) + min)
    
    return randomNumbers
}


function shuffle(array) {
    //Shuffling randomly array item's positions
    var m = array.length, t, i;
    while (m) { 
        i = Math.floor(Math.random() * m--) 
        t = array[m]; 
        array[m] = array[i]
        array[i] = t
    }
}


/** CLASSES and FUNCTIONS **/
class Card {
    constructor(value, back='?') {
        this.rank = value;
        this.back = back;
    }

    printFace(n) {
        return n ? '<span>' + this.rank + '</span>' : '<span>' + this.back + '</span>'
    }
}


class Deck {
    // A deck of n/2 pairs of cards of same rank; each pair having a different and random rank from 10 to 99, both included.
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


class Attempt {
    //An attempt is made of two tries, i.e. by two elements of class Card chosen by the player. 
    constructor(position, rank) {
        this.first_pos = position
        this.first_rank = rank
        this.second_pos = null  //An istance of the class is initialized when the player pick the first card, thus values for the second card are null.
        this.second_rank = null
        this.result = -1    //An attempt is successful (true) if both elements of class Card have equal rank. Default value is -1 for incomplite attempts. 
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
        this.attempts = []  //List of all attempts, an attempt being a pair of cards chosen by the player
        this.successfulAttempts = 0
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

        for (let i = 0; i < Game.nCard_per_level[this.level]; i++) {
            var new_scene = templ_scene.clone()

            new_scene.addClass(Game.boardClass_per_level[this.level][1])
            new_scene.children('.card').attr( "data-position", i)
            new_scene.appendTo(board.children('.board-wrapper'))
        }

        this.deck.printDeck($('.card-up'), $('.card-down'))

        board.slideDown('slow')
    }

    messageUser(kind) {
        mess_box.html(Game.messages[kind])
    }

    removeCards() {
        //Removes cards from the board chosen in last attempt (two tries); should be used after a successful attempt.
        $('.card[data-position="' + self.attempts[self.attempts.length-1].first_pos + '"]').slideUp() 
        $('.card[data-position="' + self.attempts[self.attempts.length-1].second_pos + '"]').slideUp() 
        self.successfulAttempts++
    }

    mainPhase() {
        /* MAIN PHASE FUNCTIONs */
        function newAttempt(position, rank) {
            //The player has started a new attempt, by picking the first card (first try)
            self.attempts.push(new Attempt(position, rank))
            self.messageUser('invitesComplete')
        }


        function completeAttempt(position, rank) {
            // The player is compliting a pending attempt, by picking the second card (second try)
            {try {self.attempts[self.attempts.length-1].complete(position, rank)} catch {}} 
            $('.card').parent().not('.layer').toggleClass('layer')  //Blocks every card for animation

            setTimeout(()=> {
                if (self.attempts.slice(-1)[0].result) { 
                    self.removeCards() //If attempts successful the two cards are removed from the game
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
        var pendingAttempt = false  //An attempt is made of two tries, and is pending after the first try and completed after the second
    
        $('.card').click(function() {
            var position = $(this).attr('data-position')
            var rank = self.deck.cards[position].rank
    
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
    // Resets clock and messages boxes; should be used when player starts a new game.
    try {
        game.timer.stopPrintTime()
        attempts.list = []
    } catch {}

    attempts_display.html('0')
    time_display.html('00')
    board.html('')
    board.hide()
}


function showInfo() {
    rules_box.toggle()
    info_button.toggleClass('darkred-color')
    info_button.children().toggleClass('fa-question-circle fa-window-close')
} 


function switchVolume() {
    activeAudio = !activeAudio
    icon_volume.toggleClass('fa-volume-up fa-volume-mute')
    icon_switch.toggleClass('fa-toggle-on fa-toggle-off')
    icon_switch.toggleClass('darkgreen-color darkred-color')
}



/***************************************/
/********* --- MAIN SCRITP --- *********/
/***************************************/


/* EVENTS */
volume_button.click(switchVolume)
info_button.click(showInfo)

play_button.click(() => {
    resetAll()
    game = new Game
    game.start()
    }
)
