define(['poker', 'moment'], function(poker, moment) {

    var startingStack = 500;

    var levels = [
        { smallBlind: 15, bigBlind: 30, ante: 1, min: 10 },
        { smallBlind: 20, bigBlind: 40, ante: 2, min: 10 },
        { smallBlind: 25, bigBlind: 50, ante: 3, min: 10 }
    ];

    var allPlayers = [
        { name: 'Christina Park', id: 'sparky' },
        { name: 'Hyo Jin Chung', peerId: 'jin' },
        { name: 'Minhee Cho', peerId: 'minnie' },
        { name: 'Alan Chusuei', peerId: 'lockheart' },
        { name: 'Simon Park', peerId: 'ttt' },
        { name: 'Will Lee', peerId: 'nerdz' }, 
    ];

    var repeatLivePlayerAction = function(action, times, context) {
        for (s = 0; s < times; s++) { 
            action(context);
        }
    }

    describe('A Table', function() {

        beforeEach(function() {
            var newPlayers = [];
            _.each(allPlayers, function(p) {
                newPlayers.push(poker.createPlayer(p.name, startingStack));
            });
            this.table = poker.createTable(newPlayers);
            var blindStructure = poker.createBlindStructure(startingStack, levels);
            this.table.blinds = blindStructure.getBlindLevel();
            _.each(this.table.players, function(player) {
                player.action = poker.PlayerAction.YETTOACT;
            }, this);
        });

        it('should have its players initialized and randomized properly', function() {
            expect(this.table.getNumberOfPlayers()).toEqual(allPlayers.length);
            // Check that player order was randomized.
            var matching = true;
            _.each(allPlayers, function(player, p) {
                expect(this.table.players[p].seat).toEqual(p);
                expect(this.table.players[p].stack).toEqual(startingStack);
                // console.info('original:' + allPlayers[p].name + ' | new:' + this.table.players[p].name + '(' + this.table.players[p].seat + ')');
                if (player.name != this.table.players[p].name) {
                    matching = false;
                }
            }, this);
            expect(matching).toBeFalsy();
        });

        it('should choose the player after the button when choosing the next player for the first time', function() {
            var nextPlayer = this.table.nextLivePlayer();
            expect((nextPlayer.seat == this.table.button + 1) || // button not on last player
                (nextPlayer.seat == 0 && this.table.button == this.table.getNumberOfPlayers() - 1)).toBeTruthy();  // button on last player
        });

        it('should go only with players who actually have chips', function() {
            var playerGotFelted = this.table.nextLivePlayer();
            playerGotFelted.stack = 0;
            this.table.currentPlayer = this.table.button;
            var playerWithChips = this.table.nextLivePlayer();
            expect(playerWithChips).not.toEqual(playerGotFelted);
        });

        it('should skip a player that is all in when choosing the next live player', function() {
            this.table.nextLivePlayer(); // skip first to act
            var allInPlayer = this.table.nextLivePlayer(); // second to act is all in
            allInPlayer.allIn();
            this.table.currentPlayer = this.table.button; // reset ... 
            this.table.nextLivePlayer(); // back to first to act ...
            expect(this.table.nextLivePlayer()).not.toEqual(allInPlayer); // next to act should not be the all the player
        });

        it('should skip a player that has folded when choosing the next live player', function() {
            this.table.nextLivePlayer(); // skip first to act
            var foldedPlayer = this.table.nextLivePlayer(); // second to act is going to fold
            foldedPlayer.fold();
            this.table.currentPlayer = this.table.button; // reset ... 
            this.table.nextLivePlayer(); // back to first to act ...
            expect(this.table.nextLivePlayer()).not.toEqual(foldedPlayer); // next to act should not be the all the player
        });

        it('should deal two cards to every player when everyone has chips in their stack', function() {
            this.table.dealCardsAndSetRoundStatus();
            _.each(this.table.players, function(player) {
                // console.info('player:' + p.name + ' | cards:' + p.hand);
                expect(player.hand.length).toEqual(2);
            });
        });

        it('should deal cards only to players that have chips in their stack', function() {
            this.table.players[2].stack = 0;
            this.table.players[4].stack = 0;
            this.table.dealCardsAndSetRoundStatus();
            _.each(this.table.players, function(player, i) {
                if (player.stack == 0) {
                    expect(player.hand.length).toEqual(0);
                } else {
                    expect(player.hand.length).toEqual(2);    
                }
           });
        });

        it('should have an initial pot equal equal to (# of players * ante + big blind + small blind) after posting blinds and antes', function() {
            var blindLevel = this.table.blinds;
            var pot = this.table.postBlindsAndAntes();
            expect(pot.amount).toEqual((this.table.getNumberOfPlayers() * blindLevel.ante) + blindLevel.smallBlind + blindLevel.bigBlind);
        });

        it('should only post blinds and antes from the correct positions (after the button)', function() {
            var blindLevel = this.table.blinds;
            var pot = this.table.postBlindsAndAntes();
            // reset current player cursor to make it easier to find the players after the button
            this.table.currentPlayer = this.table.button; 
            var sbPlayer = this.table.nextLivePlayer();
            var bbPlayer = this.table.nextLivePlayer();
            expect(sbPlayer.stack).toEqual(startingStack - blindLevel.smallBlind - blindLevel.ante);
            expect(sbPlayer.liveBet).toEqual(blindLevel.smallBlind);
            expect(bbPlayer.stack).toEqual(startingStack - blindLevel.bigBlind - blindLevel.ante);
            expect(bbPlayer.liveBet).toEqual(blindLevel.bigBlind);
            expect(pot.isEligible(sbPlayer)).toBeTruthy();
            expect(pot.isEligible(bbPlayer)).toBeTruthy();

            // Check rest of table for antes withdrawal
            while (this.table.nextLivePlayer().seat != this.table.button) {
                var nonBlindPlayer = this.table.players[this.table.currentPlayer];
                expect(nonBlindPlayer.stack).toEqual(startingStack - blindLevel.ante);
            } 
        });

        it('should only post blinds from players who still have chips', function() {
            var blindLevel = this.table.blinds;
            // reset current player cursor to make it easier to find the players after the button
            this.table.button = 0;
            this.table.currentPlayer = this.table.button; 
            this.table.players[1].stack = 0;
            this.table.postBlindsAndAntes();
            expect(this.table.players[1].liveBet).toEqual(0);
            expect(this.table.players[2].stack).toEqual(startingStack - blindLevel.smallBlind - blindLevel.ante);
            expect(this.table.players[2].liveBet).toEqual(blindLevel.smallBlind);
            expect(this.table.players[3].stack).toEqual(startingStack - blindLevel.bigBlind - blindLevel.ante);
            expect(this.table.players[3].liveBet).toEqual(blindLevel.bigBlind);
        });

        it('should make the button the small blind when it is heads up (two players)', function() {
            var newPlayers = [];
            _.each(_.sample(allPlayers, 2), function(p) {
                newPlayers.push(poker.createPlayer(p.name, startingStack));
            });
            this.table = poker.createTable(newPlayers);
            var blindStructure = poker.createBlindStructure(startingStack, levels);
            this.table.blinds = blindStructure.getBlindLevel();
            var blindLevel = this.table.blinds;
            // reset current player cursor to make it easier to find the players after the button
            this.table.button = 0;
            this.table.currentPlayer = this.table.button; 
            this.table.postBlindsAndAntes();
            expect(this.table.players[0].liveBet).toEqual(blindLevel.smallBlind);
            expect(this.table.players[0].stack).toEqual(startingStack - blindLevel.smallBlind - blindLevel.ante);
            expect(this.table.players[1].liveBet).toEqual(blindLevel.bigBlind);
            expect(this.table.players[1].stack).toEqual(startingStack - blindLevel.bigBlind - blindLevel.ante);
        });
        
        it('should move the button to the next player', function() {
            var originalButton = this.table.button;
            this.table.moveButton();
            if (originalButton == this.table.getNumberOfPlayers() - 1) {
                expect(this.table.button).toEqual(0);
            } else {
                expect(this.table.button).toEqual(originalButton+ 1);
            }
        });      

        it('should have a winner when the only one person has chips remaining in their stack', function() {
            var winnerIndex = Math.floor((Math.random() * this.table.getNumberOfPlayers()));
            _.each(this.table.players, function(player) {
                player.stack = 0;
            });
            this.table.players[winnerIndex].stack = 5000;
            var winner = this.table.findGameWinner();
            expect(winner).toBeTruthy();
            expect(winner).toEqual(this.table.players[winnerIndex]);
        });

        it('should not have a winner when more than one player still has chips', function() {
            this.table.players[2].stack = 0;
            var winner = this.table.findGameWinner();
            expect(winner).toBeFalsy();
        });

        xit('should have more tests for playing hands', function() {
            
        });

        it('does not ends the pre-flop street when players still left to act', function() {
            this.table.postBlindsAndAntes();
            do { // get all non-blind players to fold.
                this.table.nextLivePlayer().fold();   
            } while (this.table.currentPlayer != this.table.button);
            // small blind still left to Act
            expect(this.table.isStreetOver()).toBeFalsy();
        });

        it('ends the pre-flop street in a walk for the big blind when everyone including the small blind folds', function() {
            this.table.postBlindsAndAntes(); 
            do { // get all non-blind players to fold.
                this.table.nextLivePlayer().fold();   
            } while (this.table.currentPlayer != this.table.button);
            // small blind folds ... 
            this.table.nextLivePlayer().fold();
            expect(this.table.isStreetOver()).toBeTruthy();
        });

        it('does not end the pre-flop street when everyone calls the big blind (big blind should have option to raise)', function() {
            this.table.postBlindsAndAntes(); 
            do { // get all non-blind players to fold.
                this.table.nextLivePlayer().fold();   
            } while (this.table.currentPlayer != this.table.button);
            // small blind calls big blind ... 
            this.table.nextLivePlayer().call(this.table.blinds.bigBlind);
            expect(this.table.isStreetOver()).toBeFalsy();
        });

        it('should not end a street when no one has acted', function() {
            expect(this.table.isStreetOver()).toBeFalsy();
        });

        it('should not end a street when only some players have checked', function() {
            this.table.nextLivePlayer().check();
            this.table.nextLivePlayer().check();
            expect(this.table.isStreetOver()).toBeFalsy();
        });

        it('should not end a street when only some players have folded', function() {
            this.table.nextLivePlayer().fold();
            this.table.nextLivePlayer().fold();
            expect(this.table.isStreetOver()).toBeFalsy();
        });

        it('should not end a street when only some players have folded or checked', function() {
            this.table.nextLivePlayer().fold();
            this.table.nextLivePlayer().check();
            expect(this.table.isStreetOver()).toBeFalsy();
        });

        it('should end a street when only all players have either folded or checked', function() {
            do {
                if (Math.random() > 0.5) {
                    this.table.nextLivePlayer().fold();
                } else {
                    this.table.nextLivePlayer().check();
                }
            } while (this.table.currentPlayer != this.table.button);
            expect(this.table.isStreetOver()).toBeTruthy();
        });

        it('should end a street when all players have folded to a donk bet', function() {
            this.table.nextLivePlayer().bet(45);
            do {
                this.table.nextLivePlayer().fold();
            } while (this.table.currentPlayer != this.table.button);
            expect(this.table.isStreetOver()).toBeTruthy();
        });

        it('should not end a street when all players have not folded to a donk bet', function() {
            this.table.nextLivePlayer().bet(45);
            for (s = 0; s < this.table.getNumberOfPlayers - 2; s++) { 
                this.table.nextLivePlayer().fold();
            };
            expect(this.table.isStreetOver()).toBeFalsy();
        });

        it('should end a street when all players have folded to a button bet', function() {
            for (s = 0; s < this.table.getNumberOfPlayers() - 1; s++) { 
                this.table.nextLivePlayer().check();
            }
            this.table.nextLivePlayer().bet(66);
            for (s = 0; s < this.table.getNumberOfPlayers() - 1; s++) { 
                this.table.nextLivePlayer().fold();
            }
            expect(this.table.isStreetOver()).toBeTruthy();
        });

        it('should not end a street when some players have not responded to a button bet', function() {
            for (s = 0; s < this.table.getNumberOfPlayers() - 1; s++) { 
                this.table.nextLivePlayer().check();
            }
            this.table.nextLivePlayer().bet(66);
            for (s = 0; s < this.table.getNumberOfPlayers() - 2; s++) { 
                this.table.nextLivePlayer().fold();
            }
            expect(this.table.isStreetOver()).toBeFalsy();
        });

        it('should not end a street when cutoff check-raises the button bet', function() {
            for (s = 0; s < this.table.getNumberOfPlayers() - 1; s++) { 
                this.table.nextLivePlayer().check();
            }; // everyone checks to the button
            this.table.nextLivePlayer().bet(66); // button bets in position
            for (s = 0; s < this.table.getNumberOfPlayers() - 2; s++) { 
                this.table.nextLivePlayer().fold();
            }; // everyone folds except the cutoff (player b4 the button)
            this.table.nextLivePlayer().raise(200); // cutoff 3-bets (raises)
            expect(this.table.isStreetOver()).toBeFalsy();
        });

        it('should not end a street when button re-raises the cutoff bet', function() {
            for (s = 0; s < this.table.getNumberOfPlayers() - 1; s++) { 
                this.table.nextLivePlayer().check();
            }; // everyone checks to the button
            this.table.nextLivePlayer().bet(66); // button bets in position
            for (s = 0; s < this.table.getNumberOfPlayers() - 2; s++) { 
                this.table.nextLivePlayer().fold();
            }; // everyone folds except the cutoff (player b4 the button)
            this.table.nextLivePlayer().raise(200); // cutoff 3-bets (raises)
            this.table.nextLivePlayer().raise(400); // button 4-bets (min re-raises)
            expect(this.table.isStreetOver()).toBeFalsy();
        });

        it('should end a street when re-raise is called', function() {
            for (s = 0; s < this.table.getNumberOfPlayers() - 1; s++) { 
                this.table.nextLivePlayer().check();
            }; // everyone checks to the button
            this.table.nextLivePlayer().bet(66); // button bets in position
            for (s = 0; s < this.table.getNumberOfPlayers() - 2; s++) { 
                this.table.nextLivePlayer().fold();
            }; // everyone folds except the cutoff (player b4 the button)
            this.table.nextLivePlayer().bet(200); // cutoff 3-bets (raises)
            this.table.nextLivePlayer().raise(400); // button 4-bets (min re-raises)
            this.table.nextLivePlayer().call(400); // cutoff calls
            // this.table.getPlayerBetStatus();
            expect(this.table.isStreetOver()).toBeTruthy();
        });

        xit('should', function() {});
        xit('should', function() {});
        xit('should', function() {});
        xit('should', function() {});
        xit('should', function() {});
        xit('should', function() {});
        xit('should', function() {});
    });

    describe('A Pot', function() {

        beforeEach(function() {
            this.boy = poker.createPlayer('Alan', 3000);
            this.girl = poker.createPlayer('Christina', 5000);
            this.pot = poker.createPot();
        });        

        it('should make a player eligible for the pot when player adds money to the pot', function() {
            this.pot.build(this.boy.bet(500), this.boy);
            expect(this.pot.amount).toEqual(500);
            expect(this.pot.isEligible(this.boy)).toBeTruthy();
            expect(this.pot.isEligible(this.girl)).toBeFalsy();
        });

        it('should make multiple players eligible for the pot when more than one player adds money to the pot', function() {
            this.pot.build(this.boy.bet(500), this.boy);
            this.pot.build(this.boy.bet(1000), this.girl);
            expect(this.pot.amount).toEqual(1500);
            expect(this.pot.isEligible(this.boy)).toBeTruthy();
            expect(this.pot.isEligible(this.girl)).toBeTruthy();
        });

        it('should make player eligible for the pot when multiple bets made', function() {
            this.pot.build(this.boy.bet(500), this.boy);
            this.pot.build(this.boy.bet(667), this.boy);
            expect(this.pot.amount).toEqual(1167);
            expect(this.pot.isEligible(this.boy)).toBeTruthy();
            expect(this.pot.isEligible(this.girl)).toBeFalsy();
        });

    })

    describe('A BlindStructure', function() {

        beforeEach(function() {
            this.blindStructure = poker.createBlindStructure(startingStack, levels);
        });

        it('should be initialized properly', function() {
            expect(this.blindStructure.startingStack).toEqual(startingStack);
            expect(this.blindStructure.levels.length).toEqual(levels.length);
        });

        it('should pull the first blind level when getBlindLevel is called the first time', function() {
            // add just a tiny delay in case test runs too fast
            var testTime = moment().subtract(1, 'ms');
            var level = this.blindStructure.getBlindLevel();

            expect(level.smallBlind).toEqual(15);
            expect(level.bigBlind).toEqual(30);
            expect(level.ante).toEqual(1);
            expect(this.blindStructure.currentLevel).toEqual(0);
            expect(this.blindStructure.lastTimeBlindsWentUp.isAfter(testTime)).toBeTruthy(); // failing intermittently?
        });

        it('should move to the next level when the time for the level is up.', function() {
            var level = this.blindStructure.getBlindLevel();
            // add just a tiny delay in case test runs too fast
            var lastChangeTime = this.blindStructure.lastTimeBlindsWentUp.clone().subtract(1, 'ms');
            this.blindStructure.lastTimeBlindsWentUp.subtract(level.min + 2, 'minutes');

            var newLevel = this.blindStructure.getBlindLevel();
            expect(newLevel.smallBlind).toEqual(20);
            expect(newLevel.bigBlind).toEqual(40);
            expect(newLevel.ante).toEqual(2);
            expect(this.blindStructure.currentLevel).toEqual(1);
            expect(this.blindStructure.lastTimeBlindsWentUp.isAfter(lastChangeTime)).toBeTruthy();
        });

        it('should NOT move to the next level when the time for the level is not yet up', function() {
            var level = this.blindStructure.getBlindLevel();
            var lastChangeTime = this.blindStructure.lastTimeBlindsWentUp.clone();

            // assuming the blind levels are at least a few seconds ...
            var newLevel = this.blindStructure.getBlindLevel();
            expect(level.smallBlind).toEqual(15);
            expect(level.bigBlind).toEqual(30);
            expect(level.ante).toEqual(1);
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

        it('who checks without prior action should not have any money taken from his stack', function() {
            this.player.check();
            expect(this.player.action).toEqual(poker.PlayerAction.CHECK);
            expect(this.player.liveBet).toEqual(0);
            expect(this.player.stack).toEqual(startingStack);
        });

        it('who folds without prior action should not have any money taken from his stack', function() {
            this.player.fold();
            expect(this.player.action).toEqual(poker.PlayerAction.FOLD);
            expect(this.player.liveBet).toEqual(0);
            expect(this.player.stack).toEqual(startingStack);
        });

        it('who bets then folds to a raise should only have the bet removed from his stack', function() {
            this.player.bet(smallBet);
            this.player.fold();
            expect(this.player.action).toEqual(poker.PlayerAction.FOLD);
            expect(this.player.liveBet).toEqual(smallBet);
            expect(this.player.stack).toEqual(startingStack - smallBet);
        });

        it('making a bet has their stack is depleted by the amount they bet', function() {
            expect(this.player.bet(smallBet)).toEqual(smallBet);
        });

        it('calling a bet in front has their stack is depleted by the amount they call when no chips have been put into the pot', function() {
            expect(this.player.call(smallBet)).toEqual(smallBet);
            expect(this.player.action).toEqual(poker.PlayerAction.CALL);
        });

        it('calling a raise has their stack is depleted by the difference of the chips they have in play and the amount of the raise', function() {
            var pot = this.player.bet(smallBet);
            expect(this.player.call(smallBet * 3)).toEqual(smallBet * 2);
            expect(this.player.liveBet).toEqual(smallBet * 3);
            expect(this.player.action).toEqual(poker.PlayerAction.CALL);
        });

        it('has their stack is reduced to zero when they go all in', function() {
            this.player.allIn();
            expect(this.player.stack).toEqual(0);
            expect(this.player.action).toEqual(poker.PlayerAction.ALLIN);
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

        it('does not count an ante towards a live bet (pre-flop)', function() {
            this.player.ante(smallBet);
            expect(this.player.liveBet).toEqual(0);-0
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
            this.player.raise(smallBet); // I four-bet someone who three bet me
            this.player.allIn(); // ah screw it, all in.
            expect(this.player.action).toEqual(poker.PlayerAction.ALLIN);
            expect(this.player.liveBet).toEqual(startingStack);
        });

        it('counts an ante equal to stack as an all in', function() {
            this.player.ante(startingStack);
            expect(this.player.action).toEqual(poker.PlayerAction.ALLIN);
        });

        it('counts posting a blind equal to stack as an all in', function() {
            this.player.postBlind(startingStack);
            expect(this.player.action).toEqual(poker.PlayerAction.ALLIN);
        });

        it('counts a bet equal to stack as an all in', function() {
            this.player.bet(startingStack);
            expect(this.player.action).toEqual(poker.PlayerAction.ALLIN);
        });

        it('counts a call equal to stack as an all in', function() {
            this.player.bet(smallBet);
            this.player.call(startingStack);
            expect(this.player.action).toEqual(poker.PlayerAction.ALLIN);
        });

        it('counts a raise equal to stack as an all in', function() {
            this.player.bet(smallBet);
            this.player.raise(startingStack);
            expect(this.player.action).toEqual(poker.PlayerAction.ALLIN);
        });

    });

});