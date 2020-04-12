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


class Game {
    static nCard_per_level() {return {1: 16, 2: 32, 3: 48, 4: 64}}

    constructor() {
        this.level = level_inputs.filter(':checked').attr('value')
        this.deck = new Deck(Game.nCard_per_level()[this.level])
        this.attempts 
        this.timer
        this.end_time
    }


    startGame() {
       
    }
}

/*******************************/
/********* MAIN SCRITP *********/
/*******************************/

/* GLOBAL VARIABLE */
const board = $('#board')
const play_button = $('#play-button')
const level_inputs = $('input[name="level"]')






/* EVENTS */


play_button.click(function() {
    game = new Game
    game.start()
});


/*********************************************/

