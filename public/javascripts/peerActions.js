define(['peer', 'constants'], function(peer, constants) {

	var peer;
	var connections = {};
	var gameController;
	var MessageType = constants.MessageType;

	var startSession = function(controller) {
	    gameController = controller;
	    peer = new Peer({key: '78u36fbxn6f7p66r'});
		peer.on('open', function(id) {
			console.log('My peer ID is: ' + id);
			gameController.updateConnectionDashboard(id);
		});
		peer.on('connection', function(remoteConnection) {
			// when remote wants to connect to us...
	    	console.log('Remote peer ' + remoteConnection.peer + ' asked for connection');
	    	initializeConnection(remoteConnection);
	    	gameController.updateConnectedPlayers();
		});
		peer.on('close', function() {
	    	console.log('peer ' + this.id + ' was closed.');
		});
	};

	var getPeerId = function() {
		return peer.id;
	}

	var connectToPeer = function(peerId, propagate) {
		// when we want to connect to peer ... 
		initializeConnection(peer.connect(peerId));

		// alert console that we've connected to remote peer.
        console.log('We connected to peer ' + connections[peerId].peer);
        gameController.updateConnectedPlayers();
        // If this is the initiator of the connection, tell others to connect to this peer.
        if (propagate) {
	        var connectionsToNotify = _.filter(connections, function(connection) { return connection.peer != peerId; });
	        if (connectionsToNotify && connectionsToNotify.length !== 0) {
	        	_.each(connectionsToNotify, function(connection) {
	        		connection.send({
						type: MessageType.PlayerConnectionRequest,
						data: { remotePeerId: peerId },
					});	
	        	});
	        }
	    }
	};

	var initializeConnection = function(c) {
		c.on('open', function() { 
			console.log(c.peer + ' is open and ready for transmission.');
			// Receive messages
			c.on('data', function(json) {
				console.log('Received data from ' + c.peer + ': ' + json);
		  		gameController.routeRemoteMessage(c.peer, json);
		    });
		    gameController.getUserName(c.peer);
		});
		connections[c.peer] = c;
	};

	var sendMessage = function(peerId, data) {
		connections[peerId].send(data);
	};

	var sendMessageToAll = function(data) {
		_.each(connections, function(connection) {
			connection.send(data);
		});
	};

	var getAllConnections = function(data) {
		return _.values(connections);
	};

    return {
    	startSession: startSession,
    	getPeerId: getPeerId,
    	connectToPeer: connectToPeer,
    	sendMessage: sendMessage,
    	sendMessageToAll: sendMessageToAll,
    	getAllConnections: getAllConnections,
    };

});