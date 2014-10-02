define(['jquery', 'gameController', 'jsx!components/commentBox'], 
function($,        gameController,   reactComponents) {

    // UI triggered events
    $('#startSession').click(function() {
        var userName = $('#userName').val();
        gameController.startSession(userName);
    });
    $('#connectedPlayers').on('click', 'button.connectToPeer', function() {
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
    $('#startGame').click(function() {
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
        renderGame: function() {
            var table = {  players: [1,2,3,4,5,6,7,8,9] };
            for (p = 0; p < table.players.length; p++) {
                reactComponents.renderCB(document);
            }/*
            var CommentBox = React.createClass({displayName: 'CommentBox',
              render: function() {
                return (
                  React.DOM.div({className: "commentBox"},
                    "Hello, world! I am a CommentBox."
                  )
                );
              }
            });
            for (p = 0; p < table.players.length; p++) {
                React.renderComponent(
                  CommentBox(null),
                  document.getElementById('testReact')
                );
            }*/
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
                    $('#userPeerId').text(info.id);
                    $('#startSession').attr('disabled', 'disabled');
                    var name = $('#userName').val();
                    $('#userName').attr('disabled', 'disabled');
                    $('#startSession').text('Session Started');
                    $('#playerList').append(newPeerRow);
                    break;
                case 'connection':
                    $('#remotePeerId').closest('tr').attr('id', 'remotePeer' + info.peerId);
                    $('#remotePeerId').parent().text(info.peerId);
                    var thisConnectButon = $('.connectToPeer');
                    thisConnectButon.attr('disabled', 'disabled');
                    thisConnectButon.text('Connected');
                    thisConnectButon.removeClass('connectToPeer');
                    thisConnectButon.closest('tr').after(newPeerRow);
                    $('#startGame').removeAttr('disabled');
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