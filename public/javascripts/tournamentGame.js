if('undefined' === typeof window) {
	importScripts('require.js');
}

require(['moment', 'underscore', 'playingCards'], function() {

		onmessage = function (event) {
			if (event.data == "start") {
				startTournamentGame();
			}
		}

		function startTournamentGame(players, startingStack, blindLevels) {
			var blindStructure = new BlindStructure(startingStack, blindLevels);
			var table = new Table(players);
			do {
				table.blinds = blindStructure.checkBlindLevel();
				table.dealCards(); // must deal cards based on who has chips, before posting blinds.
				table.postBlindsAndAntes();
				table.playRound(); // meat of the game logic.
				table.moveButton();
			} while (!table.findGameWinner());
			return table.findGameWinner();
		}
    }
);