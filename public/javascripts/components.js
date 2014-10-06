define(['React', 'gameController', 'jquery', 'underscore'], 
function(React,   gameController,   $) {

    var connectedPlayerTable;
    var felt;
    var pokerTable;

    var ConnectedPlayerTable = React.createClass({
        getInitialState: function() {
            return {players: []};
        },
        hideTable: function() {
            this.setState({ hide: true });
        },
        startTournamentGame: function() {
            gameController.initializeTableForTournament();
            // this.hideTable();
            // $('#connectionDashboard').hide(); // move session starter to react
            
        },
        render: function() {
            if (this.state.hide) return null;
            var disableStartGameButton = (this.state.players.length === 0);
            return (
                <div>
                    <h2>Connected Players <button type="button" className="btn btn-primary" id="startGame" onClick={this.startTournamentGame} disabled={disableStartGameButton}>Start Game!</button>
                    </h2>
                    <table className="table" id="connectedPlayersTable">
                        <thead>
                          <tr>
                            <th className="col-md-1">Peer Id</th>
                            <th className="col-md-1">Name</th>
                            <th className="col-md-1">Connect</th>
                          </tr>
                        </thead>
                        <ConnectedPlayerList players={this.state.players}/>
                    </table>
                </div>
            );  
        }
    });

    var ConnectedPlayerList = React.createClass({
        connectAndAddPlayer: function(e) {
            var remotePeerId = this.refs.remotePeerId.getDOMNode().value.trim();
            gameController.connectToPeer(remotePeerId);
            this.refs.remotePeerId.getDOMNode().value = '';
        },
        render: function() {
            var connectedPlayers = [];
            _.each(this.props.players, function(player) {
                connectedPlayers.push(<ConnectedPlayer key={player.peerId} player={player} />);
            });
            return (
                <tbody id="connectedPlayerList">
                    {connectedPlayers} 
                    <tr>
                        <td><input type="text" id="remotePeerId" className="form-control form-control-inline" ref="remotePeerId"/></td>
                        <td colSpan="2">
                            <button type="button" className="btn btn-success" onClick={this.connectAndAddPlayer}>Connect</button>
                        </td>
                    </tr>
                </tbody>
            );  
        }
    });

    var ConnectedPlayer = React.createClass({
        render: function() {
            var player = this.props.player;
            return (
                <tr>
                    <td>{player.peerId}</td>
                    <td>{player.name}</td>
                    <td><button type="button" className="btn btn-success btn-xs" disabled="disabled">Connected</button></td>
                </tr> 
            );  
        }
    });

    var PokerPlayerTable = React.createClass({
        getInitialState: function() {
            return {players: []};
        },
        render: function() {
            var rows = [];
            _.each(this.state.players, function(player) {
                if (!player.peerId) {
                    player.peerId = 'you';
                }
                rows.push(<PokerPlayer key={player.peerId} player={player} />);
            });
            return(
                <div>
                    <h2>Players</h2>
                    <table className="table" id="gamePlayerTable">
                        <thead>
                            <tr>
                                <th className="col-md-2">Peer Id</th>
                                <th className="col-md-2">Name</th>
                                <th className="col-md-1">Button</th>
                                <th className="col-md-1">Cards</th>
                                <th className="col-md-1">Stack</th>
                                <th className="col-md-1">Live Bet</th>
                                <th className="col-md-4">Status</th>
                            </tr>
                        </thead>
                        <tbody id="playerList">
                            {rows}
                        </tbody>
                    </table>
                </div>
            );  
        }
    });

    var PokerPlayer = React.createClass({
        render: function() {
            return (
                <tr >
                    <td className="peerId"><code>{this.props.player.peerId}</code></td>
                    <td className="userName">{this.props.player.name}</td>
                    <td className="button">
                        <DealerButton show={this.props.player.button} />
                    </td>
                    <td className="cards">
                        <Card card={this.props.player.hand[0]} />
                        <Card card={this.props.player.hand[1]} />
                    </td>
                    <td className="stack">{this.props.player.stack}</td>
                    <td className="liveBet">{this.props.player.liveBet}</td>
                    <Status action={this.props.player.action} />
                </tr>
            );  
        }
    });

    var Card = React.createClass({
        render: function() {
            if (!this.props.card) return null;
            var symbol;
            switch (this.props.card.suit) {
                case 'Spades':
                case 'S':
                case '♠':
                    symbol = '♠';
                    color = 'blacksuit';
                    break;
                case 'Clubs':
                case 'C':
                case '♣':
                    symbol = '♣';
                    color = 'blacksuit';
                    break;
                case 'Diamonds':
                case 'D':
                case '♦':
                    symbol = '♦';
                    color = 'redsuit';
                    break;
                case 'Hearts':
                case 'H':
                case '♥':
                    symbol = '♥';
                    color = 'redsuit';
                    break;
            };
            if (this.props.large) {
                color += ' h2';
            }
            return (
                <span className={color}>{this.props.card.rank}{symbol} </span>
            );
        }
    });

    var DealerButton = React.createClass({
        render: function() {
            if (this.props.show) {
                return (
                    <span className="glyphicon glyphicon-record"></span>
                );
            } else {
                return null;
            }
        }
    });

    var Status = React.createClass({
        render: function() {
            var buttonType;
            switch (this.props.action) {
                case 'Check':
                case 'Bet':
                case 'Call':
                case 'Win Hand':
                    buttonType = 'btn-success' 
                    break;
                case 'Raise':
                    buttonType = 'btn-info' 
                    break;
                case 'Fold':
                case 'Muck Hand':
                    buttonType = 'btn-danger' 
                    break;
                case 'All In':
                    buttonType = 'btn-warning' 
                    break;
                case 'Action':
                case 'Waiting To Act':
                    buttonType = 'btn-default' 
                    break;
            };
            // var cx = React.addons.classSet;
            // var classes = cx({
            //     'btn': true,
            //     'btn-xs': true,
            //     buttonType: true
            // });
            var classes = 'btn btn-xs ' + buttonType;
            return(
                <td className="status">
                    <button type="button" className={classes} disabled>{this.props.action}</button>
                </td>
            );  
        }
    });

    var Felt = React.createClass({
        getInitialState: function() {
            return {felt: null};
        },
        render: function() {
            if (!this.state.felt) return null;
            return (
                <div>
                    <h2>
                        <Blinds level={this.state.felt.blindLevel} /> | <CommunityCards cards={this.state.felt.community} />
                    </h2>
                    <Pots pots={this.state.felt.pots} />
                    <UserInterface player={this.state.felt.player} options={this.state.felt.options}/>
                </div>
            );  
        }
    });

    var UserInterface = React.createClass({
        // getInitialState: function() {
        //     return {felt: null};
        // },
        render: function() {
            if (!this.props.player) return null;
            var options;
            if (this.props.options) {
                options = (
                    <UserActions options={this.props.options} />
                );
            }
            return (
                <table className="table" id="userInfoTable">
                    <thead>
                      <tr>
                        <th className="col-md-2"><span className="h3">Cards</span></th>
                        <th className="col-md-1"><span className="h3">Stack</span></th>
                        <th className="col-md-2"><span className="h3">Status</span></th>
                        <th className="col-md-9"><span className="h3">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr id="userInfo">
                            <td id="userCards">
                                <Card card={this.props.player.hand[0]} large="true" /> <Card card={this.props.player.hand[1]} large="true"/>
                            </td>
                            <td><span className="h2">{this.props.player.stack}</span></td>
                            <td><span className="h2">{this.props.player.action}</span></td>
                            {options}
                        </tr>
                    </tbody>
                </table>
            );  
        }
    });

    var UserActions = React.createClass({
        render: function() {
            var buttons = [];
            var callBet = this.props.options.callBet;
            var minimumRaise = this.props.options.minimumRaise;
            _.each(this.props.options.actions, function(action) {
                switch (action) {
                    case 'Fold':
                        buttons.push(<button type="button" className="btn btn-danger">{action}</button>); 
                        break;
                    case 'Check':
                        buttons.push(<button type="button" className="btn btn-success">Check</button>);
                    case 'Call':
                        buttons.push(<button type="button" className="btn btn-success">{callBet} to Call</button>);
                        break;
                    case 'Bet':
                    case 'Raise':
                        buttons.push(<button type="button" className="btn btn-info">{action}</button>);
                        buttons.push(<input className="form-control form-control-inline small-width" min={minimumRaise} placeHolder={minimumRaise} type="number"/>);
                        break;
                    case 'All-In':
                        buttons.push(<button type="button" className="btn btn-warning">{action}</button>);
                        break;
                }
            });
            return (
                <td>
                    {buttons}
                </td>
            );
        }
    });

    var Blinds = React.createClass({
        render: function() {
            var isAnte = (this.props.level.ante && this.props.level.ante !== 0);
            var blinds = 'Blinds' + (isAnte ? '/Ante' : '') + ': ' + this.props.level.smallBlind + '/' + this.props.level.bigBlind + (isAnte ? '/' + this.props.level.ante : '');
            return (
                <span>{blinds}</span>
            );  
        }
    });

    var CommunityCards = React.createClass({
        render: function() {
            if (!this.props.cards || this.props.cards.length === 0) return null;
            var cards = [];
            _.each(this.props.cards, function(card) {
                cards.push(<Card card={card} />);
            });
            return (
                <span>Community: 
                    <span> {cards}</span>
                </span>
            );
        }
    });

    var Pot = React.createClass({
        render: function() {
            return (<h4>Pot: {this.props.amount} ({_.keys(this.props.players)})</h4>);
        },
    });

    var Pots = React.createClass({
        render: function() {
            if (!this.props.pots || this.props.pots.length === 0) return null;
            var pots = [];
            _.each(this.props.pots, function(pot, index) {
                pots.push(<Pot key={'pot' + index} amount={pot.amount} players={pot.players}/>);
            });
            return (
                <div>
                    {pots}
                </div>
            );
        }
    });

    var renderConnectedPlayerTable = function() {
        connectedPlayerTable = React.renderComponent(<ConnectedPlayerTable players={[]}/>, document.getElementById('connectedPlayers'));
    }

    var updateConnectedPlayerTable = function(players) {
        var ft = _.map(players, function(player) {
            return { peerId: player.peerId, name: player.name };
        });
        connectedPlayerTable.setState({ players: ft });
    }

    var renderPokerPlayerTable = function(players) {
        pokerTable = React.renderComponent(<PokerPlayerTable players={[]}/>, document.getElementById('gamePlayers'));
        pokerTable.setState({ players: players }); 
    }

    var renderFelt = function(table, options) {
        felt = React.renderComponent(<Felt players={[]}/>, document.getElementById('felt'));
        var localUserName = gameController.getLocalUserName();
        felt.setState({ 
            felt: {
                blindLevel: table.blindStructure.getBlindLevel(),
                community: table.communityCards,
                pots: table.pots,
                player: _.find(table.players, function(player) {
                    return player.name === localUserName;
                }),
                options: options
            }
        });
    }

    var FELT = {
        // blindLevel: { smallBlind: 15, bigBlind: 30, ante: 1, min: 10 },
        // community: [{ rank: '5', suit: 'H' }, { rank: '8', suit: 'S' }, { rank: '9', suit: 'D' }, { rank: 'T', suit: 'C' }, { rank: '8', suit: 'D' }],
        // pots: [
        //     { amount: 500, players: { 'Linda Chusuei': true, 'Mary Rose Cook': true, 'Max McCrea': true, 'Christina Park': true }},
        //     { amount: 250, players: { 'Linda Chusuei': true, 'Mary Rose Cook': true, 'Christina Park': true }},
        //     { amount: 50, players: { 'Linda Chusuei': true, 'Mary Rose Cook': true}},
        // ]
    }

    var PLAYERS = [
        { peerId: '41t73odr7fuvj9k9', name: 'Linda Chusuei', stack: 26000,    button: false, cards: [{ rank: 'A', suit: 'H' }, { rank: 'K', suit: 'S' }], action: 'Check' }, 
        { peerId: '523vasdfhsdf24ts', name: 'Mary Rose Cook', stack: 25000,   button: false, cards: [{ rank: 'J', suit: 'S' }, { rank: 'T', suit: 'C' }], action: 'Raise' },
        { peerId: '121246234bzds32d', name: 'Max McCrea', stack: 5000,        button: false, cards: [{ rank: '7', suit: 'D' }, { rank: 'Q', suit: 'C' }], action: 'Fold' },
        // { peerId: 'vjklt5wuhivhd7vi', name: 'Alan O\'Donnell', stack: 14000,  button: false, cards: [{ rank: '5', suit: 'D' }, { rank: '5', suit: 'C' }], action: 'Call' },
        // { peerId: 'vhckiv68v7w7mn29', name: 'Alan Chusuei', stack: 8000,      button: false, cards: [{ rank: 'J', suit: 'H' }, { rank: '6', suit: 'S' }], action: 'All In' },
        // { peerId: '23453asdy34uaww4', name: 'Liuda Nikolaeva', stack: 800,    button: false, cards: [{ rank: 'K', suit: 'C' }, { rank: 'K', suit: 'D' }], action: 'Action' },
        // { peerId: 'bngmphajpgiaiogf', name: 'Phil Ivey', stack: 250000,       button: false, cards: [{ rank: '8', suit: 'D',}, { rank: '9', suit: 'D' }], action: 'Muck Hand' },
        // { peerId: 'apgahgaphg23asdf', name: 'Annette Obrestad', stack: 97000, button: true,  cards: [{ rank: '2', suit: 'C' }, { rank: '3', suit: 'D' }], action: 'Fold' },
    ];

    return {
        renderConnectedPlayerTable: renderConnectedPlayerTable,
        updateConnectedPlayerTable: updateConnectedPlayerTable,
        renderPokerPlayerTable: renderPokerPlayerTable,
        renderFelt: renderFelt,
    }
});