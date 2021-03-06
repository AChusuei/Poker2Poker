define(['constants', 'underscore'], function(constants) {

	var poker;
	var peerActions;
	var components;
	var resolveRemotePlayerAction;
	var userName;
	var remotePlayerInformation = {};
	var table;
	var isHoleCameraSpectator = false;
	var MessageType = constants.MessageType;

	var startApplication = function() {
		components.renderConnectionDashboard();
	}

	var startSession = function(u) {
		userName = u;
		if (userName === 'spectator') {
			isHoleCameraSpectator = true;
		}
		peerActions.startSession(this);
	};

	var getLocalUserName = function() {
		return userName;
	}

	var updateConnectedPlayers = function() {
		components.updateConnectedPlayerTable(getRemotePlayers(true));
	};

	var promptPlayerAction = function(player, options, callBack) {
		resolveRemotePlayerAction = {
            remotePeerId: player.peerId,
            callBack: callBack, 
        };
		if (player.peerId !== peerActions.getPeerId()) { // this player is remote - send message
	        promptRemotePlayerAction(player.peerId, options);
		} else { // this player is local, alter UI
			updateInterface(options);
		}
	};

	var submitPlayerAction = function(action, amount) {
        var data = { action: action, amount: amount };
        if (resolveRemotePlayerAction.remotePeerId !== peerActions.getPeerId()) {
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
				updateInterface(json.data.options);
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
			case MessageType.TableBroadcastRequest:
				table = json.data;
				updateInterface();
				break;
			case MessageType.GameStartBroadcastRequest:
				components.hideConnectionDashboard();
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
			data: { 
				userName: userName,
				isHoleCameraSpectator: isHoleCameraSpectator,
			},
		});
	}

	var setRemoteUserInformation = function(peerId, info) {
		remotePlayerInformation[peerId] = info;
		updateConnectedPlayers();
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
			data: { response: response },  
		});
	};

	var broadcastInterfaceUpdate = function() {
		_.each(peerActions.getAllConnections(), function(connection) {
			connection.send({
				type: MessageType.TableBroadcastRequest, 
				data: sanitizeTableForBroadcast(connection.peer),
			});
		});
	};

	var sanitizeTableForBroadcast = function(peerId) {
		var cleanTable = JSON.parse(JSON.stringify(table));
		var seeCards = false;
		if (peerActions.getPeerId() === peerId) {
			seeCards = isHoleCameraSpectator;
		} else {
			seeCards = remotePlayerInformation[peerId] && remotePlayerInformation[peerId].data.isHoleCameraSpectator;	
		}
		if (!seeCards) {
			_.each(cleanTable.players, function(player) {
				if (player.peerId !== peerId && !player.showHand) {
					player.hand = null;
				}
			});
		}
		return cleanTable;
	}

	var broadcastGameStart = function() {
		peerActions.sendMessageToAll({
			type: MessageType.GameStartBroadcastRequest,
		});
	};

	var connectToPeer = function(remotePeerId, propagate) {
		peerActions.connectToPeer(remotePeerId, propagate);
	}

	var getRemotePlayers = function(includeSpectators) {
		var players = [];
        _.each(peerActions.getAllConnections(), function(connection) {
        	var userName = '';
        	if (connection.peer in remotePlayerInformation) {
        		userName = remotePlayerInformation[connection.peer].data.userName;
        	}
        	if (includeSpectators || (connection.peer in remotePlayerInformation && !remotePlayerInformation[connection.peer].data.isHoleCameraSpectator)) {
        		players.push(poker.createPlayer(userName, connection.peer));
        	}
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
        players.push(poker.createPlayer(userName, peerActions.getPeerId()));
        table = poker.initializeTableForTournament(players, 5000, levels, this);
        table.startTournamentGame();
	};

	var updateConnectionDashboard = function(peerId) {
		components.updateConnectionDashboard(peerId);
	}

	var updateInterface = function(options) {
		var clone = sanitizeTableForBroadcast(peerActions.getPeerId());
		components.renderPokerPlayerTable(clone.players);
        components.renderFelt(clone, options);
	}

	return {
		initialize: function(p, s, c) {
			poker = p;
			peerActions = s;
			components = c;
		},
		startApplication: startApplication,
		startSession: startSession,
		updateConnectedPlayers: updateConnectedPlayers,
		promptPlayerAction: promptPlayerAction,
		submitPlayerAction: submitPlayerAction,
		initializeTableForTournament: initializeTableForTournament,
		routeRemoteMessage: routeRemoteMessage,
		connectToPeer: connectToPeer,
		getUserName: getUserName,
		getLocalUserName: getLocalUserName,
		updateInterface: updateInterface,
		broadcastInterfaceUpdate: broadcastInterfaceUpdate,
		broadcastGameStart: broadcastGameStart,
		updateConnectionDashboard: updateConnectionDashboard,
	};

});