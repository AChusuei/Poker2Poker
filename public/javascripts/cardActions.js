define(['jquery'], function($) {
    $(document).ready(function(){
        var cardDeck = $("#cardDeck").playingCards();
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
    });
});
     
