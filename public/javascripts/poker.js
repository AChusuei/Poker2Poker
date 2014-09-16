define(['moment', 'underscore', 'playingCards'], function(moment) {

	/* 
	 Evaluates given cards to best five card poker hand.
	 */
	function HandEvaluator(cards) {
		if (cards.length != 7) {
			throw('Wrong number of cards given to evaluator:' + cards.length);
		}
	}
	HandEvaluator.prototype = {

	}

    /*
     Start table object regarding table position and dealing.
     */
	function Table(players) {
		// Lists all of the players at the table (even if they're out of chips)
		this.initializePlayerPositions(players);
		// Index of player with the button.
		this.button = Math.floor((Math.random() * this.players.length));
		// Index of player to whom action is on.
		this.currentPlayer = this.button;
		this.deck = new playingCards();
		this.blinds = null;
	}
	Table.prototype = {
		initializePlayerPositions: function(players) {
			this.players = [];
			while (players.length > 0) {
				var randomIndex = Math.floor((Math.random() * players.length));
				players[randomIndex].seat = this.players.length;
				this.players.push(players[randomIndex]);
				players.splice(randomIndex, 1);
			}
		},
		nextLivePlayer: function() {
			do {
				if (this.currentPlayer == this.players.length - 1) {
					this.currentPlayer = 0;
				} else {
					this.currentPlayer += 1;
				}
			} while (this.players[this.currentPlayer].stack == 0)
			return this.players[this.currentPlayer];
		},
		dealCardsAndSetRoundStatus: function() {
			this.deck.shuffle();
			// clear all player hands 
			_.each(this.players, function(p) {
				p.hand = [];
				p.status = this.PlayerRoundStatus.OUT
			}, this);
			
			_.chain(this.players)
			     // only deal cards to players with chips remaining
			    .filter(function(p) { return p.stack > 0; } )
				.each(function(p) {
					var f = this.deck.draw();
					var s = this.deck.draw();
					p.hand.push(f, s);
					p.status = this.PlayerRoundStatus.IN
				}, this);
		},
		// Note that this sets the table such that the next live player should be UTG
		postBlindsAndAntes: function() {
			var pot = this.startPot();
			// get antes from every player.
			// TODO: find minimum ante.
			_.each(this.players, function(player) {
				pot.amount += player.ante(this.blinds.ante);
			}, this);
			if (this.players.length == 2) { // We are heads up; 
				// Button posts small blind.
				var sbPlayer = this.players[this.button];
				// Non-button player posts big blind.
				var bbPlayer = this.nextLivePlayer();
			} else { // we have more than two people ... 
				// Player after button posts small blind.
				var sbPlayer = this.nextLivePlayer();
				// Player after small blind posts big blind.
				var bbPlayer = this.nextLivePlayer();
			}
			var sbBet = sbPlayer.postBlind(this.blinds.smallBlind);
			pot.build(sbBet, sbPlayer);
			var bbBet = bbPlayer.postBlind(this.blinds.bigBlind);
			pot.build(bbBet, bbPlayer);
			return pot;
		},
		// One deal of the cards. Multiple pots may be awarded.
		playRound: function() {
			// Set up main pot.
			var pots = [ this.postBlindsAndAntes() ]; // todo: antes might be low, might req side pot ... 
			var street = this.Street.PREFLOP;
			// var actionOptions = null;
			// var lastPlayerAction = null;
			do {
				var streetResult = this.playStreet(pots);
				street++;
			} while (!streetResult.endRound || street == this.Street.SHOWDOWN)		 
			this.getRoundWinner().stack += table.pot.amount;
		},
		/* 
		 Play one street of poker. 
		 Street ends only when all non-folded players:
		 1) Check OR  
		 2) Call/Bet matching high bet for the street, and has chips remaining OR
		 3) are AllIn 
		 */
		// playStreet: function(pots) {
			
		// 	_.each(this.players, function(player) {
		// 		player.action = this.PlayerAction.YETTOACT;
		// 	}, this);
		// 	var highBet = 0;
		// 	var actionOptions = this.formulateActionOptions(actionOptions, lastPlayerAction);
		// 	var nextLivePlayer = this.nextLivePlayer();
		// 	var response = this.waitForPlayerAction(nextLivePlayer, options);
		// 	do {

		// 	} while (true

		// 	);
		// 	return {
		// 		pots: [],
		// 		endRound: true
		// 	}

		// },
		isStreetOver: function() {
			var nonFoldedPlayers = _.filter(this.players, function(player) { 
				return player.action != Player.Action.FOLD;
		    }, this);
		    console.log('nonFoldedPlayers:' + nonFoldedPlayers.length);
		    var highBet = _.max(nonFoldedPlayers, function(player) {
		    	return player.liveBet; 
		    }).liveBet;
		    var onlyOnePlayerLeft = (nonFoldedPlayers.length == 1);
			var restChecked = _.every(nonFoldedPlayers, function(player) { 
				return player.action == Player.Action.CHECK; 
		    }, this);
			var restCalledTheHighBetOrAllIn = _.every(nonFoldedPlayers, function(player) { 
				return (player.action == Player.Action.CALL  && player.liveBet == highBet) ||
				       (player.action == Player.Action.ALLIN && player.liveBet <= highBet)
		    }, this);	
		    console.log('HB/1PL/RC/AC:' + highBet + '/' + onlyOnePlayerLeft + '/' + restChecked + '/' + restCalledTheHighBetOrAllIn);
			return onlyOnePlayerLeft || restChecked || restCalledTheHighBetOrAllIn;
		},
		getPlayerBetStatus: function() {
			var button = this.button;
			_.each(this.players, function(player) {			     
				console.log('player(seat)/bet/action:' + player.name + '(' + player.seat + (player.seat == button ? 'B' : '') + ')/' + player.liveBet + '/' + player.action);
		    }, this);
		},
		// Given players having played one street of play, determine how to build pots.
		resolvePots: function(pots, players) {

		},
		formulateActionOptions: function(actionOptions, lastPlayerAction) {
			if (!actionOptions || !lastPlayerAction) {
				return { 
					minimumBet: this.blinds.bigBlind,
					call: this.betToCall,
					minimumRaise: this.blinds.bigBlind,
				};
			} else {
				switch (lastPlayerAction.action) {
					case this.PlayerAction.BET:
						actionOptions.betToCall = lastPlayerAction.amount;
						break;
					case this.PlayerAction.CALL:
						// nothing changes for the 
						break;
					case this.PlayerAction.RAISE: 
						break;
					case this.PlayerAction.ALLIN:
					    // pot craziness occurs here ....  
						break;
				}
			}
			return actionOptions;
		},
		Street: {
			PREFLOP: 0,
			FLOP: 1,
			TURN: 2,
			RIVER: 3,
			SHOWDOWN: 4,
		},
		getRoundWinner: function() {
			var survivors = _.filter(this.players, function(p) { return p.status == PlayerRoundStatus.IN; } );
			return (survivors.length == 1 ? survivors[0] : null);
		},
		fakePlayRound: function() {
			// Take random amount from each player. 
			var amt = Math.floor((Math.random() * this.players.length));
			_.each(this.players, function(player) { 
				pots[0].amount += player.bet(amt);
			});
			// for now pick random player as winner. 
			return Math.floor((Math.random() * this.players.length));
		},
		moveButton: function() {
			if (this.button == this.players.length - 1) {
				this.button = 0;
			} else {
				this.button += 1;
			}
			this.currentPlayer = this.button;
		},
		findGameWinner: function() {
			// Someone should have chips remaining, otherwise something REALLY REALLY wrong happened here.
			var winners = _.filter(this.players, function(p) { return p.stack > 0; } );
			if (winners.length == 1) {
				return winners[0];
			} else {
				return null;
			}
		},
		startPot: function() {
			return new Pot();
		},
		PlayerRoundStatus: {
			IN: 'In', OUT: 'Out'
		}
	}
	/*
     End Table object.
     */

    /* 
	 Contains information for deal of the cards.
	 */
	function Round(players) {
		
	}
	Round.prototype = {

	}


    /*
     Contains information about one pot for a given round of play.
     Note that one hand may have several pots, a main pot some side pots.
     */
    function Pot() {
    	this.amount = 0;
    	this.players = {};
    }
    Pot.prototype = {
    	build: function(bet, player) {
    		this.amount += bet;
    		// Adds to list if player isn't there.
    		this.players[player.name] = true; 
    	},
    	isEligible: function(player) {
    		return (player.name in this.players);
    	}
    }


	/*
     BlindStructure: holds blind levels of the game.
     */
	function BlindStructure(startingStack, levels) {
		this.startingStack = startingStack;
		this.levels = levels;
		this.currentLevel = -1; // initial getBlindLevel() will initialize this to zero;
		this.lastTimeBlindsWentUp = null;
	};
	BlindStructure.prototype = {
		getBlindLevel: function() {
			if (this.currentLevel == -1 || moment().diff(this.lastTimeBlindsWentUp, 'minutes') > this.levels[this.currentLevel].min) {
				this.currentLevel += 1;
				this.lastTimeBlindsWentUp = moment();
			}
			return this.levels[this.currentLevel];
		},
	} 
	/*
     End BlindStructure object.
     */ 

	/*
     Start Player object. Mostly information around remaining stack and betting methods.
     */
	function Player(name, stack) {
	 	this.name = name;
		this.stack = stack;
		this.liveBet = 0;
	};
	Player.Action = {
		YETTOACT: 'YetToAct', // Player passes at making a bet
		POSTBLIND: 'PostBlind', // Player has posted a blind.
		CHECK: 'Check', // Player passes at making a bet.
		FOLD: 'Fold', // Player gives up or refuses to call the highest bet.
		BET: 'Call', // Player makes the first bet of the round. For the purposes of resolving a street, it's a call.
		CALL: 'Call', // Player calls high bet, and has chips left.
		RAISE: 'Raise', // Player makes at least a minimum raise, and has chips still left.
		ALLIN: 'All-In', // Player pushes rest of their chips (regardless of bet, call, or raise)
	};
	Player.prototype = {
		// Player checks
		check: function() {
			this.action = Player.Action.CHECK;
		},
		// Player checks
		fold: function() {
			this.action = Player.Action.FOLD;
		},
		// Pulls an ante for a player.
		// For specificity, returns the ante removed from the player's stack.
		// Also, note that antes do not count towards a player's live bet (not the same as a blind)
		ante: function(ante) {
			if (ante > this.stack) {
				ante = this.stack;
			}
			this.stack -= ante;
			return ante;
		},
		// Player is posting a blind. Note this is synonymous to a bet with respect to stack.
		// Note that this records the person as having posted a blind.
		postBlind: function(bet) {
			if (bet > this.stack) {
				bet = this.stack;
			}
			this.stack -= bet;
			this.liveBet += bet;
			this.action = Player.Action.POSTBLIND;
			return bet;
		},
		// Player is bettting or raising.
		// For specificity, returns the amount removed from the player's stack.
		bet: function(bet) {
			if (bet > this.stack) {
				bet = this.stack;
			}
			this.stack -= bet;
			this.liveBet += bet;
			this.action = Player.Action.BET;
			return bet;
		},
		// Player calls to match a current bet.
		// Returns the amount removed from the player's stack in order to make the call.
		call: function(totalBet) {
			if (totalBet > this.stack) {
				totalBet = this.stack;
			}
			var delta = totalBet - this.liveBet;
			this.stack -= delta;
			this.liveBet = totalBet;
			this.action = Player.Action.CALL;
			return delta;
		},
		// Player bets the remainder of their chips.
		allIn: function() {
			var rest = this.stack;
			this.liveBet += rest;
			this.stack = 0;
			this.action = Player.Action.ALLIN;
			return rest;
		},
		awardPot: function(potAmount) {
			this.stack += potAmount;
		}
	}
	/*
     End Player object.
     */

    return {
     	createPlayer : function(name, stack) { return new Player(name, stack); },
     	createBlindStructure : function(startingStack, levels) { return new BlindStructure(startingStack, levels); },
     	createTable : function(players) { return new Table(players); },
     	createPot : function(players) { return new Pot(); },
     	PlayerAction: Player.Action,
    }
});