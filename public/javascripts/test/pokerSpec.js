define(['poker', 'moment'], function(poker, moment) {

    describe('The blind structure', function() {

        var startingStack = 5000;
        var levels = [
            { sb: 15, bb:  30, a: 1, min: 10 },
            { sb: 20, bb:  40, a: 2, min: 10 },
            { sb: 25, bb:  50, a: 3, min: 10 }
        ];

        beforeEach(function() {
            this.blindStructure = poker.createBlindStructure(startingStack, levels);
        });

        it('should be initialized properly', function() {
            expect(this.blindStructure.startingStack).toEqual(startingStack);
            expect(this.blindStructure.levels.length).toEqual(levels.length);
        });

        it('should pull the first blind level when getBlindLevel is called the first time', function() {
            var testTime = moment();
            var level = this.blindStructure.getBlindLevel();

            expect(level.sb).toEqual(15);
            expect(level.bb).toEqual(30);
            expect(level.a).toEqual(1);
            expect(this.blindStructure.currentLevel).toEqual(0);
            expect(this.blindStructure.lastTimeBlindsWentUp.isAfter(testTime)).toBeTruthy();
        });

        it('should move to the next level when enough time has passed', function() {
            var level = this.blindStructure.getBlindLevel();
            var lastChangeTime = this.blindStructure.lastTimeBlindsWentUp.clone();
            this.blindStructure.lastTimeBlindsWentUp.subtract(level.min + 2, 'minutes');

            var newLevel = this.blindStructure.getBlindLevel();
            expect(newLevel.sb).toEqual(20);
            expect(newLevel.bb).toEqual(40);
            expect(newLevel.a).toEqual(2);
            expect(this.blindStructure.currentLevel).toEqual(1);
            expect(this.blindStructure.lastTimeBlindsWentUp.isAfter(lastChangeTime)).toBeTruthy();
        });


        it('moment clone works?', function() {
            var a = moment([2012]);
            var b = a.clone();
            a.year(2000);
            expect(b.year()).toEqual(2012);
        });
    });

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