define(function() {

	var gameUI;
	var poker;
	var peerActions;
	var resolveRemotePlayerAction;
	var userName;
	var table;

	var startSession = function(u) {
		userName = u;
		peerActions.startSession(this);
	};

	var promptPlayerAction = function(player, options, callBack) {
		resolveRemotePlayerAction = {
            remotePeerId: player.peerId,
            callBack: callBack, 
        };
		if (player.peerId) {
	        promptRemotePlayerAction(player.peerId, options, callBack);
		} else {
			gameUI.promptPlayerAction(options);
		}
	};

	var submitPlayerAction = function(action, amount) {
        var data = { action: action, amount: amount };
        if (resolveRemotePlayerAction.remotePeerId) {
            conveyRemotePlayerAction(resolveRemotePlayerAction.remotePeerId, data);                 
        } else {
            resolveRemotePlayerAction.callBack(data);
        };
    };

	var routeRemoteMessage = function(peerId, json) {
		switch (json.type) {
			case MessageType.PlayerActionRequest:
				resolveRemotePlayerAction = {
		            remotePeerId: peerId,
		        };
				gameUI.promptPlayerAction(json.data.options);
				break;
			case MessageType.PlayerActionResponse: 
				resolveRemotePlayerAction.callBack(json.data.response);
				break;
			case MessageType.PlayerInformationRequest: 
				sendUserName(peerId);
				break;
			case MessageType.PlayerInformationResponse: 
				signalGameUI('remoteUserName', { peerId: peerId, userName: json.data.userName });
				break;
		}
	};

	var getUserName = function(peerId) {
		peerActions.sendMessage(peerId, {
			type: MessageType.PlayerInformationRequest,
		});
	}

	var sendUserName = function(peerId) {
		peerActions.sendMessage(peerId, {
			type: MessageType.PlayerInformationResponse,
			data: { userName: userName },
		});
	}

	var promptRemotePlayerAction = function(peerId, options, callBack) {
		peerActions.sendMessage(peerId, {
			type: MessageType.PlayerActionRequest,
			data: { options: options },
		});
	};

	var conveyRemotePlayerAction = function(peerId, response) {
		peerActions.sendMessage(peerId, { 
			type: MessageType.PlayerActionResponse, 
			data: { response : response },  
		});
	};

	var connectToPeer = function(remotePeerId) {
		peerActions.connectToPeer(remotePeerId);
	}

	var startTournamentGame = function() {
		// var players = [];
  //       var levels = [
  //           { smallBlind: 15, bigBlind: 30, ante: 1, min: 10 },
  //           { smallBlind: 20, bigBlind: 40, ante: 2, min: 10 },
  //           { smallBlind: 25, bigBlind: 50, ante: 3, min: 10 }
  //       ];
  //       var connections = peerActions.getAllConnections();
  //       for (var c = 0; c < connections.length; c++) {
  //           var player = poker.createRemotePlayer(connections[c]);
  //           players.push(player);
  //       }
  //       players.push(poker.createLocalPlayer('Alan Chusuei'));
  //       // Remove connection dashboard.
  //       table = poker.startTournamentGame(players, 5000, levels, this);
  //       // Add new section putting in player dashboard
        gameUI.renderGame(table);
	};

	var signalGameUI = function(action, info) {
		gameUI.signal(action, info);
	}

	var MessageType = {
		PlayerInformationRequest: 'requestPlayerInformation',
		PlayerInformationResponse: 'receivePlayerInformation',
		PlayerActionRequest: 'requestPlayerAction',
		PlayerActionResponse: 'receivePlayerAction',
	};

	return {
		initialize: function(g, p, s) {
			gameUI = g;
			poker = p;
			peerActions = s;
		},
		startSession: startSession,
		signalGameUI: signalGameUI,
		promptPlayerAction: promptPlayerAction,
		submitPlayerAction: submitPlayerAction,
		startTournamentGame: startTournamentGame,
		routeRemoteMessage: routeRemoteMessage,
		connectToPeer: connectToPeer,
		getUserName: getUserName,
	};

});