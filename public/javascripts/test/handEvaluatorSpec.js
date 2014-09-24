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

	var AtoTnoFlush = getSeven('AS,KS,QS,JS,TC,KC,QC');
	var Jto7noFlush = getSeven('JS,4H,8S,3C,9S,TS,7H');
	var Jto7Flush = getSeven('JS,4S,8S,3S,9S,TS,7H');
	var wheelnoFlush = getSeven('JD,4S,8S,3S,5S,AC,2H');
	var royalFlush = getSeven('JS,8C,KS,3H,QS,TS,AS');
	var sixFlushAcewithLowerSF = getSeven('JS,8S,KS,3H,9S,TS,7S');
	var sixFlushNoLowerSF = getSeven('JS,4S,KS,3S,9S,TS,7H');
	var tripsWithFlush = getSeven('3D,6D,2D,4S,4D,4C,9D');
	var quads = getSeven('JH,4S,JC,3S,JD,TS,JS');
	var twoSetsofTrips = getSeven('TS,2S,TC,3S,2D,TH,2H');
	var tripsPlusTwoPair = getSeven('KD,4S,4C,KS,JD,4H,JH');
	var justTrips = getSeven('3S,AS,KD,9S,TD,3C,3H');
	var threePairs = getSeven('KS,6S,KD,JS,QD,QC,JH');
	var twoPairs = getSeven('4S,6S,6D,TS,4D,QC,AH');
	var onePair = getSeven('2S,7S,TD,8S,QD,8C,5H');
	var kingHigh = getSeven('3S,6S,2D,QS,KD,4C,9H');

	describe('A Hand Evaluator', function() {

		it('should return an Ace high straight for AtoTnoFlush', function() {
			var hand = handEvaluator.evaluateHand(AtoTnoFlush);
            expect(hand.rank).toEqual(handEvaluator.Hand.Rank.Straight);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.A);
        });

        it('should return an Jack high straight for Jto7noFlush', function() {
			var hand = handEvaluator.evaluateHand(Jto7noFlush);
            expect(hand.rank).toEqual(handEvaluator.Hand.Rank.Straight);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.J);
        });

        it('should return a flush for Jto7Flush', function() {
			var hand = handEvaluator.evaluateHand(Jto7Flush);
            expect(hand.rank).toEqual(handEvaluator.Hand.Rank.Flush);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.J);
            expect(hand.cards[1].rank).toEqual(handEvaluator.Card.Rank.T);
            expect(hand.cards[2].rank).toEqual(handEvaluator.Card.Rank[9]);
            expect(hand.cards[3].rank).toEqual(handEvaluator.Card.Rank[8]);
            expect(hand.cards[4].rank).toEqual(handEvaluator.Card.Rank[4]);
        });

        it('should return a wheel for WheelnoFlush', function() {
			var hand = handEvaluator.evaluateHand(wheelnoFlush);
            expect(hand.rank).toEqual(handEvaluator.Hand.Rank.Straight);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank[5]);
        });

        it('should return a royal flush for royalFlush', function() {
			var hand = handEvaluator.evaluateHand(royalFlush);
            expect(hand.rank).toEqual(handEvaluator.Hand.Rank.StraightFlush);
            expect(hand.cards[0].rank).toEqual(handEvaluator.Card.Rank.A);
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