define(['peer'], function(peer) {

	var peer;
	// this.connections = {};
	var connection;
	// this.cc = '';
	// this.resolvePlayerAction = null;
	var gameUI;

	var startSession = function(gui) {
	    peer = new Peer({key: '78u36fbxn6f7p66r'});
	    gameUI = gui;
		peer.on('open', function(id) {
			console.log('My peer ID is: ' + id);
			gameUI.signal('open', {id: id});
		});
		peer.on('connection', function(newConnection) {
			// when remote wants to connect to us...
	    	console.log('Remote peer ' + newConnection.peer + ' asked for connection');
	    	// peerSession.cc = newConnection.peer;
	    	initializeConnection(newConnection);
	    	connection = newConnection;
	    	gameUI.signal('connection', { peerId : newConnection.peer }); // todo: signal more than one connection 
		});
		peer.on('close', function() {
	    	console.log('peer ' + this.id + ' was closed.');
	    	gameUI.signal('close', { peerId : newConnection.peer });
		});
	};

	var connectToPeer = function(peerId) {
		// when we want to connect to peer ... 
		// this.cc = peerId;
		connection = peer.connect(peerId);
		initializeConnection(connection);

		// alert console that we've connected to remote peer.
        console.log('We connected to peer ' + connection.peer);
        gameUI.signal('connection', { peerId : connection.peer }); // todo: signal more than one connection 
	};

	var initializeConnection = function(c) {
		c.on('open', function() { 
			// Receive messages
			c.on('data', function(data) {
				console.log('Received some data from ' + c.peer + ': ' + data);
		  		// this.interpretData(data);
		    	gameUI.signal('data', { data : data });
		    });
		});
		// peerSession.connections[c.peer] = c;
	};

	var sendMessage = function(data) {
		// peerSession.connections[peerId].send(data);
		connection.send(data);
	};
	
	// PeerSession.prototype = {		
	// 	interpretData: function(data) {
	// 		var message = JSON.parse(data);
	// 		switch (message.type) {
	// 			case PeerMessageType.RequestPlayerAction:
	// 				peerSession.gameUI.promptPlayerAction(message);
	// 				break;
	// 			case PeerMessageType.ResponseFromPlayer: 
	// 				peerSession.gameUI.conveyPlayerAction(message); // show in UI
	// 				peerSession.resolvePlayerAction(message);
	// 				break;
	// 		}
	// 	},
	// 	promptPlayerAction: function(options, callBack) {
	// 		peerSession.resolvePlayerAction = callBack;
	// 		peerSession.sendMessage(options);
	// 	},
	// 	conveyPlayerAction: function(action, amount) {
	// 		sendMessage({ 
	// 			type: PeerMessageType.ResponseFromPlayer, 
	// 			action : action, 
	// 			amount: amount 
	// 		});
	// 	},
	// 	stopSession: function() {
	// 		peerSession.peer.destroy();
	// 	},
	// };

	var PeerMessageType = {
		RequestPlayerAction: 'requestPlayerAction',
		ResponseFromPlayer: 'responseFromPlayer',
	};

    return {
    	startSession: startSession,
    	connectToPeer: connectToPeer,
    	sendMessage: sendMessage,
    	// startSession: function(gameUI) { 
    	// 	peerSession = new PeerSession(gameUI);
    	// 	peerSession.startSession();
    	// 	return peerSession; 
    	// },
    	// getSession: function() { return peerSession; },
    	PeerMessageType: PeerMessageType,
    };

});