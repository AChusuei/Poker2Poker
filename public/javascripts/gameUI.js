define(['jquery', 'gameController', 'jsx!components'], 
function($,        gameController,   reactComponents) {

    // UI triggered events
    $('#startSession').click(function() {
        // var userName = $('#userName').val();
        // gameController.startSession(userName);
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

    return {
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
        renderGame: function() {
            reactComponents.renderPokerPlayerTable();
        },
        signal: function(action, info) {
            var newPeerRow = '<tr> \
                                    <td><input type="text" id="remotePeerId" class="form-control form-control-inline"/></td> \
                                    <td class="userName"></td> \
                                    <td> \
                                        <button type="button" class="btn btn-success connectToPeer">Connect</button> \
                                    </td> \
                                </tr> \
                              ';
            switch (action) {
                case 'open': 
                    // $('#userPeerId').text(info.id);
                    // $('#startSession').attr('disabled', 'disabled');
                    // var name = $('#userName').val();
                    // $('#userName').attr('disabled', 'disabled');
                    // $('#startSession').text('Session Started');
                    // connectedPlayerTable = reactComponents.renderConnectedPlayerTable();
                    // $('#connectedPlayerList').append(newPeerRow);
                    break;
                case 'connection':
                    // connectedPlayerTable.setState(info);
                    // $('#remotePeerId').closest('tr').attr('id', 'remotePeer' + info.peerId);
                    // $('#remotePeerId').parent().text(info.peerId);
                    // var thisConnectButon = $('.connectToPeer');
                    // thisConnectButon.attr('disabled', 'disabled');
                    // thisConnectButon.text('Connected');
                    // thisConnectButon.removeClass('connectToPeer');
                    // thisConnectButon.closest('tr').after(newPeerRow);
                    // $('#startGame').removeAttr('disabled');
                    break;
                case 'remoteUserName': 
                    // $('#remotePeer' + info.peerId + ' .userName').text(info.userName);
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