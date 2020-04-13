console.log('main.js is working')
console.log($)


/** UTILITY FUNCTIONS **/

function randomNumberSet(n, min, max) {
    //Accepts integers n, min, max; and returns a set of different n integers, between min, included, and max, excluded. 
    var randomNumbers = new Set()

    if (isNaN(n) || n < 1 || isNaN(max) || isNaN(min)) {return -1}  // Validation

    while (randomNumbers.size < n) {
        randomNumbers.add(Math.floor(Math.random() * (max - min)) + min)
    }
    
    return randomNumbers
}


function shuffle(array) {
    //Shuffling randomly array item's position
    var m = array.length, t, i;
    while (m) { 
        i = Math.floor(Math.random() * m--) 
        t = array[m]; 
        array[m] = array[i]
        array[i] = t
    }
}


/**  CLASSES and FUNCTIONS**/
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
    // A deck of n/2 pairs of cards, bearing the cards of each card the same random rank from 10 to 99, both included.
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
    //An attempt is made of two tries, i.e. by two element of class Card chosesn by the player. 
    constructor(position, rank) {
        this.first_pos = position
        this.first_rank = rank
        this.second_pos = null  //An istance of the class is initialize an instance when the player pick the first card, thus values for the second card are null.
        this.second_rank = null
        this.result = -1    //An attempts is successful (true) if both elements of class Card have equal rank. Default value is -1 for incomplite attempts. 
    }

    complete(position, rank) {
        this.second_pos = position
        this.second_rank = rank
        this.result = this.first_rank == this.second_rank
    }
}


class Game {
    static nCard_per_level() {return [null, 16, 32, 48, 64]}
    static boardClass_per_level()  {return [
        null, 
        ['board_size1', 'scene_size1'], 
        ['board_size2', 'scene_size2'], 
        ['board_size3', 'scene_size3'], 
        ['board_size1', 'scene_size4']
    ]}

    constructor() {
        this.level = level_inputs.filter(':checked').attr('value')
        this.deck = new Deck(Game.nCard_per_level()[this.level])      
        this.timer = new Timer
        this.attempts = []  //List of all'attempts, an attempts being a pair of cards chosen by the player
    }

    buildBoard() {
        //Building a board, assigning classes, and printing the deck on the board.
        var content = '<div class="board-wrapper inline-fl-w '+ Game.boardClass_per_level()[this.level][0] + '">'

        for (let i = 0; i < Game.nCard_per_level()[this.level]; i++) {
            content += '<div class="scene ' + Game.boardClass_per_level()[this.level][1] + '"><div position="' + i + '" class="card relative"><div class="card-face card-down absolute"></div>  <div class="card-face card-up absolute"></div></div></div>'
        }

        board.html(content + '</div>')

        this.deck.printDeck($('.card-up'), $('.card-down'))
    }

    mainPhase() {
        var self = this
        var pendingAttempt = false  //An attempt is made of two tries, and is pending after the first try and completed after the second

        board.click(function() {
            self.timer.start()
            self.timer.printTime($('#time')) 
            board.unbind('click')   //Timer starts only once
        })

        $('.card').click(function() {
            var position = $(this).attr('position')
            var rank = self.deck.cards[position].rank

            $(this).toggleClass('flipped')
            $(this).parent().toggleClass('layer')

            if (pendingAttempt) {
                try {self.attempts[self.attempts.length-1].complete(position, rank)} catch {}
                pendingAttempt = !pendingAttempt    //Next try shall open new attempt
            } else {
                self.attempts.push(new Attempt(position, rank))
                pendingAttempt = !pendingAttempt    //Next try shall complete the attempt
            }

            if (pendingAttempt) mess_box.html('Pick another card.')
            else {
                $('.card').parent().not('.layer').toggleClass('layer')  //Blocks every card for animation

                setTimeout(function() {
                    $('.card[position="' + self.attempts[self.attempts.length-1].first_pos + '"]').toggleClass('flipped')
                    $('.card[position="' + self.attempts[self.attempts.length-1].second_pos + '"]').toggleClass('flipped')

                    if (self.attempts[self.attempts.length-1].result) { //If attempts successful the two cards are removed from the game
                        $('.card[position="' + self.attempts[self.attempts.length-1].first_pos + '"]').slideUp() 
                        $('.card[position="' + self.attempts[self.attempts.length-1].first_pos + '"]').addClass('removed')
                        $('.card[position="' + self.attempts[self.attempts.length-1].second_pos + '"]').slideUp() 
                        $('.card[position="' + self.attempts[self.attempts.length-1].second_pos + '"]').addClass('removed')
                        if ($('.card').not('.removed').length == 0) {//Player has cleared all the cards in the board
                            self.timer.stopPrintTime()
                            mess_box.html('Congratulations, you win!')
                        }
                    }
                    $('.card').parent().toggleClass('layer')
                }, 1000)

                if (self.attempts[self.attempts.length-1].result) {
                    mess_box.html('Great!')
                } else {
                    mess_box.html('Wrong! Try again!')
                }
            }

            $('#attempts').html(self.attempts.length) 
        })
    }

    start() {
        mess_box.html('Game started!<br><br>Choose a card to start the clock.')
        level_display.html(this.level)
        this.buildBoard()
        this.mainPhase()
    }
}


function resetAll() {
    try {
        game.timer.stopPrintTime()
        attempts.list = []
    } catch {}
    $('#attempts').html('0')
    $('#time').html('00')
    $('#board').html('')
}


/*******************************/
/********* MAIN SCRITP *********/
/*******************************/

/* GLOBAL VARIABLE */
const board = $('#board')
const play_button = $('#play-button')
const level_inputs = $('input[name="level"]')
const mess_box = $('#text-admin')
const level_display = $('#level')


/* EVENTS */
play_button.click(
    function() {
        resetAll()
        game = new Game
        game.start()
    }
)
