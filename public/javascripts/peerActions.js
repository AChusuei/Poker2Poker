define(['peer'], function(peer) {

	function PeerSession(gameUI) {
		this.session = null;
		this.connections = {};
		this.resolvePlayerAction = null;
		this.gameUI = gameUI;
	};
	PeerSession.prototype = {
		startSession: function() {
	        this.session = new Peer({key: '78u36fbxn6f7p66r'});
			this.session.on('open', function(id) {
  				console.log('My peer ID is: ' + id);
				peerSession.gameUI.signal('open', {id: id});
			});
			this.session.on('connection', function(newConnection) {
				// when remote wants to connect to us...
		    	console.log('Remote peer ' + newConnection.peer + ' asked for connection');
		    	this.initializeConnection(newConnection);
		    	peerSession.gameUI.signal('connection', { peerId : newConnection.peer }); // todo: signal more than one connection 
			});
			this.session.on('close', function() {
	        	console.log('peer ' + this.id + ' was closed.');
	        	peerSession.gameUI.signal('close', { peerId : newConnection.peer });
			});
		},
		connectToPeer: function(peerId) {
			// when we want to connect to peer ... 
			var newConnection = this.session.connect(peerId);
			this.initializeConnection(newConnection);

			// alert console that we've connected to remote peer.
	        console.log('We connected to peer ' + newConnection.peer);
	        peerSession.gameUI.signal('connection', { peerId : newConnection.peer }); // todo: signal more than one connection 
		},
		initializeConnection: function(c) {
			c.on('open', function() { 
				// Receive messages
				c.on('data', function(data) {
					console.log('Received some data from ' + c.peer + ': ' + data);
			  		this.interpretData(data);
			    	// $('#receivedMessage').text(data);
			    });
			});
			this.connections[c.peer] = c;
		},
		interpretData: function(data) {
			var message = JSON.parse(data);
			switch (message.type) {
				case PeerMessageType.RequestPlayerAction:
					peerSession.gameUI.promptPlayerAction(message);
					break;
				case PeerMessageType.ResponseFromPlayer: 
					peerSession.gameUI.conveyPlayerAction(message); // show in UI
					resolvePlayerAction(message);
					break;
			}
		},
		sendMessage: function(peerId, data) {
			connection[peerId].send(data);
		},
		promptPlayerAction: function(options, callBack) {
			this.resolvePlayerAction = callBack;
			this.sendMessage(options);
		},
		conveyPlayerAction: function(action, amount) {
			sendMessage({ 
				type: PeerMessageType.ResponseFromPlayer, 
				action : action, 
				amount: amount 
			});
		},
		stopSession: function() {
			this.session.destroy();
		},
	};

	var PeerMessageType = {
		RequestPlayerAction: 'requestPlayerAction',
		ResponseFromPlayer: 'responseFromPlayer',
	};

	var peerSession = null;

	// return new PeerSession();

    return {
    	startSession: function(gameUI) { 
    		peerSession = new PeerSession(gameUI);
    		peerSession.startSession();
    		return peerSession; 
    	},
    	getSession: function() { return peerSession; },
    	PeerMessageType: PeerMessageType,
    };

});