console.log('main.js is working')
console.log($)




/* CLASSES */
class Card {
    constructor(value, faceUp=false) {
        this.value = value;
        this.faceUp = faceUp;
    }

    flip() {
        this.faceUp = !this.faceUp
    }

    printFace() {
        return this.faceUp ? '<span>' + this.value + '</span>' : '<span>?</span>'
    }
}

/* FUNCTIONS */
function difficultLevel(userChoise) {
    // A function accepting an integer "userChoise" and returning an integer according to the game rules as described in README.md; return -1 if parameter is invalid.
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


function buildTable($el, n) {
    content = ''
    for (let i = 0; i < n; i++) {
        content += '<div class="scene"><div position="' + i + '" class="card relative"><div class="card-face card-down absolute"></div>  <div class="card-face card-up absolute"></div></div></div>'
    }
    $el.html(content);
}
    

function buildDeck(n) {
    array = []
    for (let i = 0; i < n / 2; i++) {
        var newNumber = Math.floor(Math.random() * 100)
        array.push(new Card(newNumber), new Card(newNumber))
    }
    return array
}


function shuffle(array) {
    var m = array.length, t, i;
    while (m) { // While there remain elements to shuffle…
        i = Math.floor(Math.random() * m--) // Pick a remaining element…
        t = array[m]; // And swap it with the current element.
        array[m] = array[i]
        array[i] = t
    }
    return array
}


function printDeck(array) {
    for (let i = 0; i < array.length; i ++) {
        $('.card-up')[i].innerHTML = array[i].value
        $('.card-down')[i].innerHTML = array[i].printFace()
    }
}


/* GLOBAL VARIABLE */
const board = $('#board')
const play_button = $('#play-button')

var level;
var deck_array = []



/* MAIN FUNCTIONS */
function startGame() {
    var attempted = []
    
    level = parseInt($('input[name="level"]:checked').attr('value'))
    $('#level').html(level)
    
    total_cards = difficultLevel(level)
    
    buildTable(board, total_cards)
    
    deck_array = shuffle(buildDeck(total_cards))

    printDeck(deck_array)

    $('.card').click(function() { 
        if (!$(this).hasClass('blocked')) {
            $(this).toggleClass('flipped')
            attempted.push($(this).attr('position'))
            console.log(attempted)
            if (attempted.length == 2) {
                if (deck_array[attempted[0]].value == deck_array[attempted[1]].value) {
                    console.log('match')
                    // block cards
                    $('.card[position="' + attempted[0] + '"]').addClass('blocked')
                    $('.card[position="' + attempted[1] + '"]').addClass('blocked')
                    attempted = []
                    if ($('.card:not(.blocked)').length == 0) {
                        alert('you win!')
                    }
                }
                else {
                    function a() {
                        $('.card[position="' + attempted[0] + '"]').toggleClass('flipped')
                        $('.card[position="' + attempted[1] + '"]').toggleClass('flipped')
                        attempted = []}
                    setTimeout(a, 1000)
                }
            }    
        }
    });
}




/* PROGRAM */
play_button.click(startGame);





/*
scelta difficoltà

generare board

creare carte random (metà dei bottoni)

Iterazione:
    clicca 1
    clicca 2 
*/