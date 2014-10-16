define(['React', 'gameController', 'constants', 'underscore'], 
function(React,   gameController,   constants) {

    var connectionDashboard;
    var connectedPlayerTable;
    var felt;
    var pokerTable;
    var PlayerAction = constants.PlayerAction;

    var ConnectionDashboard = React.createClass({
        getInitialState: function() {
            return {
                userPeerId: null,
            };
        },
        hide: function() {
            this.setState({ hide: true });
        },
        startSession: function() {
            var userName = this.refs.userName.getDOMNode().value.trim();
            gameController.startSession(userName);
        }, 
        render: function() {
            if (this.state.hide) return null;
            var disabled = this.state.userPeerId;
            var message = (this.state.userPeerId ? 'Session Started' : 'Start Session'); // disabled={disableStartGameButton}
            return (
                <div className="row" className="col-md-12">
                    <h2><input className="form-control form-control-inline" type="text" id="userName" ref="userName" placeholder="Who are you?" disabled={disabled}/>
                    <button type="button" className="btn btn-success" id="startSession" onClick={this.startSession} disabled={disabled}>{message}</button> -> <span id="userPeerId">{this.state.userPeerId}</span></h2>
                </div>
            );
        }
    });

    var ConnectedPlayerTable = React.createClass({
        getInitialState: function() {
            return {players: []};
        },
        hide: function() {
            this.setState({ hide: true });
        },
        startTournamentGame: function() {
            gameController.initializeTableForTournament();
            hideConnectionDashboard();
            gameController.broadcastGameStart();
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
            gameController.connectToPeer(remotePeerId, true);
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
            var c = (player.name === 'spectator' ? 'slant' : '');
            return (
                <tr>
                    <td className={c}>{player.peerId}</td>
                    <td className={c}>{player.name}</td>
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
            var cards = [];
            if (this.props.player.hand) {
                cards.push(<Card key={'card0'} card={this.props.player.hand[0]} />);
                cards.push(<Card key={'card1'} card={this.props.player.hand[1]} />);
            }
            return (
                <tr>
                    <td className="peerId"><code>{this.props.player.peerId}</code></td>
                    <td className="userName">{this.props.player.name}</td>
                    <td className="button">
                        <DealerButton show={this.props.player.button} />
                    </td>
                    <td className="cards">
                        {cards}
                    </td>
                    <td className="stack">{this.props.player.stack}</td>
                    <td className="liveBet">{this.props.player.liveBet}</td>
                    <Status action={this.props.player.action} hand={this.props.player.handValue}/>
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
            var rank = (this.props.card.rank === 'T' ? '10' : this.props.card.rank);
            return (
                <span className={color}>{rank}{symbol} </span>
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
            var action = this.props.action;
            switch (this.props.action) {
                case PlayerAction.Bet:
                case PlayerAction.Call:
                    buttonType = 'btn-success' 
                    break;
                case PlayerAction.ShowHand:
                    action = 'Shows '
                    buttonType = 'btn-success' 
                    break;
                case PlayerAction.Raise:
                    buttonType = 'btn-info' 
                    break;
                case PlayerAction.Fold:
                case PlayerAction.MuckHand:
                    buttonType = 'btn-danger' 
                    break;
                case PlayerAction.AllIn:
                    buttonType = 'btn-warning' 
                    break;
                case PlayerAction.Check:
                case PlayerAction.YetToAct:
                    buttonType = 'btn-default' 
                    break;
                case PlayerAction.ToAct:
                    buttonType = 'btn-default pulsate' 
                    break;
            };
            // var cx = React.addons.classSet;
            // var classes = cx({
            //     'btn': true,
            //     'btn-xs': true,
            //     buttonType: true
            // });
            var hand = (this.props.hand ? this.props.hand : '');
            var classes = 'btn btn-xs ' + buttonType;
            return(
                <td className="status">
                    <button type="button" className={classes} disabled>{action + hand}</button>
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
                    <UserActions options={this.props.options} liveBet={this.props.player.liveBet}/>
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
        fold: function(e) {
            gameController.submitPlayerAction(PlayerAction.Fold);
        },
        check: function(e) {
            gameController.submitPlayerAction(PlayerAction.Check);
        },
        callBet: function(e) {
            var amount = Number(this.refs.callAmount.getDOMNode().value.trim());
            gameController.submitPlayerAction(PlayerAction.Call, amount);
        },
        bet: function(e) {
            var amount = Number(this.refs.betAmount.getDOMNode().value.trim());
            gameController.submitPlayerAction(PlayerAction.Bet, amount);
        },
        raise: function(e) {
            var amount = Number(this.refs.raiseAmount.getDOMNode().value.trim());
            gameController.submitPlayerAction(PlayerAction.Raise, amount);
        },
        allIn: function(e) {
            gameController.submitPlayerAction(PlayerAction.AllIn);
        },
        muckHand: function(e) {
            gameController.submitPlayerAction(PlayerAction.MuckHand);
        },
        showHand: function(e) {
            gameController.submitPlayerAction(PlayerAction.ShowHand);
        },
        startNextHand: function(e) {
            gameController.submitPlayerAction(PlayerAction.StartNextHand);
        },
        render: function() {
            var elements = [];
            var bigBlind = this.props.options.bigBlind;
            var callBet = this.props.options.callBet;
            var deltaBet = callBet - this.props.liveBet;
            var minimumRaise = this.props.options.minimumRaise;
            var callMessage = deltaBet + ' to call' + (callBet !== deltaBet ? ' (' + callBet + ' total)' : '');
            _.each(this.props.options.actions, function(action) {
                switch (action) {
                    case PlayerAction.Fold:
                        elements.push(<button key="fold" type="button" className="btn btn-danger" onClick={this.fold}>{action}</button>); 
                        break;
                    case PlayerAction.Check:
                        elements.push(<button key="check" type="button" className="btn btn-success" onClick={this.check}>Check</button>);
                        break;
                    case PlayerAction.Call:
                        elements.push(<button key="call" type="button" className="btn btn-success" onClick={this.callBet}>{callMessage}</button>);
                        elements.push(<input key="callAmount" type="hidden" ref="callAmount" value={callBet}/>);
                        break;
                    case PlayerAction.Bet:
                        elements.push(<button key="bet" type="button" className="btn btn-info" onClick={this.bet}>{action}</button>);
                        elements.push(<input key="betAmount" ref="betAmount" className="form-control form-control-inline small-width" min={minimumRaise} defaultValue={minimumRaise} step={bigBlind} type="number"/>);
                        break;
                    case PlayerAction.Raise:
                        elements.push(<button key="raise" type="button" className="btn btn-info" onClick={this.raise}>{action}</button>);
                        elements.push(<input key="raiseAmount" ref="raiseAmount" className="form-control form-control-inline small-width" min={minimumRaise} defaultValue={minimumRaise} step={bigBlind} type="number"/>);
                        break;
                    case PlayerAction.AllIn:
                        elements.push(<button key="allIn" type="button" className="btn btn-warning" onClick={this.allIn}>{action}</button>);
                        break;
                    case PlayerAction.MuckHand:
                        elements.push(<button key="muckHand" type="button" className="btn btn-danger" onClick={this.muckHand}>Muck Hand</button>);
                        break;
                    case PlayerAction.ShowHand:
                        elements.push(<button key="showHand" type="button" className="btn btn-success" onClick={this.showHand}>Show Hand</button>);
                        break;
                    case PlayerAction.StartNextHand:
                        elements.push(<button key="startNextHand" type="button" className="btn btn-success" onClick={this.startNextHand}>Start Next Hand</button>);
                        break;
                }
            }, this);
            return (
                <td>
                    {elements}
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
            _.each(this.props.cards, function(card, index) {
                cards.push(<Card key={'communityCard' + index} card={card} />);
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
            var message = (this.props.pot.awardMessage 
                ? this.props.pot.awardMessage
                : _.map(this.props.pot.players, function(player) { return player.name; }) + ' are contending for this pot'
            );
            return (<h4>Pot: {this.props.pot.amount}{' -> ' + message}</h4>);
        },
    });

    var Pots = React.createClass({
        render: function() {
            if (!this.props.pots || this.props.pots.length === 0) return null;
            var pots = [];
            _.each(this.props.pots, function(pot, index) {
                pots.push(<Pot key={'pot' + index} pot={pot}/>);
            });
            return (
                <div>
                    {pots}
                </div>
            );
        }
    });

    var renderConnectionDashboard = function() {
        connectionDashboard = React.renderComponent(<ConnectionDashboard />, document.getElementById('connectionDashboard'));
    }

    var updateConnectionDashboard = function(peerId) {
        connectionDashboard.setState({ userPeerId: peerId });
        renderConnectedPlayerTable();
    }

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
                blindLevel: table.blinds,
                community: table.communityCards,
                pots: table.pots,
                player: _.find(table.players, function(player) {
                    return player.name === localUserName;
                }),
                options: options
            }
        });
    }

    var hideConnectionDashboard = function() {
        connectedPlayerTable.hide();
        connectionDashboard.hide();
    }

    return {
        renderConnectionDashboard: renderConnectionDashboard,
        updateConnectionDashboard: updateConnectionDashboard,
        hideConnectionDashboard: hideConnectionDashboard,
        renderConnectedPlayerTable: renderConnectedPlayerTable,
        updateConnectedPlayerTable: updateConnectedPlayerTable,
        renderPokerPlayerTable: renderPokerPlayerTable,
        renderFelt: renderFelt,

    }
});