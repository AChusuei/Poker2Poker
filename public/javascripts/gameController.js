define(['underscore'], function() {

	var gameUI;
	var poker;
	var peerActions;
	var components;
	var resolveRemotePlayerAction;
	var userName;
	var remotePlayerInformation = {};
	var table;

	var startApplication = function() {
		// components.renderSessionStarter();
	}

	var startSession = function(u) {
		userName = u;
		peerActions.startSession(this);
	};

	var getLocalUserName = function() {
		return userName;
	}

	var updateConnectedPlayers = function() {
		components.updateConnectedPlayerTable(getRemotePlayers());
	};

	var promptPlayerAction = function(player, options, callBack) {
		resolveRemotePlayerAction = {
            remotePeerId: player.peerId,
            callBack: callBack, 
        };
		if (player.peerId) {
	        promptRemotePlayerAction(player.peerId, options);
		} else {
			updateInterface(options);
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
				setRemoteUserInformation(peerId, json);
				break;
			case MessageType.PlayerConnectionRequest:
				connectToPeer(json.data.remotePeerId);
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

	var setRemoteUserInformation = function(peerId, info) {
		remotePlayerInformation[peerId] = info;
		updateConnectedPlayers(peerId);
	} 

	var promptRemotePlayerAction = function(peerId, options) {
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

	var connectToPeer = function(remotePeerId, propagate) {
		peerActions.connectToPeer(remotePeerId, propagate);
	}

	var getRemotePlayers = function() {
		var players = [];
        _.each(peerActions.getAllConnections(), function(connection) {
        	var userName = '';
        	if (connection.peer in remotePlayerInformation) {
        		userName = remotePlayerInformation[connection.peer].data.userName;
        	}
        	players.push(poker.createRemotePlayer(userName, connection.peer));
        });
        return players;
	}

	var initializeTableForTournament = function() {
        var levels = [
            { smallBlind: 15, bigBlind: 30, ante: 1, min: 10 },
            { smallBlind: 20, bigBlind: 40, ante: 2, min: 10 },
            { smallBlind: 25, bigBlind: 50, ante: 3, min: 10 }
        ];
        var players = getRemotePlayers();
        players.push(poker.createLocalPlayer(userName));
        table = poker.initializeTableForTournament(players, 5000, levels, this);
        table.startTournamentGame();
	};

	var signalGameUI = function(action, info) {
		gameUI.signal(action, info);
	}

	var MessageType = {
		PlayerInformationRequest: 'requestPlayerInformation',
		PlayerInformationResponse: 'receivePlayerInformation',
		PlayerActionRequest: 'requestPlayerAction',
		PlayerActionResponse: 'receivePlayerAction',
		PlayerConnectionRequest: 'requestPlayerConnection',
	};

	var updateInterface = function(options) {
		components.renderPokerPlayerTable(table.players);
        components.renderFelt(table, options);
	}

	return {
		initialize: function(g, p, s, c) {
			gameUI = g;
			poker = p;
			peerActions = s;
			components = c;
		},
		startApplication: startApplication,
		startSession: startSession,
		signalGameUI: signalGameUI,
		updateConnectedPlayers: updateConnectedPlayers,
		promptPlayerAction: promptPlayerAction,
		submitPlayerAction: submitPlayerAction,
		initializeTableForTournament: initializeTableForTournament,
		routeRemoteMessage: routeRemoteMessage,
		connectToPeer: connectToPeer,
		getUserName: getUserName,
		getLocalUserName: getLocalUserName,
		updateInterface: updateInterface,
	};

});