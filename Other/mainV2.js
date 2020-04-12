
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







/*******************************/
/********* MAIN SCRITP *********/
/*******************************/

/* GLOBAL VARIABLE */
const board = $('#board')
const play_button = $('#play-button')





















/* EVENTS */
play_button.click(startGame);


/*********************************************/

