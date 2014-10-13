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
		},
		getRankNamePlural: function() {
			var suffix = (this.rank === Card.Rank[6] ? 'es' : 's');
			return this.getRankName() + suffix;
		},
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
			if (this.rank === that.rank) {
				for (c = 0; c < this.cards.length; c++) {
					var diff = this.cards[c].compare(that.cards[c]);
					if (diff !== 0) {
						return diff;
					}
				}
				return 0;
			} else {
				return this.rank - that.rank;
			}
		},
		listCardRanks: function() {
			var ranks = '(';
			for (var c = 0; c < this.cards.length; c++) {
				if (c !== 0) { 
					ranks += ', '; 
				}
				ranks += this.cards[c].rank;
			}
			ranks += ')';
			return ranks;
		},
		toString: function() {
			switch (this.rank) {
				case Hand.Rank.StraightFlush:
					if (this.cards[0].rank === Card.Rank.Ace) {
						return 'Royal flush of ' + this.suit + '. Damn.';
					} else {
						return this.cards[0].getRankName() + ' high straight flush of ' + this.suit;
					}
				case Hand.Rank.FourOfAKind: 
					return 'Four ' + this.cards[0].getRankNamePlural() + ', ' + this.cards[4].getRankName() + ' kicker';
				case Hand.Rank.FullHouse: 
					return 'Full house, ' + this.cards[0].getRankNamePlural() + ' over ' + this.cards[3].getRankNamePlural();
				case Hand.Rank.Flush:
					return this.cards[0].getRankName() + '-high flush ' + this.listCardRanks() + ' of ' + this.suit;
				case Hand.Rank.Straight:
					return this.cards[0].getRankName() + ' high straight';
				case Hand.Rank.ThreeOfAKind: 
					return 'Three ' + this.cards[0].getRankNamePlural() + ', ' 
									+ this.cards[3].getRankName() + ' ' + this.cards[4].getRankName() + ' kicker';
				case Hand.Rank.TwoPair: 
					return 'Two pair, ' + this.cards[0].getRankNamePlural() 
										+ ' and ' + this.cards[2].getRankNamePlural() 
										+ ', ' + this.cards[4].getRankName() + ' kicker';
				case Hand.Rank.OnePair: 
					return 'One pair of ' + this.cards[0].getRankNamePlural() + ', ' 
										+ this.cards[2].getRankName() + ', ' 
										+ this.cards[3].getRankName() + ', ' 
										+ this.cards[4].getRankName() + ' kicker';
				case Hand.Rank.HighCard: 
					return this.cards[0].getRankName() + '-high ' + this.listCardRanks();
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
			var sortedCards = this.sortCards(cardSet);
			var hand = this.findHand(sortedCards);
			console.log('hand: ', hand.toString());
			return hand;
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
		    	var straightFlush = this.findHighestStraight(flush);
		    	if (straightFlush) {
		    		return new Hand(Hand.Rank.StraightFlush, straightFlush.cards.slice(0, 5), straightFlush.cards[0].suit);
		    	} else {
		    		return new Hand(Hand.Rank.Flush, flush.slice(0, 5), flush[0].suit);
		    	}
		    } else {
		    	return this.findHighestStraight(cardSet);
		    }
		},
		getAllFlushCards: function(cardSet) {
			var flush = _.chain(cardSet)
			    .groupBy(function(card) { return card.suit; } )
				.filter(function(cards) { return cards.length > 4; } )
				.value();
			return (_.isEmpty(flush) ? undefined : _.values(flush)[0]);
		},
		findHighestStraight: function(cardSet) {
		    var straight = _.reduce(cardSet, function(sl, c) {
		    	var lastRank = (sl.length === 0 ? 0 : sl[sl.length - 1].rank);
		    	var nextRank = c.rank;
		    	if (sl.length < 5 && lastRank !== nextRank) {
			    	if (lastRank - 1 === nextRank) {
			    		sl.push(c);
			    		return sl; 
			    	} else {
			    		return [c];
		    		}
	    		} else { 
	    			return sl;
	    		}
		    }, []);
		    if (straight.length >= 5) {
		    	return new Hand(Hand.Rank.Straight, straight);
		    } else if ((straight.length === 4) && (straight[0].rank === Card.Rank.Five) && (cardSet[0].rank === Card.Rank.Ace)) {
		        return new Hand(Hand.Rank.Straight, straight.concat(cardSet[0]));
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
				    	return new Hand(Hand.Rank.HighCard, this.findHighCards(cardSet).slice(0, 5));
				    }
			    }
		    }
		},
		findQuads: function(cardSet) {
			var quads = this.getOrderedCardsByCount(cardSet, 4);
			if (quads.length > 0) {
				var highCards = this.findHighCards(cardSet, quads[0]);
				return new Hand(Hand.Rank.FourOfAKind, quads[0].concat(highCards[0]));
			} else {
				return;
			}
		},
		findTripsOrFullHouse: function(cardSet) {
			var trips = this.getOrderedCardsByCount(cardSet, 3);
			if (trips.length === 2) {
				return new Hand(Hand.Rank.FullHouse, trips[0].concat(trips[1].slice(0, 2)));
			} else if (trips.length === 1) {
				var pairs = this.getOrderedCardsByCount(cardSet, 2);
				if (pairs.length > 0) {
					return new Hand(Hand.Rank.FullHouse, trips[0].concat(pairs[0]));
				} else {
					var highCards = this.findHighCards(cardSet, trips);
					return new Hand(Hand.Rank.ThreeOfAKind, trips[0].concat(highCards.slice(0, 2)));
				}
			} else {
				return;
			}
		},
		findPairs: function(cardSet) {
			var pairs = this.getOrderedCardsByCount(cardSet, 2);
			if (pairs.length >= 2) { // two pair
				var twoPairs = pairs[0].concat(pairs[1]);
				var highCards = this.findHighCards(cardSet, twoPairs);
				return new Hand(Hand.Rank.TwoPair, twoPairs.concat(highCards[0]));
			} else if (pairs.length === 1) { // two pair
				var highCards = this.findHighCards(cardSet, pairs[0]);
				return new Hand(Hand.Rank.OnePair, pairs[0].concat(highCards.slice(0, 3)));
			} else {
				return;
			}
		},
		findHighCards: function(cardSet, ignoreRanks) {
			var cards = _.chain(cardSet)
				.difference(ignoreRanks)
				.sortBy(function(card) { return card.rank; } )
				.reverse()
				.value();
			return cards;
		},
		getOrderedCardsByCount: function(cardSet, count) {
			var cards = _.chain(cardSet)
		        .groupBy(function(card) { return card.rank; } ) // { rank, [cards] }
		        .pairs() // [ 'rank', [cards] ], **rank is no longer a number**
		        .filter(function(rankCardsPair) { return rankCardsPair[1].length === count; } )// { rank, [cards].length == count }
		        .map(function(rankCardsPair) { return rankCardsPair[1]; }) // [ [cards] ]
				.sortBy(function(cards) { return cards[0].rank; } ) // [ [ cards ] ] order asc
				.reverse() // [ [ cards ] ] order desc
				.value();
			return cards;
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