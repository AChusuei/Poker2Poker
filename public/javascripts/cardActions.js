define(['jquery', 'playingCards', 'cards', 'jCanvas'], function($, pc, c, jc) {
    $(document).ready(function(){
        // var cardDeck = $("#cardDeck").playingCards();
        var cardDeck = new playingCards();
        cardDeck.spread(); // show it

        var hand = [];
        var showError = function(msg){
            $('#error').html(msg).show();
            setTimeout(function(){
                $('#error').fadeOut('slow');
            },3000);
        }
        var showHand = function(){
            var el = $('#yourHand')
            el.html('');
            for(var i=0;i<hand.length;i++){
                el.append(hand[i].getHTML());
            }
        }
        var doShuffle = function(){
            cardDeck.shuffle();
            cardDeck.spread(); // update card table
        }
        var doDrawCard = function(){
            var c = cardDeck.draw();
            if(!c){
                showError('no more cards');
                return;
            }
            hand[hand.length] = c;
            cardDeck.spread();
            showHand();
        }
        var doOrderByRank = function(){
            cardDeck.orderByRank();
            cardDeck.spread(); // update card table
        }
        var doOrderBySuit = function(){
            cardDeck.orderBySuit();
            cardDeck.spread(); // update card table
        }
        $('#shuffler').click(doShuffle);
        $('#draw').click(doDrawCard);
        $('#flop').click(doDrawCard);
        $('#shuffleDraw').click(function(){
            doShuffle();
            doDrawCard();
        });
        $('#addCard').click(function(){
            if(!hand.length){
                showError('your hand is empty');
                return;
            }
            var c = hand.pop();
            showHand();
            cardDeck.addCard(c);
            cardDeck.spread();
        });
        $('#orderByRank').click(doOrderByRank);
        $('#orderBySuit').click(doOrderBySuit);

        //$('#player2Hand').drawCard({ x: 100, y: 100, card: "Js" });
        
        //adjust x and y for scale
        function adjustForScale(args) {
            //take new height / width, get difference with scale, move by half
            return {
                x: (args.sWidth ? args.x - (args.sWidth - (args.sWidth * args.scaleX)) / 2 : args.x - (args.width - (args.width * args.scaleX)) / 2),
                y: (args.sHeight ? args.y - (args.sHeight - (args.sHeight * args.scaleY)) / 2 : args.y - (args.height - (args.height & args.scaleY)) / 2)
            };
        };
        
        /*
        $('#player2Hand').drawImage({ 
          source: '/assets/javascripts/svgs/cards_small/QC.svg',
          fromCenter: false,
          x: 0, y: 0,
          sx: 36, sy: 42,
          sWidth: 226,
          sHeight: 314,
          scale: 0.5,
        });*/
    });
});
     
