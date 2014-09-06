requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '/assets/javascripts',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        bootstrap: 'bootstrap/js'
    }
});

// Start the main app logic.
requirejs(['jquery', 'peer', 'bootstrap/bootstrap', 'playingCards', 'playingCards.ui', 'cardActions'],
function   ($, peer, bootstrap, playingCards, playingCards, cardActions) {
    //jQuery, canvas and the app/sub module are all
    //loaded and can be used here now.
});