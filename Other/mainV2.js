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




/**  CLASSES **/
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

class SingleAttempt {
    constructor(cards, posision_first) {
        this.cards = cards
        this.posision_first = posision_first
        this.rank_first = this.cards[this.posision_first].value
        this.position_second = null
        this.rank_second = null
        this.result = -1
    }

    complete(position_second) {
        this.position_second = position_second
        this.rank_second = this.cards[position_second].rank
        this.result = this.rank_first == this.rank_second
    }
}

class Attempt {

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
        this.attempts = []
        this.timer = new Timer
        this.end_time
    }

    buildBoard() {
        
        //Building a board, assigning classes, printing the deck on the board.
        var content = '<div class="board-wrapper inline-fl-w '+ Game.boardClass_per_level()[this.level][0] + '">'

        for (let i = 0; i < Game.nCard_per_level()[this.level]; i++) {
            content += '<div class="scene ' + Game.boardClass_per_level()[this.level][1] + '"><div position="' + i + '" class="card relative"><div class="card-face card-down absolute"></div>  <div class="card-face card-up absolute"></div></div></div>'
        }

        board.html(content + '</div>')

        this.deck.printDeck($('.card-up'), $('.card-down'))
    }

    activatingBoard() {
        var self = this

        board.click(function() {
            self.timer.start()
            self.timer.printTime($('#time')) 
            console.log('a')
            board.unbind('click')   //Timer start only once
        })

        $('.card').click(function() {
            $(this).toggleClass('flipped')
            $(this).parent().toggleClass('layer')

            var position = $(this).attr('position')
            var value = self.deck.cards[position]

        })
    }

    start() {
        mess_box.html('Game started!<br><br>Choose a card to start the clock.')
        level_display.html(this.level)
        this.buildBoard()
        this.activatingBoard()
    }
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


play_button.click(function() {
    game = new Game
    game.start()
});


/*********************************************/

