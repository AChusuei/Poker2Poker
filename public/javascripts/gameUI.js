define(['jquery', 'poker', 'peerActions'], function($, poker, peerActions) {

    var resolvePlayerAction;

    // UI triggered events
    $('#connectToPeer').click(function() {
        var remotePeerId = $('#remotePeerId').val();
        peerActions.connectToPeer(remotePeerId);
    });
    $('#endGame').click(function() {
        peerActions.getSession().stopPeer();
        console.log('ENDING GAME!');
    });
    $('#sendMessage').click(function() {
        var msg = $('#messageToSend').val();
        // var session = peerActions.getSession();      
        // peerActionssession.sendMessage(session.cc, msg);
        peerActions.sendMessageToAll(msg);
    });
    $('#startTournamentGame').click(function() {
        // var msg = $('#messageToSend').val();
        // create player(s) for game.
        var players = [];
        var levels = [
            { smallBlind: 15, bigBlind: 30, ante: 1, min: 10 },
            { smallBlind: 20, bigBlind: 40, ante: 2, min: 10 },
            { smallBlind: 25, bigBlind: 50, ante: 3, min: 10 }
        ];
        var connections = peerActions.getAllConnections();
        for (var c = 0; c < connections.length; c++) {
            var player = poker.createRemotePlayer(connections[c], 0);
            players.push(player);
        }
        players.push(poker.createLocalPlayer('Alan Chusuei', 5000));
        poker.startTournamentGame(players, levels, 5000);
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
                case 'data':
                    $('#receivedMessage').text(info.data);
                    break;
            }
        },
    };

});