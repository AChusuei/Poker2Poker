define(['pokerHandEvaluator', 'playingCards', 'underscore'], function(handEvaluator, cards) {

	var cardDeck = new playingCards();

	var drawCards = function(count) {
		var cards = [];
		for (c = 0; c < count; c++) {
    		var cs = cardDeck.draw();
    		cards.push(handEvaluator.getCard(cs.rank, cs.suit));
    	};
    	return cards;
	};

	var getSeven = function(cardStrings) {
		var seven = [];
		_.each(cardStrings.split(','), function(s) {
			seven.push(handEvaluator.getCardFromString(s));
		});
		return seven; 
	}

	var verifyHandOneBeatsHandTwo = function(h1, h2) {
		var hand1 = handEvaluator.evaluateHand(h1);
		var hand2 = handEvaluator.evaluateHand(h2)
		// console.log('hand1:', hand1);
        expect(hand1.compare(hand2) > 0).toBeTruthy();
	}

	var verifyHandOneTiesHandTwo = function(h1, h2) {
		var hand1 = handEvaluator.evaluateHand(h1);
		var hand2 = handEvaluator.evaluateHand(h2)
        expect(hand1.compare(hand2)).toEqual(0);
	}  

	var AtoTnoFlush = getSeven('AS,KS,QS,JS,TC,KC,QC');
	var Jto7noFlush = getSeven('JS,4H,8S,3C,9S,TS,7H');
	var JackHighFlush = getSeven('JS,4S,8S,3S,9S,TS,7H');
	var JackHighFlushHigher = getSeven('JS,5S,8S,3S,9S,TS,7H');
	var wheelnoFlush = getSeven('JD,4S,8S,3S,5S,AC,2H');
	var wheelstraightFlush = getSeven('JD,4C,8S,3C,5C,AC,2C');
	var royalFlush = getSeven('JS,8C,KS,3H,QS,TS,AS');
	var sixFlushKingwithLowerJackHighSF = getSeven('JS,8S,KS,3H,9S,TS,7S');
	var sixFlushWithKingNoLowerSF = getSeven('JS,4S,KS,3S,9S,TS,7H');
	var tripsWithNineHighFlush = getSeven('3D,6D,2D,4S,4D,4C,9D');
	var twoPairsWithFlush = getSeven('4S,6S,6D,TS,4D,QS,AS');
	var quads = getSeven('JH,4S,JC,3S,JD,KS,JS');
	var twoSetsofTripsDoyleBrunson = getSeven('TS,2S,TC,3S,2D,TH,2H');
	var tripsPlusTwoPair = getSeven('KD,4S,4C,KS,JD,4H,JH');
	var minimumFullHouse = getSeven('KD,4S,4C,QS,JD,4H,JH');
	var justTrips = getSeven('3S,AS,KD,9S,TD,3C,3H');
	var threePairs = getSeven('KS,6S,KD,JS,QD,QC,JH');
	var twoPairsNoFlushKingKicker = getSeven('4S,6S,6D,TS,4D,QC,KH');
	var twoPairsNoFlushAceKicker = getSeven('4S,6S,6D,TS,4D,QC,AH');
	var onePair = getSeven('2S,7S,TD,8S,QD,8C,5H');
	var kingHigh = getSeven('3S,6S,2D,QS,KD,4C,9H');
	var aceHigh = getSeven('3S,6S,2D,QS,AD,4C,9H');
	
	var verifyStraight = function(hand, highCard) {
		expect(hand.rank === handEvaluator.Hand.Rank.Straight || 
			   hand.rank === handEvaluator.Hand.Rank.StraightFlush).toBeTruthy();
		for (c = 0; c < 5; c++) {
			if (c === 4 && highCard === handEvaluator.Card.Rank.Five) {
				// wheel check bottom card for Ace
				expect(hand.cards[c].rank).toEqual(handEvaluator.Card.Rank.Ace);
			} else {
				expect(hand.cards[c].rank).toEqual(highCard - c);
			}
		}
	};

	var verifyFlush = function(hand) {
		expect(hand.rank === handEvaluator.Hand.Rank.Flush || 
			   hand.rank === handEvaluator.Hand.Rank.StraightFlush).toBeTruthy();
		var suit = hand.cards[0].suit;
		for (c = 0; c < 5; c++) {
			expect(hand.cards[c].suit).toEqual(suit);
		}
	}

	var verifyStraightFlush = function(hand, highCard) {
		expect(hand.rank).toEqual(handEvaluator.Hand.Rank.StraightFlush);
		verifyStraight(hand, highCard);
		verifyFlush(hand);
	}



	describe('A Hand Evaluator', function() {

		it('should return an Ace high straight for AtoTnoFlush', function() {
			var hand = handEvaluator.evaluateHand(AtoTnoFlush);
			verifyStraight(hand, handEvaluator.Card.Rank.Ace);
        });

        it('should return an Jack high straight for Jto7noFlush', function() {
			var hand = handEvaluator.evaluateHand(Jto7noFlush);
            verifyStraight(hand, handEvaluator.Card.Rank.Jack);
        });

        it('should return a flush for JackHighFlush', function() {
			var hand = handEvaluator.evaluateHand(JackHighFlush);
            verifyFlush(hand);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.Jack);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.Ten);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank.Nine);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank.Eight);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank.Four);
        });

        it('should return a wheel for WheelnoFlush', function() {
			var hand = handEvaluator.evaluateHand(wheelnoFlush);
            verifyStraight(hand, handEvaluator.Card.Rank.Five);
        });

        it('should return a wheel for wheelstraightFlush', function() {
			var hand = handEvaluator.evaluateHand(wheelstraightFlush);
            verifyStraightFlush(hand, handEvaluator.Card.Rank.Five);
        });

        it('should return a royal flush for royalFlush', function() {
			var hand = handEvaluator.evaluateHand(royalFlush);
            verifyStraightFlush(hand, handEvaluator.Card.Rank.Ace);
        });

        it('should return a straight flush for sixFlushAcewithLowerJackHighSF', function() {
			var hand = handEvaluator.evaluateHand(sixFlushKingwithLowerJackHighSF);
            verifyStraightFlush(hand, handEvaluator.Card.Rank.Jack);
        });

		it('should return a flush for sixFlushWithKingNoLowerSF', function() {
			var hand = handEvaluator.evaluateHand(sixFlushWithKingNoLowerSF);
            verifyFlush(hand);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.King);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.Jack);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank.Ten);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank.Nine);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank.Four);
        });

		it('should return a nine high flush for tripsWithNineHighFlush', function() {
			var hand = handEvaluator.evaluateHand(tripsWithNineHighFlush);
            verifyFlush(hand);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.Nine);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.Six);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank.Four);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank.Three);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank.Two);
        });

        it('should return an ace high flush for twoPairsWithFlush', function() {
			var hand = handEvaluator.evaluateHand(twoPairsWithFlush);
            verifyFlush(hand);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.Ace);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.Queen);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank.Ten);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank.Six);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank.Four);
        });

		it('should return four of a kind with kicker for quads', function() {
			var hand = handEvaluator.evaluateHand(quads);
            expect(hand.rank).toEqual(handEvaluator.Hand.Rank.FourOfAKind);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.Jack);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.Jack);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank.Jack);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank.Jack);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank.King);
        });

        it('should return a full house for twoSetsofTripsDoyleBrunson', function() {
			var hand = handEvaluator.evaluateHand(twoSetsofTripsDoyleBrunson);
            expect(hand.rank).toEqual(handEvaluator.Hand.Rank.FullHouse);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.Ten);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.Ten);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank.Ten);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank.Two);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank.Two);
        });

        it('should return a full house for tripsPlusTwoPair', function() {
			var hand = handEvaluator.evaluateHand(tripsPlusTwoPair);
            expect(hand.rank).toEqual(handEvaluator.Hand.Rank.FullHouse);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.Four);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.Four);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank.Four);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank.King);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank.King);
        });

        it('should return a full house for minimumFullHouse', function() {
			var hand = handEvaluator.evaluateHand(minimumFullHouse);
            expect(hand.rank).toEqual(handEvaluator.Hand.Rank.FullHouse);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.Four);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.Four);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank.Four);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank.Jack);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank.Jack);
        });

        it('should return a three of a kind for justTrips', function() {
			var hand = handEvaluator.evaluateHand(justTrips);
			expect(hand.rank).toEqual(handEvaluator.Hand.Rank.ThreeOfAKind);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.Three);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.Three);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank.Three);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank.Ace);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank.King);
        });

        it('should return a two pair high kicker for threePairs', function() {
			var hand = handEvaluator.evaluateHand(threePairs);
			expect(hand.rank).toEqual(handEvaluator.Hand.Rank.TwoPair);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.King);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.King);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank.Queen);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank.Queen);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank.Jack);
        });

        it('should return a two pair high kicker for twoPairsNoFlush', function() {
			var hand = handEvaluator.evaluateHand(twoPairsNoFlushKingKicker);
			expect(hand.rank).toEqual(handEvaluator.Hand.Rank.TwoPair);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.Six);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.Six);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank.Four);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank.Four);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank.King);
        });

        it('should return a one pair with kickers for onePair', function() {
			var hand = handEvaluator.evaluateHand(onePair);
			expect(hand.rank).toEqual(handEvaluator.Hand.Rank.OnePair);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.Eight);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.Eight);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank.Queen);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank.Ten);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank.Seven);
        });

        it('should return a king high hand for kingHigh', function() {
			var hand = handEvaluator.evaluateHand(kingHigh);
			expect(hand.rank).toEqual(handEvaluator.Hand.Rank.HighCard);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.King);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.Queen);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank.Nine);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank.Six);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank.Four);
        });

	});

	describe('Hand Comparisons:', function() {

		it('AtoTnoFlush should beat Jto7noFlush', function() {
			verifyHandOneBeatsHandTwo(AtoTnoFlush, Jto7noFlush);
			verifyHandOneBeatsHandTwo(JackHighFlushHigher, JackHighFlush);
			verifyHandOneBeatsHandTwo(JackHighFlush, wheelnoFlush);
			verifyHandOneBeatsHandTwo(sixFlushKingwithLowerJackHighSF, sixFlushWithKingNoLowerSF);
			verifyHandOneBeatsHandTwo(sixFlushWithKingNoLowerSF, tripsWithNineHighFlush);
			verifyHandOneBeatsHandTwo(royalFlush, quads);
			verifyHandOneBeatsHandTwo(twoPairsNoFlushAceKicker, twoPairsNoFlushKingKicker);
			verifyHandOneBeatsHandTwo(minimumFullHouse, justTrips);
			verifyHandOneBeatsHandTwo(tripsPlusTwoPair, minimumFullHouse);
			verifyHandOneBeatsHandTwo(onePair, kingHigh);
			verifyHandOneBeatsHandTwo(twoPairsNoFlushKingKicker, onePair);
			verifyHandOneBeatsHandTwo(aceHigh, kingHigh);
			verifyHandOneBeatsHandTwo(quads, onePair);
			verifyHandOneBeatsHandTwo(justTrips, twoPairsNoFlushAceKicker);
        });

	});

	describe('A Card', function() {

        beforeEach(function() {
        	cardDeck.shuffle();
            this.ah = handEvaluator.getCardFromString('AH');
            this.kh = handEvaluator.getCardFromString('KH');
        });        

        xit('should compare correctly', function() {
            expect(this.kh.compare(this.ah) < 0).toBeTruthy();
        });

		xit('drawing cards should convert properly', function() {
			var cs = cardDeck.draw();
			console.log('card tr: ' + cs);
			var card = handEvaluator.getCard(cs.rank, cs.suit);
            console.log('card obj: ' + card);
        });

        xit('should evaluate some hand from seven cards drawn', function() {
        	var playerCards = drawCards(2);
        	var community = drawCards(5); 
        	console.log('player cards: ' + playerCards);
        	console.log('community cards: ' + community);
        	var hand = handEvaluator.evaluateHand(playerCards, community);
			console.log('hand: ' + hand);        	
        });

        xit('should evaluate some hand from seven cards flush', function() {
        	var playerCards = [
        		handEvaluator.getCardFromString('AH'), 
        		handEvaluator.getCardFromString('KH')
        	];
        	var community = [
				handEvaluator.getCardFromString('6H'),
				handEvaluator.getCardFromString('QC'),
				handEvaluator.getCardFromString('8C'),
				handEvaluator.getCardFromString('3H'), 
				handEvaluator.getCardFromString('4H'),
			]; 
        	console.log('player cards: ' + playerCards);
        	console.log('community cards: ' + community);
        	var seven = this.communityCards.concat(player.hand);
        	var hand = handEvaluator.evaluateHand(seven);
			console.log('hand: ' + hand); 
        });

        xit('should evaluate some hand from straight', function() {
        	var playerCards = [
        		handEvaluator.getCardFromString('AH'), 
        		handEvaluator.getCardFromString('KH')
        	];
        	var community = [
				handEvaluator.getCardFromString('TH'),
				handEvaluator.getCardFromString('QH'),
				handEvaluator.getCardFromString('8C'),
				handEvaluator.getCardFromString('JH'), 
				handEvaluator.getCardFromString('4H'),
			]; 
        	console.log('player cards: ' + playerCards);
        	console.log('community cards: ' + community);
        	var seven = this.communityCards.concat(player.hand);
        	var hand = handEvaluator.evaluateHand(seven);
			console.log('hand: ' + hand); 
        });

    });

	 

});