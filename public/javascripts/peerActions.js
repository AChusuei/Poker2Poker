define(['peer'], function() {

    var startPeer = function() {
        var peer = new Peer({key: '78u36fbxn6f7p66r'});
		peer.on('open', function(id) {
		  console.log('My peer ID is: ' + id);
		});
		peer.on('connection', function(conn) {
	      console.log('My conn info is: ' + conn.metadata); 
		});
		peer.on('close', function() {
          console.log('peer ' + peer.id + ' was closed.');
		});
		return peer;
	};

    return {
        startPeer: startPeer 
    };

});