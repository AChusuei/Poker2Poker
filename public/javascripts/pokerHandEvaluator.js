define(['underscore'], function() {

	function Card(rank, suit) {
		this.rank = Card.Rank[rank];
		this.suit = Card.Suit[suit];
	};
	Card.prototype = {
		toString: function() {
			return this.getRankName() + ' of ' + this.suit;
		},
		compare: function(that) {
			if (this.rank < that.rank) {
				return -1;
			} else if (this.rank > that.rank) {
				return 1
			} else {
				return 0;
			}
		},
		convertFromString: function(string) {
			return new Card(string.substring(0, 1), string.substring(1, 2));
		},
		getRankName: function() {
			switch (this.rank) {
				case Card.Rank.A: return 'Ace';
				case Card.Rank.K: return 'King';
				case Card.Rank.Q: return 'Queen';
				case Card.Rank.J: return 'Jack';
				case Card.Rank.T: return 'Ten';
				case Card.Rank[9]: return 'Nine';
				case Card.Rank[8]: return 'Eight';
				case Card.Rank[7]: return 'Seven';
				case Card.Rank[6]: return 'Six';
				case Card.Rank[5]: return 'Five';
				case Card.Rank[4]: return 'Four';
				case Card.Rank[3]: return 'Three';
				case Card.Rank[2]: return 'Two';
				case Card.Rank.N: return 'Null';
			}
		}
	};
	Card.Rank = {
		// Used for shorthand, so we can quickly instantiate cards
		A: 14,
		K: 13,
		Q: 12,
		J: 11,
		T: 10,
		9: 9,
		8: 8,
		7: 7,
		6: 6,
		5: 5,
		4: 4,
		3: 3,
		2: 2,
		N: 0,
		// Used for clarity
		Ace: 14,
		King: 13,
		Queen: 12,
		Jack: 11,
		Ten: 10,
		Nine: 9,
		Eight: 8,
		Seven: 7,
		Six: 6,
		Five: 5,
		Four: 4,
		Three: 3,
		Two: 2,
		Null: 0,
	};
	Card.Suit = {
		S: 'Spades',
		H: 'Hearts',
		D: 'Diamonds',
		C: 'Clubs',
	};

	function Hand(rank, cards, suit) {
    	this.rank = rank;
    	this.cards = cards;
    	this.suit = suit;
    };
    Hand.Rank = {
		HighCard: 0,
		OnePair: 1,
		TwoPair: 2,
		ThreeOfAKind: 3,
		Straight: 4,
		Flush: 5,
		FullHouse: 6,
		FourOfAKind: 7,
		StraightFlush: 8,
	};
	Hand.prototype = {
		compare: function(that) {
			if (this.handRank == that.handRank) {
				for (c = 0; c < this.cards.length; c++) {
					var diff = this.cards[c].compare(that.cards[c]);
					if (diff != 0) {
						return diff;
					}
					return 0;
				}
			} else {
				return this.handRank - that.handRank;
			}
		},
		listCardRanks: function() {
			var ranks = '(';
			for (var c = 0; c < this.cards.length; c++) {
				if (c != 0) { 
					ranks += ','; 
				}
				ranks += this.cards[c].rank;
			}
			ranks += ')';
			return ranks;
		},
		toString: function() {
			switch (this.handRank) {
				case Hand.Rank.StraightFlush:
					if (this.cards[0].rank == Card.Rank.Ace) {
						return 'Royal flush of ' + this.suit + '. Damn.';
					} else {
						return this.cards[0].rank + ' high straight flush of ' + this.suit;
					}
				case Hand.Rank.Flush:
					return 'Flush ' + this.listCardRanks() + ' of ' + this.suit;
				case Hand.Rank.Straight:
					return this.cards[0].rank + ' high straight';
			}
		},
	};

	/* 
	 Evaluates given cards to best five card poker hand.
	 */
	function HandEvaluator() {
		
	};
	HandEvaluator.prototype = {
		evaluateHand: function(cardSet) {
			console.log('seven: ' + cardSet);
			var sortedCards = this.sortCards(cardSet);
			console.log('sorted cards: ' + sortedCards);
			return this.findHand(sortedCards);
		},
		// Sorts card in rank order from highest to lowest
		sortCards: function(cardSet) {
			return _.sortBy(cardSet, function(c) { 
				return c.rank; 
			}).reverse();
		},
		findHand: function(cardSet) {
			var flushOrStraight = this.findHighestFlushOrStraight(cardSet);
			if (flushOrStraight) {
				return flushOrStraight;
			} else {
				return this.findDuplicateTypeHand(cardSet);
			}
		},
		findHighestFlushOrStraight: function(cardSet) {
		    var flush = this.getAllFlushCards(cardSet);
		    if (flush) {
		    	console.log('flush: ' + flush);
		    	var straightFlush = this.findHighestStraight(flush);
		    	if (straightFlush) {
		    		return new Hand(Hand.Rank.StraightFlush, straightFlush.cards, straightFlush.cards[0].suit);
		    	} else {
		    		return new Hand(Hand.Rank.Flush, flush, flush[0].suit);
		    	}
		    } else {
		    	return this.findHighestStraight(cardSet);
		    }
		},
		getAllFlushCards: function(cardSet) {
			console.log('getAllFlushCards(cardSet): ' + cardSet);
			var flush = _.chain(cardSet)
			    .groupBy(function(card) { return card.suit; } )
				.filter(function(cards) { return cards.length > 4; } )
				.value();
			return (_.isEmpty(flush) ? undefined : _.values(flush)[0]);
		},
		findHighestStraight: function(cardSet) {
		    var straight = _.reduce(cardSet, function(sl, c) {
		    	var lastRank = (sl.length == 0 ? 0 : sl[sl.length - 1].rank);
		    	var nextRank = c.rank;
		    	if (sl.length < 5 && lastRank != nextRank) {
			    	if (lastRank - 1 == nextRank) {
			    		sl.push(c);
			    		return sl; 
			    	} else {
			    		return [c];
		    		}
	    		} else { 
	    			return sl;
	    		}
		    }, []);
		    if (straight.length >= 5 || ((straight.length == 4) && (straight[0].rank == Card.Rank.Five) && (cardSet[0].rank == Card.Rank.Ace))) {
		    	console.log('straight!: ' + straight);
		    	var hand = new Hand(Hand.Rank.Straight, straight);
		        return hand;
		    } else {
		        return;
		    }
		},
		findDuplicateTypeHand: function(cardSet) {
		    var quadHand = this.findQuads(cardSet);
		    if (quadHand) {
		    	return quadHand;
		    } else {
		    	var tripsyHand = this.findTripsOrFullHouse(cardSet);
		    	if (tripsyHand) {
			    	return tripsyHand;
			    } else {
			    	var pairsyHand = this.findPairs(cardSet);
			    	if (pairsyHand) {
				    	return pairsyHand;
				    } else {
				    	return this.findHighCards(cardSet);
				    }
			    }
		    }
		},
		findQuads: function(cardSet) {
			var quads = this.getOrderedCardsByCount(cardSet, 4);
			if (quads) {
				var highCards = this.findHighCards(cardSet, quads);
				quads.push(highCards);
				return new Hand(Hand.Rank.FourOfAKind, quads);
			} else {
				return;
			}
		},
		findTripsOrFullHouse: function(cardSet) {
			var trips = this.getOrderedCardsByCount(cardSet, 3);
			if (trips) {
				if (trips.length == 2) {
					return new Hand(Hand.Rank.FullHouse, trips);
				} else if (trips.length == 1) {
					var pairs = this.findPairs(cardSet);
					if (pairs.length > 0) {
						trips.push(pairs);
						return new Hand(Hand.Rank.FullHouse, trips);
					} else {
						var highCards = this.findHighCards(cardSet, trips);
						trips.push(highCards);
						return new Hand(Hand.Rank.ThreeOfAKind, trips);
					}
				}
			} else {
				return;
			}
		},
		findPairs: function(cardSet) {
			var pairs = this.getOrderedCardsByCount(cardSet, 2);
			if (pairs) {
				if (pairs.length >= 2) { // two pair
					var twoPairs = pairs.slice(0, 2);
					var highCards = this.findHighCards(cardSet, twoPairs);
					twoPairs.push(highCards);
					return new Hand(Hand.Rank.TwoPair, twoPairs);
				} else if (pairs.length == 1) { // two pair
					var highCards = this.findHighCards(cardSet, pairs);
					pairs.push(highCards);
					return new Hand(Hand.Rank.OnePair, pairs);
				}
				return;
			} else {
				return;
			}
		},
		findHighCards: function(cardSet, ignoreRanks) {
			return _.chain(cardSet)
		        .map(function(card) { return card.rank; }) // { rank }
		        .filter(function(rank) { return !_.contains(ignoreRanks, rank); } )
				.sortBy(function(rank) { return rank; } ) // { rank } order by asc
				.reverse() // { rank } order by desc
				.value();
		},
		getOrderedCardsByCount: function(cardSet, count) {
			return _.chain(cardSet)
		        .groupBy(function(card) { return card.rank; } ) // { rank, [cards] }
		        .filter(function(cards) { return cards.length == count; } ) // { rank, [cards].length == count }
		        .map(function(cards, rank) { return rank; }) // { rank }
				.sortBy(function(rank) { return rank; } ) // { rank } order by asc
				.reverse() // { rank } order by desc
				.value();
		},
	};

	return {
		evaluateHand: function(cardSet) { return HandEvaluator.prototype.evaluateHand(cardSet); },
		getCardFromString: function(string) { return Card.prototype.convertFromString(string); },
		getCard: function(rank, suit) { return new Card(rank, suit); },
		Card : { Rank: Card.Rank},
		Hand : { Rank: Hand.Rank},
	};
});