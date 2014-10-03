define(['React', 'underscore'], 
function(React) {

    var PokerPlayerTable = React.createClass({
        render: function() {
            var rows = [];
            _.each(this.props.players, function(player) {
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
                        <Card card={this.props.player.cards[0]} />
                        <Card card={this.props.player.cards[1]} />
                    </td>
                    <td className="stack">{this.props.player.stack}</td>
                    <td className="liveBet">0</td>
                    <Status action={this.props.player.action} />
                </tr>
            );  
        }
    });

    var Card = React.createClass({
        render: function() {
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
            return (
                <span className={color}>{this.props.card.rank} {symbol} </span>
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

    var PLAYERS = [
        { peerId: '41t73odr7fuvj9k9', name: 'Linda Chusuei', stack: 26000,    button: false, cards: [{ rank: 'A', suit: 'H' }, { rank: 'K', suit: 'S' }], action: 'Check' }, 
        { peerId: '523vasdfhsdf24ts', name: 'Mary Rose Cook', stack: 25000,   button: false, cards: [{ rank: 'J', suit: 'S' }, { rank: 'T', suit: 'C' }], action: 'Raise' },
        { peerId: '121246234bzds32d', name: 'Max McCrea', stack: 5000,        button: false, cards: [{ rank: '7', suit: 'D' }, { rank: 'Q', suit: 'C' }], action: 'Fold' },
        { peerId: 'vjklt5wuhivhd7vi', name: 'Alan O\'Donnell', stack: 14000,  button: false, cards: [{ rank: '5', suit: 'D' }, { rank: '5', suit: 'C' }], action: 'Call' },
        { peerId: 'vhckiv68v7w7mn29', name: 'Alan Chusuei', stack: 8000,      button: false, cards: [{ rank: 'J', suit: 'H' }, { rank: '6', suit: 'S' }], action: 'All In' },
        { peerId: '23453asdy34uaww4', name: 'Liuda Nikolaeva', stack: 800,    button: false, cards: [{ rank: 'K', suit: 'C' }, { rank: 'K', suit: 'D' }], action: 'Action' },
        { peerId: 'bngmphajpgiaiogf', name: 'Phil Ivey', stack: 250000,       button: false, cards: [{ rank: '8', suit: 'D',}, { rank: '9', suit: 'D' }], action: 'Muck Hand' },
        { peerId: 'apgahgaphg23asdf', name: 'Annette Obrestad', stack: 97000, button: true,  cards: [{ rank: '2', suit: 'C' }, { rank: '3', suit: 'D' }], action: 'Fold' },
    ];

    var renderPokerPlayerTable = function(parent) {
        React.renderComponent(<PokerPlayerTable players={PLAYERS}/>, document.getElementById('gamePlayers'));
    }

    return {
        renderPokerPlayerTable: renderPokerPlayerTable,
    }
});