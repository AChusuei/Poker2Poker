Texas Hold'Em Poker P2P Game
=========

A P2P Poker application that is designed to work without a central server. 

Well, _almost_ without a central server. Since we're using WebRTC, we still need a signaling server to bootstrap the connection between two peers. But once that's done, all of the data is run completely between peers, without further need of a third party server to broker information!

Poker2poker is set up as a node application. To get it working:

1. Install node on your machine.
2. In the poker2poker directory, run `npm install` to install node modules. 
3. In the same directory, run `node server.js` to start the application.

The game should be accessible from http://localhost:8000.

One can also run this just using python. In the `public` directory, run `python -m SimpleHTTPServer` to start the application on port 8000; the game can then be accessed at http://localhost:8000/game.html.

A public demo of the game is available at http://poker2poker.herokuapp.com.

To play the game:

1. Start a session, and note the peer ID that comes up. This peer ID identifies you to other players.
2. Have another person (or yourself) start another session on their own, and connect to their peer ID using the table listed, by inputting their peer ID into the open text field, and clicking `Connect`.
3. Repeat for as many players as you want. 
4. Click on `Start Game` to start the game.
