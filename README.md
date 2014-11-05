Texas Hold'Em Poker P2P Game
=========

A P2P Poker application that is designed to work without a central server. 

Well almost, since we're using WebRTC, we still need a signaling server to bootstrap two peers to connect to one another. But once that's done, the game is run completely between peers!

To start the game, start up a http server in Python using "python -m SimpleHTTPServer" in the public directory. 
That being said, any http server will do.

The game should be accessible from http://localhost:8000/game.html.
