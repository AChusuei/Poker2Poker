define(['jquery', 'poker', 'peerActions'], function($, poker, peerActions) {

    var resolvePlayerAction = null;
    var session = peerActions.getSession();

    // UI triggered events
    $('#connectToPeer').click(function() {
        session.connectToPeer(remotePeerId);
    });
    $('#endGame').click(function() {
        session.stopPeer();
        console.log('ENDING GAME!');
    });
    $('#sendMessage').click(function() {
        var msg = $('#messageToSend').val();
        session.sendMessage(msg);
    });
    $('#startGame').click(function() {
        // var msg = $('#messageToSend').val();
        // create player(s) for game.
        var player = poker.createPlayer()
        poker.startTournamentGame(peerActions.connection);
    });
    console.log('ui has been set up and is ready to go!');

    return {
        // Tells UI to prompt this player to action. 
        promptPlayerAction: function(player, options, callBack) {
            // find dom element according to player.
            // change dom elements according to options.
            resolvePlayerAction = callBack;
        },
        // Tells UI that something changed.
        conveyPlayerAction: function(player, action, amount) {
            
        },
        // Determines how to route the player's response. 
        submitPlayerResponse: function(player, action, amount) {
            conveyPlayerAction(player, action, amount);
            resolvePlayerAction({ 
                action : action, 
                amount: amount 
            });
            // if (player.isLocal()) {
            //     resolvePlayerAction({ 
            //         action : action, 
            //         amount: amount 
            //     });
            // } else {
            //     peerActions.getSession('').conveyPlayerAction(action, amount);    
            // }
        },
        check: function() {
            submitPlayerResponse(poker.Player.Action.CHECK);
        },
        fold: function() {
            submitPlayerResponse(poker.Player.Action.FOLD);
        },
        bet: function(amount) {
            submitPlayerResponse(poker.Player.Action.BET, amount);
        },
        callBet: function(amount) {
            submitPlayerResponse(poker.Player.Action.CALL, amount);
        },
        raise: function(amount) {
            submitPlayerResponse(poker.Player.Action.RAISE, amount);
        },
        allIn: function() {
            submitPlayerResponse(poker.Player.Action.ALLIN);
        },
        signal: function(action, info) {
            switch (action) {
                case 'open': 
                    $('#peerId').text(info.id); break;
                case 'connection':
                    $('#connectedRemotePeerId').text(info.peerId);
                    break;
                case 'close':
                    $('#peerId').text(info.peerId + ', and was disconnected');
                    break;
            }
        },
    };

});