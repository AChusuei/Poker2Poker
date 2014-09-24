define(['pokerHandEvaluator'], function(handEvaluator) {

	describe('A Card', function() {

        beforeEach(function() {
            this.ah = handEvaluator.getCard('AH');
            this.kh = handEvaluator.getCard('KH');
        });        

        it('should compare correctly', function() {
            expect(this.kh.compare(this.ah) < 0).toBeTruthy();
        });

    });

});