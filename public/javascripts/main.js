requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'javascripts',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    shim : {
        "bootstrap" : { "deps" : ['jquery'] },
        "playingCards.ui" : { "deps" : ['playingCards'] },
        "jCanvas" : { "deps" : ['jquery'] },
        "cards" : { "deps" : ['jquery','jCanvas'] },
    },
    paths: {
    	jquery: 'http://code.jquery.com/jquery-1.11.0.min',
        bootstrap: 'http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min',
        peer: 'http://cdn.peerjs.com/0.3/peer.min',
        react: 'http://fb.me/react-0.11.1',
        jCanvas: 'jCanvas',
        cards: 'jCanvasCards'
    },
    config: {
        moment: {
            noGlobal: true
        }
    }
});

// Start the main app logic.
requirejs(['jquery', 'react', 'bootstrap', 'poker', 'peerActions'],
function($, react, bootstrap, poker, peerActions) {
    $(document).ready(function() {
        $('#startGame').click(function() {
            peerActions.startPeer();
            console.log('STARTING GAME!');
        });
        $('#connectToPeer').click(function() {
            var remotePeerId = $('#remotePeerId').text;
            peerActions.connectToPeer(remotePeerId);
            console.log('connecting to peer id ' + remotePeerId);
        });
        $('#endGame').click(function() {
            peerActions.stopPeer();
            console.log('ENDING GAME!');
        });

        console.log('game is ready to go!');
    });

    
    // setTimeout(function() { p.destroy(); }, 5000);
});