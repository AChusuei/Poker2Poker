define(['pokerHandEvaluator', 'moment', 'constants', 'underscore', 'playingCards'], 
function(pokerHandEvaluator,   moment,   constants) {

    /*
     Start table object regarding table position and dealing.
     */
	function Table(players, startingStack, levels, gameController) {
		this.initializePlayerPositions(players, startingStack);
		this.randomizeButton(); 
		this.deck = new playingCards();
		this.handEvaluator = pokerHandEvaluator;
		this.blindStructure = new BlindStructure(levels);
		this.gameController = gameController;
	}
	Table.prototype = {
		initializePlayerPositions: function(players, startingStack) {
			this.players = [];
			while (players.length > 0) {
				var randomIndex = Math.floor((Math.random() * players.length));
				players[randomIndex].seat = this.players.length;
				this.players.push(players[randomIndex]);
				players.splice(randomIndex, 1);
			};
			_.each(this.players, function(player) {
				player.stack = startingStack;
				player.button = false;
			});
		},
		randomizeButton: function() {
			// Index of player with the button.
			this.button = Math.floor((Math.random() * this.players.length));
			// Index of player to whom action is on.
			this.currentPlayer = this.button;
			this.players[this.button].button = true; 
		},
		getNumberOfPlayers: function() {
			return this.players.length;
		},
		nextLivePlayer: function() {
			do {
				if (this.currentPlayer === this.players.length - 1) {
					this.currentPlayer = 0;
				} else {
					this.currentPlayer += 1;
				}
			} while (this.currentLivePlayer().stack === 0 || this.currentLivePlayer().action === Player.Action.FOLD);
			return this.currentLivePlayer();
		},
		currentLivePlayer: function() {
			return this.players[this.currentPlayer];
		},
		dealCards: function() {
			this.deck.shuffle();
			// clear all player hands 
			_.each(this.players, function(p) {
				p.hand = [];
			}, this);
			
			_.chain(this.players)
			     // only deal cards to players with chips remaining
			    .filter(function(p) { return p.stack > 0; } )
				.each(function(p) {
					var f = this.deck.draw();
					var s = this.deck.draw();
					p.hand.push(f, s);
				}, this);
		},
		// Note that this sets the table such that the next live player should be UTG
		postBlindsAndAntes: function() {
			this.pots = [this.startPot()];
			this.blinds = this.blindStructure.determineBlindLevel();
			var currentPot = this.pots[0]; 
			// get antes from every player.
			// TODO: find minimum ante.
			_.each(this.players, function(player) {
				currentPot.amount += player.ante(this.blinds.ante);
			}, this);
			if (this.players.length === 2) { // We are heads up; 
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
			var sbBet = sbPlayer.postBlind(this.blinds.smallBlind, currentPot);
			var bbBet = bbPlayer.postBlind(this.blinds.bigBlind, currentPot);
		},
		// One whole game. Winner is the last one standing.
		startTournamentGame: function() {
			this.startRound();
		},
		// One deal of the cards. Multiple pots may be awarded.
		startRound: function() {
			this.dealCards();
			this.postBlindsAndAntes(); // todo: antes might be low, might req side pot ... 
			this.street = this.Street.PREFLOP;
			this.startStreet();
		},
		// Play one street of poker. 
		startStreet: function() {
			_.each(this.nonFoldedPlayers(), function(player) {
				player.action = Player.Action.YETTOACT;
				if (this.street > this.Street.PREFLOP) {
					player.liveBet = 0;
					this.resetButton();
				};
			}, this);
			this.promptNextPlayerToAct();
		},
		promptNextPlayerToAct: function() {
			var player = this.nextLivePlayer();
			var options = this.formulateActionOptions(player);
			var currentTable = this;
			player.action = Player.Action.ToAct
			this.gameController.updateInterface();
			this.gameController.broadcastInterfaceUpdate();
			this.gameController.promptPlayerAction(player, options, function(response) { 
				currentTable.resolvePlayerAction(response); 
			});			
		},
		formulateActionOptions: function(player) {
			// With no previous action, the minimum amount a player can bet.
			var minimumBet = this.blindStructure.getBlindLevel().bigBlind;
			// The current bet required by all players who wish to stay in the hand.
			var callBet = this.getCurrentCallBet();
			// Calculates the minimum marginal additional amount needed for a raise.
			var maxNonCallBet = _.chain(this.players) // Figures out the highest bet
			    .filter(function(p) { return p.action != Player.Action.FOLD && p.liveBet < callBet; } )
				.max(function(p) { return p.liveBet; }, this)
				.value().liveBet;
			if (maxNonCallBet === undefined) {
				maxNonCallBet = 0;
			}
			var minimumRaiseDelta = ((callBet - maxNonCallBet) < minimumBet ? minimumBet : callBet - maxNonCallBet);
			// The absolute value of the minimum raise.
			var minimumRaise = Math.min(callBet + minimumRaiseDelta, player.liveBet + player.stack);
			var actions = [Player.Action.FOLD];
			if (callBet === 0) {
				actions.push(Player.Action.CHECK, Player.Action.BET);
			} else if ((player.stack + player.liveBet) > callBet) {
				if (player.liveBet === callBet) { // big blind option check
					actions.push(Player.Action.CHECK);
				} else {
					actions.push(Player.Action.CALL);
				}
				if (player.stack + player.liveBet > minimumRaise) {
					actions.push(Player.Action.RAISE);
				};
			};
			actions.push(Player.Action.ALLIN);
			return { 
				callBet: callBet,
				minimumRaise: minimumRaise,
				actions: actions,
			};
		},
		getCurrentCallBet: function() {
			return _.chain(this.players)
			    .filter(function(p) { return p.action !== Player.Action.FOLD; } )
				.max(function(p) { return p.liveBet; }, this)
				.value().liveBet;
		},
		dealCommunityCards: function() {
			switch (this.street) {
				case this.Street.FLOP:
					var f1 = this.deck.draw();
					var f2 = this.deck.draw();
					var f3 = this.deck.draw();
					this.communityCards = [f1, f2, f3];
					break;
				case this.Street.TURN:
				case this.Street.RIVER:
					this.communityCards.push(this.deck.draw());
					break;
			}
		},
		dealAllCommunityCardsToRiver: function() {
			while (this.street++ !== this.Street.SHOWDOWN) {
				this.dealCommunityCards();
			}
		},
		qa_dealAllCommunityCards: function() {
			this.communityCards = [];
			for (c = 0; c < 5; c++) {
				this.communityCards.push(this.deck.draw());
			}
		},
		resolvePlayerAction: function(response) {
			this.changePlayerState(response);
			if (!this.isStreetOver()) {
				this.promptNextPlayerToAct();
			} else {
				this.resolvePots();
				if (this.standUp()) {
					this.dealAllCommunityCardsToRiver();
					this.resolveRound();
				} else if (++this.street === this.Street.SHOWDOWN || this.nonFoldedPlayers().length === 1) {
					this.resolveRound();
				} else {
					this.dealCommunityCards();
					this.startStreet();
				}
			}
		},
		// You know when poker players stand up when they are all in?
		// The purpose of this function is to determine if that moment has arrived ... 
		standUp: function() { 
			var nonFoldedPlayers = this.nonFoldedPlayers();
			var nonFoldedAllInPlayers = this.nonFoldedAllInPlayers();
			// only 0 or 1 players that haven't folded are all in. 
			return ((nonFoldedAllInPlayers.length + 1) >= nonFoldedPlayers.length);
		},
		resolveRound: function() {
			this.resolvePotWinners();
			this.communityCards = [];
			this.moveButton();
			if (!this.findGameWinner()) {
				this.startRound(); 
			} else {
				// game is over we have a winner!
				alert('Game winner is ' + findGameWinner());
			}
		},
		getCurrentPot: function() {
			return this.pots[this.pots.length - 1];
		},
		changePlayerState: function(response) {
			var player = this.currentLivePlayer();
			var pot = this.getCurrentPot();
			var amount = response.amount;
			switch (response.action) {
				case Player.Action.CHECK: 
					player.check(); 
					break;
				case Player.Action.FOLD: 
					player.fold(); 
					break;
				case Player.Action.BET: 
					player.bet(amount, pot); 
					this.changeShowdownPlayer(player);
					break;
				case Player.Action.CALL: 
					player.call(amount, pot); 
					break;
				case Player.Action.RAISE: 
					player.raise(amount, pot);
					this.changeShowdownPlayer(player);
					break;
				case Player.Action.ALLIN: 
					player.allIn(pot);
					if (player.liveBet > this.getCurrentCallBet()) {
						this.changeShowdownPlayer(player); // all in raise
					}
					break;
				default: 
					console.log('what action is this?' + response.action); 
					throw 'Don\'t recognize this action!';
					break;
			}
		},
		// when a player bets or raises in a way that requires a call, they are the first to show, regardless of table position 
		changeShowdownPlayer: function(playerToFlip) {
			_.each(this.players, function(player) {
				player.flip = false;
			});
			playerToFlip.flip = true;
		},
		isStreetOver: function() {
			var nonFoldedPlayers = this.nonFoldedPlayers();
		    var highBet = _.max(nonFoldedPlayers, function(player) {
		    	return player.liveBet; 
		    }).liveBet;
		    var onlyOnePlayerLeft = (nonFoldedPlayers.length == 1);
			var restChecked = _.every(nonFoldedPlayers, function(player) { 
				return player.action === Player.Action.CHECK; 
		    }, this);
		    var madeWager = function(player) {
		    	return player.action === Player.Action.BET || 
		    		   player.action === Player.Action.CALL ||
		    	       player.action === Player.Action.RAISE;
		    }
			var restCalledTheHighBetOrAllIn = _.every(nonFoldedPlayers, function(player) { 
				return (madeWager(player) && player.liveBet === highBet) ||
				       (player.action === Player.Action.ALLIN && player.liveBet <= highBet)
		    }, this);
		    var nonFoldedPlayersLimpedAndBigBlindCheckedOption = (
		    	this.street === this.Street.PREFLOP && _.every(nonFoldedPlayers, function(player) { 
					return (player.action === Player.Action.CHECK || player.action === Player.Action.CALL)
			    })
		    );
			return onlyOnePlayerLeft || restChecked || restCalledTheHighBetOrAllIn || nonFoldedPlayersLimpedAndBigBlindCheckedOption;
		},
		nonFoldedPlayers: function() {
			return _.filter(this.players, function(player) { 
				return player.action !== Player.Action.FOLD;
		    });
		},
		nonFoldedAllInPlayers: function() {
			return _.filter(this.nonFoldedPlayers(), function(player) { 
				return player.action === Player.Action.ALLIN && player.liveBet > 0;
		    });
		},
		foldedPlayers: function() {
			return _.filter(this.players, function(player) { 
				return player.action === Player.Action.FOLD;
		    });
		},
		getStatus: function() {
			var button = this.button;
			console.log('Player Status ... ');
			console.log('player(seat)/stack/liveBet/action');
			_.each(this.players, function(player) {			     
				console.log(player.name + '(' + player.seat + (player.seat == button ? 'B' : '') + ')/' + player.stack + '/' + player.liveBet + '/' + player.action);
		    }, this);
		    console.log('Last action done by seat ' + this.currentPlayer);
		    console.log('------------------------------------');
		},
		// Given a closed street of betting, resolve any side pots that have occurred from all-ins.
		resolvePots: function() {
			var nonFoldedPlayers = this.nonFoldedPlayers();
			// Only create side pots if we have all in players with liveBets still in play.
			// Note that the liveBet is what we decrement to ensure that a player is as eligible for as many pots as possible.
			var nonFoldedAllInPlayers = this.nonFoldedAllInPlayers();
		    if (nonFoldedAllInPlayers.length > 0) {
				var currentPot = this.getCurrentPot();
				var sidePot = this.startPot();
				var lowestAllInBet = _.min(nonFoldedAllInPlayers, function(player) {
			    	return player.liveBet; 
			    }).liveBet;
			    _.each(nonFoldedPlayers, function(nonFoldedPlayer) {
			    	var skim = nonFoldedPlayer.liveBet - lowestAllInBet;
			    	if (skim > 0) {
			    		currentPot.amount -= skim;
			    		sidePot.build(skim, nonFoldedPlayer);
			    	}
			    	nonFoldedPlayer.liveBet -= lowestAllInBet;
			    });
			    this.pots.push(sidePot);
			    this.resolvePots(); // we may need to skim another pot.
			} else {
				// clear all live bets for this street
			    _.each(this.players, function(player) {
			    	player.liveBet = 0;
			    });
			}
		},
		resolvePotWinners: function() {
			// Need to order the list of players evaluated based on the betting at the end 

			// If we have split pots, then everyone in this list has to be a winner
			var currentWinners = [];
			var losers = this.foldedPlayers();
			while (this.pots.length > 0) {
				var currentPot = this.pots.pop();
				if (currentPot.amount === 0) {
					continue;
				}; 
				var highHand; 
				_.chain(currentPot.players)
					.sortBy(function (player) { return !player.flip; })
					.difference(losers) // any players who've already lost will lose future pots and should not be considered
					.each(function (player) {
						// var sevenCards = this.communityCards.concat(player.hand); 
						// the card deck i'm using sucks. I should just build one of my own, the fact that I have to use this parser =P~~
						var sevenCards = this.convertOldCards(this.communityCards.concat(player.hand));
						var currentHand = this.handEvaluator.evaluateHand(sevenCards);
						if (currentWinners.length > 0) {
							var diff = currentHand.compare(highHand);
							if (diff === 0) {
								currentWinners.push(player);
							} else if (diff > 0) {
								losers = losers.concat(currentWinners);
								currentWinners = [player];
								highHand = currentHand;
							} else {
								losers = losers.concat(player);
							}
						} else {
							highHand = currentHand;
							currentWinners.push(player);
						}
					}, this);
				var award = currentPot.amount / currentWinners.length;
				_.each(currentWinners, function (winner) {
					winner.stack += award;
				});
			}
		},
		convertOldCards: function(oldCards) { // need to make my own card deck ... 
			return _.map(oldCards, function(oldCard) {
				return this.handEvaluator.getCard(oldCard.rank, oldCard.suit);
			}, this);
		},
		getRoundWinner: function() {
			var survivors = _.filter(this.players, function(p) { return p.status === PlayerRoundStatus.IN; } );
			return (survivors.length === 1 ? survivors[0] : null);
		},
		resetButton: function() {
			this.currentPlayer = this.button; // reset first player to act.
		},
		moveButton: function() {
			if (this.button === this.players.length - 1) {
				this.button = 0;
			} else {
				this.button += 1;
			}
			this.currentPlayer = this.button;
			_.each(this.players, function(player) {
				player.button = false;
			})
			this.players[this.button].button = true; 
		},
		findGameWinner: function() {
			// Someone should have chips remaining, otherwise something REALLY REALLY wrong happened here.
			var remainingPlayers = _.filter(this.players, function(p) { return p.stack > 0; } );
			if (remainingPlayers.length === 1) {
				return remainingPlayers[0];
			} else {
				return null;
			}
		},
		startPot: function() {
			return new Pot();
		},
		Street: {
			PREFLOP: 0,
			FLOP: 1,
			TURN: 2,
			RIVER: 3,
			SHOWDOWN: 4,
		},
	}
	/*
     End Table object.
     */

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
    		this.makeEligible(player); 
    	},
    	isAnyoneEligible: function() {
    		return (_.keys(this.players).length !== 0);
    	},
    	makeEligible: function(player) {
    		this.players[player.name] = player; // problem is that player information is serialized in these pots ... 
    	},
    	isEligible: function(player) {
    		return (player.name in this.players);
    	},
    	listEligliblePlayers: function() {
    		return _.reduce(_.keys(this.players), function(l, name) { return l + ', ' + name; });
    	}
    }

	/*
     BlindStructure: holds blind levels of the game.
     */
	function BlindStructure(levels) {
		this.levels = levels;
		this.currentLevel = -1; // initial getBlindLevel() will initialize this to zero;
		this.lastTimeBlindsWentUp = null;
	};
	BlindStructure.prototype = {
		getBlindLevel: function() {
			return this.levels[this.currentLevel];
		},
		determineBlindLevel: function() {
			if (this.currentLevel === -1 || moment().diff(this.lastTimeBlindsWentUp, 'minutes') > this.levels[this.currentLevel].min) {
				this.currentLevel += 1;
				this.lastTimeBlindsWentUp = moment();
			}
			return this.getBlindLevel();
		},
	} 

	/*
     Start Player object. Mostly information around remaining stack and betting methods.
     */
	function Player(name, peerId, stack) {
	 	this.name = name;
	 	if (stack) {
	 		this.stack = stack;
	 	} else {
	 		this.stack = 0;
	 	}
		this.liveBet = 0;
		this.peerId = peerId;
	};
	Player.Action = {
		YETTOACT: 'YetToAct', // Player passes at making a bet
		POSTANTE: 'PostAnte', // Player has posted an ante.
		POSTBLIND: 'PostBlind', // Player has posted a blind.
		CHECK: 'Check', // Player passes at making a bet.
		FOLD: 'Fold', // Player gives up or refuses to call the highest bet.
		BET: 'Bet', // Player makes the first bet of the round. 
		CALL: 'Call', // Player calls high bet, and has chips left.
		RAISE: 'Raise', // Player makes at least a minimum raise, and has chips still left.
		ALLIN: 'All-In', // Player pushes rest of their chips (regardless of bet, call, or raise)
		ToAct: 'ToAct', // Player has been prompted to make an action.
	};
	Player.prototype = {
		// Player checks. Nothing changes monetarily for player.
		check: function() {
			this.action = Player.Action.CHECK;
		},
		// Player folds. Nothing changes monetarily for player.
		fold: function() {
			this.action = Player.Action.FOLD;
		},
		// Pulls an absolute amount from a player's stack.
		// A player is all in when they bet everything in their stack.
		absoluteBet: function(bet, action, pot, isNotLiveBet) {
			if (bet >= this.stack) {
				bet = this.stack;
				action = Player.Action.ALLIN;
			}
			this.stack -= bet;
			if (!isNotLiveBet) {
				this.liveBet += bet;				
			}
			if (action) {
				this.action = action;
			}
			if (pot) { 
				pot.build(bet, this);
			}
			return bet;
		},
		// Calculates the relative amount to remove from a player's stack based on a total amount to match.
		// A player is all in when they bet everything in their stack.
		relativeBet: function(totalBet, action, pot) {
			return this.absoluteBet(totalBet - this.liveBet, action, pot);
		},
		// Pulls an ante for a player.
		// For specificity, returns the ante removed from the player's stack.
		// Also, note that antes do not count towards a player's live bet (not the same as a blind)
		ante: function(ante, pot) {
			return this.absoluteBet(ante, Player.Action.POSTANTE, pot, true);
		},
		// Player is posting a blind. Note this is synonymous to a bet with respect to stack.
		// If you are blinding off the rest of your chips, you are all in.
		// Otherwise, note that this records the person as having posted a blind.
		postBlind: function(blind, pot) {
			return this.absoluteBet(blind, Player.Action.POSTBLIND, pot);
		},
		// Player is bettting or raising.
		// If you are betting the rest of your chips, you are all in.
		// For specificity, returns the amount removed from the player's stack.
		bet: function(bet, pot) {
			return this.absoluteBet(bet, Player.Action.BET, pot);
		},
		// Player calls to match a current bet.
		// Returns the amount removed from the player's stack in order to make the call.
		call: function(totalBet, pot) {
			return this.relativeBet(totalBet, Player.Action.CALL, pot);
		},
		// Player raises to certain amount, monetarily equivalent to making a call
		// Returns the amount removed from the player's stack in order to make the raise.
		raise: function(totalBet, pot) {
			return this.relativeBet(totalBet, Player.Action.RAISE, pot);
		},
		// Player bets the remainder of their chips.
		allIn: function(pot) {
			return this.absoluteBet(this.stack, Player.Action.ALLIN, pot);
		},
	}
	/*
     End Player object.
     */

    var table; 

    return {
     	createPlayer : function(name, peerId, stack) { return new Player(name, peerId, stack); },
     	createBlindStructure : function(levels) { return new BlindStructure(levels); },
     	createTable : function(players, startingStack, levels) { return new Table(players, startingStack, levels); },
     	createPot : function(players) { return new Pot(); },
     	initializeTableForTournament: function(players, startingStack, levels, gameController) {
     		table = new Table(players, startingStack, levels, gameController);
     		return table;
     	},
     	Player: { Action : Player.Action } ,
    }
});