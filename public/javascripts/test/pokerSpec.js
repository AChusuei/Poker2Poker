define(['poker'], function(poker) {

    describe('A player', function() {

        var name = 'alan';
        var startingStack = 500;
        var tinyBet = 5;
        var smallBet = 50;

        beforeEach(function() {
            this.player = poker.createPlayer(name, startingStack);
        });

        it('should be initialized properly', function() {
            expect(this.player.name).toEqual(name);
            expect(this.player.stack).toEqual(startingStack);
            expect(this.player.liveBet).toEqual(0);
        });

        it('posting blinds and antes only counts the blind as live', function() {
            var pot = 0;
            pot += this.player.ante(10);
            pot += this.player.bet(100);
            expect(this.player.stack).toEqual(390);
            expect(pot).toEqual(110);
            expect(this.player.liveBet).toEqual(100);
        });

        it('has their stack is depleted by the amount they ante', function() {
            expect(this.player.ante(smallBet)).toEqual(smallBet);
        });

        it('making a bet has their stack is depleted by the amount they bet', function() {
            expect(this.player.bet(smallBet)).toEqual(smallBet);
        });

        it('calling a bet in front has their stack is depleted by the amount they call when no chips have been put into the pot', function() {
            expect(this.player.call(smallBet)).toEqual(smallBet);
        });

        it('calling a raise has their stack is depleted by the difference of the chips they have in play and the amount of the raise', function() {
            var pot = this.player.bet(smallBet);
            expect(this.player.call(smallBet * 3)).toEqual(smallBet * 2);
            expect(this.player.liveBet).toEqual(smallBet * 3);
        });

        it('has their stack is reduced to zero when they go all in', function() {
            this.player.allIn();
            expect(this.player.stack).toEqual(0);
        });

        it('can only ante what is in their stack', function() {
            expect(this.player.ante(5000)).toEqual(startingStack);
        });

        it('can only bet what is in their stack', function() {
            expect(this.player.bet(5000)).toEqual(startingStack);
        });

        it('can only raise with what is in their stack', function() {
            expect(this.player.call(5000)).toEqual(startingStack);
        });

        it('can only go all in with what is in their stack', function() {
            expect(this.player.allIn()).toEqual(startingStack);
        });

        it('never counts an ante towards a live bet (pre-flop)', function() {
            this.player.ante(smallBet);
            expect(this.player.liveBet).toEqual(0);
        });

        it('counts a bet towards a live bet', function() {
            this.player.bet(smallBet);
            expect(this.player.liveBet).toEqual(smallBet);
        });

        it('counts a call towards the live bet', function() {
            this.player.bet(tinyBet);
            this.player.call(smallBet);
            expect(this.player.liveBet).toEqual(smallBet);
        });

        it('going all in puts their entire stack towards the live bet', function() {
            this.player.bet(tinyBet); // tiny little bet.
            this.player.bet(smallBet); // I four-bet someone who three bet me
            this.player.allIn(); // ah screw it, all in.
            expect(this.player.liveBet).toEqual(startingStack);
        });

    });

});