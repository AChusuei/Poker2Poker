define(['peer'], function() {

	var peer;

    var startPeer = function() {
        peer = new Peer({key: '78u36fbxn6f7p66r'});
		peer.on('open', function(id) {
		  console.log('My peer ID is: ' + id);
		  $('#peerId').text(id);
		});
		peer.on('connection', function(conn) {
	      console.log('My conn info is: ' + conn.metadata);
	      $('#connInfo').text(conn.metadata);
		});
		peer.on('close', function() {
          console.log('peer ' + this.id + ' was closed.');
          $('#peerId').text('disconnected');
		});
	};

	var stopPeer = function() {
		peer.destroy();
	}

    return {
        startPeer: startPeer,
        stopPeer: stopPeer,
    };

});