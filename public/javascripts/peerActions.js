define(['peer'], function() {

	var session;

	var connection;

    var startPeer = function() {
        session = new Peer({key: '78u36fbxn6f7p66r'});
		session.on('open', function(id) {
		  console.log('My peer ID is: ' + id);
		  $('#peerId').text(id);
		});
		session.on('connection', function(conn) {
	      console.log('Remote peer ' + conn.peer + ' asked for connection');
	      $('#connectedRemotePeerId').text(conn.peer);
	      connection = conn;
	      initializeConnection(connection);
		});
		session.on('close', function() {
          console.log('peer ' + this.id + ' was closed.');
          $('#peerId').text('disconnected');
		});
	};

	var connectToPeer = function(peerId) {
		connection = session.connect(peerId);
		initializeConnection(connection);

		// alert console that we've connected to remote peer.
        console.log('We connected to peer ' + connection.peer);
        $('#connectedRemotePeerId').text(connection.peer);
	}

	var initializeConnection = function(c) {
		c.on('open', function() { 
		  // Receive messages
		  c.on('data', function(data) {
		  	// var json = JSON.parse(data);
		    console.log('Received', data);
		    $('#receivedMessage').text(data);
		  });
		});
	}

	var sendMessage = function(data) {
		connection.send(data);
	}

	var stopPeer = function() {
		session.destroy();
	}

    return {
        startPeer: startPeer,
        connectToPeer: connectToPeer,
        stopPeer: stopPeer,
        sendMessage: sendMessage,
    };

});