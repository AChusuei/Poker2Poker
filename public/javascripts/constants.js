define(function() {

	return {
		MessageType: {
			PlayerInformationRequest: 'requestPlayerInformation',
			PlayerInformationResponse: 'receivePlayerInformation',
			PlayerActionRequest: 'requestPlayerAction',
			PlayerActionResponse: 'receivePlayerAction',
			PlayerConnectionRequest: 'requestPlayerConnection',
			TableBroadcastRequest: 'tableBroadcastRequest',
			GameStartBroadcastRequest: 'gameStartBroadcastRequest',
		},
		PlayerAction: {
			YetToAct: 'YetToAct', // Player has yet to make an action for this round.
			ToAct: 'ToAct', // Player has been prompted to make an action.
			PostAnte: 'PostAnte', // Player has posted an ante.
			PostBlind: 'PostBlind', // Player has posted a blind.
			Check: 'Check', // Player passes at making a bet.
			Fold: 'Fold', // Player gives up or refuses to call the highest bet.
			Bet: 'Bet', // Player makes the first bet of the round. 
			Call: 'Call', // Player calls high bet, and has chips left.
			Raise: 'Raise', // Player makes at least a minimum raise, and has chips still left.
			AllIn: 'All-In', // Player pushes rest of their chips (regardless of bet, call, or raise)
		},
	};

});