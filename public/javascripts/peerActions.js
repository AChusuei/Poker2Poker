define(['peer'], function(peer) {

	var peer;
	var connections = {};
	var gameController;

	var startSession = function(controller) {
	    gameController = controller;
	    peer = new Peer({key: '78u36fbxn6f7p66r'});
		peer.on('open', function(id) {
			console.log('My peer ID is: ' + id);
			gameController.signalGameUI('open', {id: id});
		});
		peer.on('connection', function(remoteConnection) {
			// when remote wants to connect to us...
	    	console.log('Remote peer ' + remoteConnection.peer + ' asked for connection');
	    	initializeConnection(remoteConnection);
	    	gameController.signalGameUI('connection', { peerId : remoteConnection.peer }); // todo: signal more than one connection 
		});
		peer.on('close', function() {
	    	console.log('peer ' + this.id + ' was closed.');
	    	gameController.signalGameUI('close', { peerId : this.id });
		});
	};

	var connectToPeer = function(peerId) {
		// when we want to connect to peer ... 
		initializeConnection(peer.connect(peerId));

		// alert console that we've connected to remote peer.
        console.log('We connected to peer ' + connections[peerId].peer);
        gameController.signalGameUI('connection', { peerId : connections[peerId].peer }); // todo: signal more than one connection 
	};

	var initializeConnection = function(c) {
		c.on('open', function() { 
			// Receive messages
			c.on('data', function(json) {
				console.log('Received some data from ' + c.peer + ': ' + json);
				gameController.signalGameUI('data', { data : json });
		  		gameController.routeRemoteMessage(c.peer, json);
		    });
		});
		connections[c.peer] = c;
	};

	var sendMessage = function(peerId, data) {
		connections[peerId].send(data);
	};

	var sendMessageToAll = function(data) {
		for (var key in connections) {
		    if (connections.hasOwnProperty(key)) {
		    	connections[key].send(data);
		    }
		}
	};

	var getAllConnections = function(data) {
		var c = [];
		for (var key in connections) {
		    if (connections.hasOwnProperty(key)) {
		    	c.push(connections[key]);
		    }
		}
		return c;
	};

    return {
    	startSession: startSession,
    	connectToPeer: connectToPeer,
    	sendMessage: sendMessage,
    	sendMessageToAll: sendMessageToAll,
    	getAllConnections: getAllConnections,
    	// startSession: function(gameUI) { 
    	// 	peerSession = new PeerSession(gameUI);
    	// 	peerSession.startSession();
    	// 	return peerSession; 
    	// },
    	// getSession: function() { return peerSession; }
    };

});