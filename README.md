Texas Hold'Em Poker P2P Game
=========

A P2P Poker application that is designed to work without a central server. 

Well almost, since we're using WebRTC, we still need a signaling server to bootstrap two peers to connect to one another. But once that's done, the game is run completely between peers!

The application is run in node. To get it working:

1. Install node on your machine.
2. In the poker2poker directory, run `npm install` to install node modules. 
3. In the same directory, run `node server.js` to start the application.

The game should be accessible from http://localhost:8000.

One can also run this just using python. In the `public` directory, run `python -m SimpleHTTPServer` to start the application on port 8000. 

A demo of the game is available at http://poker2poker.herokuapp.com.
