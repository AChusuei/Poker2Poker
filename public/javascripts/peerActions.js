define(['peer'], function(peer) {

	var peer;
	var connections = {};
	// var connection;
	var cc = '';
	// this.resolvePlayerAction = null;
	var gameUI;

	var startSession = function(gui) {
	    peer = new Peer({key: '78u36fbxn6f7p66r'});
	    gameUI = gui;
		peer.on('open', function(id) {
			console.log('My peer ID is: ' + id);
			gameUI.signal('open', {id: id});
		});
		peer.on('connection', function(remoteConnection) {
			// when remote wants to connect to us...
	    	console.log('Remote peer ' + remoteConnection.peer + ' asked for connection');
	    	initializeConnection(remoteConnection);
	    	gameUI.signal('connection', { peerId : remoteConnection.peer }); // todo: signal more than one connection 
		});
		peer.on('close', function() {
	    	console.log('peer ' + this.id + ' was closed.');
	    	gameUI.signal('close', { peerId : this.id });
		});
	};

	var connectToPeer = function(peerId) {
		// when we want to connect to peer ... 
		initializeConnection(peer.connect(peerId));

		// alert console that we've connected to remote peer.
        console.log('We connected to peer ' + connections[peerId].peer);
        gameUI.signal('connection', { peerId : connections[peerId].peer }); // todo: signal more than one connection 
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
		cc = c.peer;
		connections[cc] = c;
		// peerSession.connections[c.peer] = c;
	};

	var sendMessage = function(peerId, data) {
		// peerSession.connections[peerId].send(data);
		connections[cc].send(data);
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