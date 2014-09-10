define(['underscore'], function() {

    describe('just checking', function() {

        it('works for underscore', function() {
            // just checking that _ works
            expect(_.size([1,2,3])).toEqual(3);
        });

        it('filters out the right stuff', function() {
            expect(_.filter([1,2,3], function(i) { return i == 3 }).length).toEqual(1);
        });

    });

});