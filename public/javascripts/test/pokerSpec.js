define(['poker', 'moment'], function(poker, moment) {

    var startingStack = 500;

    var levels = [
        { sb: 15, bb:  30, a: 1, min: 10 },
        { sb: 20, bb:  40, a: 2, min: 10 },
        { sb: 25, bb:  50, a: 3, min: 10 }
    ];
    var allPlayers = [
        { name: 'Christina Park', id: 'sparky' },
        { name: 'Hyo Jin Chung', peerId: 'jin' },
        { name: 'Minhee Cho', peerId: 'minnie' },
        { name: 'Alan Chusuei', peerId: 'lockheart' },
        { name: 'Simon Park', peerId: 'ttt' },
        { name: 'Will Lee', peerId: 'nerdz' }, 
    ];

    describe('A Table', function() {

        beforeEach(function() {
            var newPlayers = [];
            _.each(allPlayers, function(p) {
                newPlayers.push(poker.createPlayer(p.name, startingStack));
            });
            this.table = poker.createTable(newPlayers);
        });

        it('should be initialized properly', function() {
            expect(this.table.players.length).toEqual(allPlayers.length);
            // Check that player order was randomized.
            var matching = true;
            for (p = 0; p < allPlayers.length; p++) {
                console.info('original:' + allPlayers[p].name + ' | new:' + this.table.players[p].name);
                if (allPlayers[p].name != this.table.players[p].name) {
                    matching = false;
                }
            }
            expect(matching).toBeFalsy();
        });
    });

    describe('A BlindStructure', function() {

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

        it('should move to the next level when the time for the level is up.', function() {
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

        it('should NOT move to the next level when the time for the level is not yet up', function() {
            var level = this.blindStructure.getBlindLevel();
            var lastChangeTime = this.blindStructure.lastTimeBlindsWentUp.clone();

            // assuming the blind levels are at least a few seconds ...
            var newLevel = this.blindStructure.getBlindLevel();
            expect(level.sb).toEqual(15);
            expect(level.bb).toEqual(30);
            expect(level.a).toEqual(1);
            expect(this.blindStructure.currentLevel).toEqual(0);
            expect(this.blindStructure.lastTimeBlindsWentUp).toEqual(lastChangeTime);
        });
    });

    describe('A Player', function() {

        var name = 'alan';
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