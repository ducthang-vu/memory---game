    mainPhase() {
        var pendingAttempt = false  //An attempt is made of two tries, and is pending after the first try and completed after the second

        $('.card').click(function() {
            var position = $(this).attr('position')
            var rank = self.deck.cards[position].rank

            $(this).toggleClass('flipped')
            $(this).parent().toggleClass('layer') //Blocks card from being clicked again in the next try

            if (pendingAttempt) {try {self.attempts[self.attempts.length-1].complete(position, rank)} catch {}} 
            else {self.attempts.push(new Attempt(position, rank))}

            pendingAttempt = !pendingAttempt

            if (pendingAttempt) mess_box.html('Pick another card.')
            else {
                $('.card').parent().not('.layer').toggleClass('layer')  //Blocks every card for animation

                setTimeout(function() {
                    $('.card[position="' + self.attempts.slice(-1)[0].first_pos + '"]').toggleClass('flipped')
                    $('.card[position="' + self.attempts.slice(-1)[0].second_pos + '"]').toggleClass('flipped')

                    if (self.attempts.slice(-1)[0].result) { 
                        self.removeCards() //If attempts successful the two cards are removed from the game

                        if (2 * self.successfulAttempts == Game.nCard_per_level()[self.level]) {//Player has cleared the board
                            self.timer.stopPrintTime()
                            mess_box.html('Congratulations, you win!')
                        }
                    }
                    $('.card').parent().toggleClass('layer')
                }, 1000)

                self.attempts.slice(-1)[0].result ?  mess_box.html('Great!') : mess_box.html('Wrong! Try again!')
            }

            $('#attempts').html(self.attempts.length) 
        })
    }