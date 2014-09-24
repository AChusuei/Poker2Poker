define(['pokerHandEvaluator', 'playingCards', 'underscore'], function(handEvaluator, cards) {

	var cardDeck = new playingCards();

	var drawCards = function(count) {
		var cards = [];
		for (c = 0; c < count; c++) {
    		var cs = cardDeck.draw();
    		cards.push(handEvaluator.getCard(cs.rank, cs.suit));
    	};
    	return cards;
	}

	describe('A Card', function() {

        beforeEach(function() {
        	cardDeck.shuffle();
            this.ah = handEvaluator.getCardFromString('AH');
            this.kh = handEvaluator.getCardFromString('KH');
        });        

        it('should compare correctly', function() {
            expect(this.kh.compare(this.ah) < 0).toBeTruthy();
        });

		it('drawing cards should convert properly', function() {
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
			// community.push(playerCards);
   //       	var original = _.sortBy(community, function(card) { 
			// 	return card.getRank(); 
			// }).reverse();
			// console.log('original: ' + original);
        	
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
        	var hand = handEvaluator.evaluateHand(playerCards, community);
			console.log('hand: ' + hand); 
        });

        it('should evaluate some hand from straight', function() {
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
        	var hand = handEvaluator.evaluateHand(playerCards, community);
			console.log('hand: ' + hand); 
        });

    });

});