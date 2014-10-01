define(['jquery', 'gameController'], 
function($,        gameController) {

    // UI triggered events
    $('#startSession').click(function() {
        var userName = $('#userName').val();
        gameController.startSession(userName);
    });
    $('#connectToPeer').click(function() {
        var remotePeerId = $('#remotePeerId').val();
        gameController.connectToPeer(remotePeerId);
    });
    $('#endGame').click(function() {
        // peerActions.getSession().stopPeer();
        console.log('ENDING GAME!');
    });
    $('#sendMessage').click(function() {
        var msg = $('#messageToSend').val();
        // var data = JSON.parse(msg);
        gameController.getUserName($('#sendMessage').parent().siblings().text());
        // var session = peerActions.getSession();      
        // peerActionssession.sendMessage(session.cc, msg);
        // peerActions.sendMessageToAll(msg);
    });
    $('#startTournamentGame').click(function() {
        // var msg = $('#messageToSend').val();
        // create player(s) for game.
        gameController.startTournamentGame();
    });

    return {
        // Tells UI to prompt this player to action. 
        promptPlayerAction: function(options) {
            // find dom element according to player. -- USE options
            // change dom elements according to options.
        },
        // Tells UI that something changed.
        conveyPlayerAction: function(player, action, amount) {
            
        },
        // Determines how to route the player's response. 
        submitPlayerAction: function(action, amount) {
            conveyPlayerAction(player, action, amount);
            gameController.submitPlayerAction(action, amount);
        },
        check: function() {
            submitPlayerAction(poker.Player.Action.CHECK);
        },
        fold: function() {
            submitPlayerAction(poker.Player.Action.FOLD);
        },
        bet: function(amount) {
            submitPlayerAction(poker.Player.Action.BET, amount);
        },
        callBet: function(amount) {
            submitPlayerAction(poker.Player.Action.CALL, amount);
        },
        raise: function(amount) {
            submitPlayerAction(poker.Player.Action.RAISE, amount);
        },
        allIn: function() {
            submitPlayerAction(poker.Player.Action.ALLIN);
        },
        signal: function(action, info) {
            switch (action) {
                case 'open': 
                    $('#personalPeerId').text(info.id);
                    $('#startSession').attr('disabled', 'disabled');
                    $('#userName').attr('disabled', 'disabled');
                    $('#startSession').text('Session Started');
                    break;
                case 'connection':
                    $('#remotePeerId').closest('tr').attr('id', 'remotePeer' + info.peerId);
                    $('#remotePeerId').parent().text(info.peerId);
                    $('#connectToPeer').attr('disabled', 'disabled');
                    $('#connectToPeer').text('Connected');
                    break;
                case 'remoteUserName': 
                    $('#remotePeer' + info.peerId + ' .userName').text(info.userName);
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