requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '/assets/javascripts',
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
    	jquery: '//code.jquery.com/jquery-1.11.0.min',
        bootstrap: '//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min',
        peer: '//cdn.peerjs.com/0.3/peer.min',
        react: '//fb.me/react-0.11.1',
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
requirejs(['jquery', 'react', 'peer', 'cards', 'bootstrap', 'playingCards', 'playingCards.ui', 'cardActions', 'workerCheck', 'underscore'],
function($, react, peer, cards, bootstrap, playingCards, playingCardsUI, cardActions, peerActions) {
    // var p = peerActions.startPeer();
    // setTimeout(function() { p.destroy(); }, 5000);
});