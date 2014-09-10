define(['moment', 'underscore', 'playingCards'], function() {

    /*
     Start table object regarding table position and dealing.
     */
	function Table(players) {
		// Lists all of the players at the table (even if they're out)
		this.initializePlayerPositions(players);
		// Index of player with the button.
		this.button = Math.floor((Math.random() * this.players.length));
		// Index of player to whom action is on.
		this.cardDeck = new playingCards();
		this.pots = [];
		this.blinds = null;
	}
	Table.prototype.initializePlayerPositions = function(players) {
		this.players = [];
		while (players.length > 0) {
			var randomIndex = Math.floor((Math.random() * players.length));
			this.players.push(players[randomIndex]);
			players.splice(randomIndex, 1);		
		}
	}
	Table.prototype.nextLivePlayer = function() {
		if (this.button == this.players.length) {
			this.currentPlayer = 0;
		} else {
			this.currentPlayer += 1;
		}
		return this.players[currentPlayer];
	}
	Table.prototype.dealCards = function() {
		this.cardDeck.shuffle();
		_.chain(this.players)
		    .filter(players, function(p) { return p.stack > 0; } ) // only deal cards to players with chips remaining
			.each(this.players, function(player) { 
				player.hand == []; 
				// draw two cards per player.
				player.hand.push(this.cardDeck.drawCard());
				player.hand.push(this.cardDeck.drawCard());
			});
	}
	Table.prototype.postBlindsAndAntes = function() {
		var pot = {};
		pot.amount = 0;
		// get antes from every player.
		_.each(this.players, function(player) { 
			pot.amount += player.ante();
		});
		// Player after button posts small blind.
		pot.amount += this.nextLivePlayer.bet(this.blinds.sb);
		// Player after small blind posts big blind.
		pot.amount += this.nextLivePlayer.bet(this.blinds.bb);
		return pot;
	}
	Table.prototype.playHand = function() {
		pots.push({ amount : 0 });
		// take random amount from each player. 
		var amt = Math.floor((Math.random() * this.players.length));
		_.each(this.players, function(player) { 
			pots[0].amount += player.bet(amt);
		});
		// for now pick random player as winner. 
		var winner = Math.floor((Math.random() * this.players.length));
		table.players[winner].stack += table.pot.amount;
	}
	Table.prototype.findGameWinner = function() {
		// Someone should have chips remaining, otherwise something REALLY REALLY wrong happened here.
		return _.filter(this.players, function(p) { return p.stack > 0; } ).length == 1;
	}
	/*
     End Table object.
     */

	/*
     Start BlindStructure object: holds blind levels of the game.
     */
	function BlindStructure(startingStack, levels) {
		this.startingStack = startingStack;
		this.levels = levels;
	};
	BlindStructure.prototype.getBlindLevel = function() {
		var blindLevelDetails = this.levels[this.currentLevel];
		if (this.currentLevel = -1 || moment().diff(blindLevelDetails.timeStart, 'minutes') > blindLevelDetails.min) {
			currentLevel += 1;
			this.levels[this.currentLevel].timeStart = moment();
		}
		return this.levels[this.currentLevel];
	};
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
	}
	// Pulls an ante for a player.
	// For specificity, returns the ante removed from the player's stack.
	// Also, note that antes do not count towards a player's live bet (not the same as a blind)
	Player.prototype.ante = function(ante) {
		if (ante > this.stack) {
			ante = this.stack;
		}
		this.stack -= ante;
		return ante;
	}
	// Player is bettting or raising.
	// For specificity, returns the amount removed from the player's stack.
	Player.prototype.bet = function(bet) {
		if (bet > this.stack) {
			bet = this.stack;
		}
		this.stack -= bet;
		this.liveBet += bet;
		return bet;
	}
	// Player calls to match a current bet.
	// Returns the amount removed from the player's stack in order to make the call.
	Player.prototype.call = function(totalBet) {
		if (totalBet > this.stack) {
			totalBet = this.stack;
		}
		var delta = totalBet - this.liveBet;
		this.stack -= delta;
		this.liveBet = totalBet;
		return delta;
	}
	// Player bets the remainder of their chips.
	Player.prototype.allIn = function() {
		var rest = this.stack;
		this.liveBet += rest;
		this.stack = 0;
		return rest;
	}
	/*
     End Player object.
     */

     return {
     	createPlayer : function(name, stack) { return new Player(name, stack); }
     }
});