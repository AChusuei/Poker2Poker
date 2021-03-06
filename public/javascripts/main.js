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
        JSXTransformer: { exports: "JSXTransformer" },
    },
    paths: {
    	jquery: 'https://code.jquery.com/jquery-1.11.0.min',
        bootstrap: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min',
        peer: 'peer',
        React: 'react-with-addons',
        JSXTransformer: 'JSXTransformer-0.11.1',
        jsx: 'jsx',
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
requirejs(['jquery', 'bootstrap', 'poker', 'peerActions', 'gameController', 'jsx!components'],
function($, bootstrap, poker, peerActions, gameController, components) {    
    gameController.initialize(poker, peerActions, components);
    gameController.startApplication();
});