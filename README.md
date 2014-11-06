Texas Hold'Em Poker P2P Game
=========

A P2P Poker application that is designed to work without a central server. 

Well, _almost_ without a central server. Since we're using WebRTC, we still need a signaling server to bootstrap the connection between two peers. But once that's done, all of the data is run completely between peers, without any server needing to broker information!

Poker2poker is set up as a node application. To get it working:

1. Install node on your machine.
2. In the poker2poker directory, run `npm install` to install node modules. 
3. In the same directory, run `node server.js` to start the application.

The game should be accessible from http://localhost:8000.

One can also run this just using python. In the `public` directory, run `python -m SimpleHTTPServer` to start the application on port 8000; the game can then be accessed at http://localhost:8000/game.html.

A public demo of the game is available at http://poker2poker.herokuapp.com.
