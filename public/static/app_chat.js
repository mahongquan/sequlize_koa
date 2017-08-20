/* eslint-disable no-undef */
//import queryString from 'query-string';
function getRaw(url,cb) {
  var method="GET";
  return fetch(url,
  {
      method: method,
      credentials: 'include',
      headers: {'Content-Type':'application/json'},
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}
function get(url,data,cb) {
  var method="GET";
  url=url+"?"+queryString.stringify(data)
  return fetch(url,
  {
      method: method,
      credentials: 'include',
      headers: {'Content-Type':'application/json'},
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}
function delete1(url,data,cb) {
  var method="DELETE";
  return fetch(url,
  {
      method: method,
      credentials: 'include',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}
function post(url,data,cb) {
  var method="POST"
  return fetch(url,
  {
      method: method,
      credentials: 'include',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}
function postOrPut(url,data,cb) {
  var method="POST"
  if (data.id){
    method="PUT"
  }
  return fetch(url,
  {
      method: method,
      credentials: 'include',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}
function postForm(url,data,cb) {
  var method="POST"
  return fetch(url,
  {
      method: method,
      credentials: 'include',
      body: data
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  console.log(error); // eslint-disable-line no-console
  throw error;
}

function parseJSON(response) {
  console.log("parse");
  console.log(response.body);
  var r= response.json();
  return r;
}
//var namespace = '/test';

// Connect to the Socket.IO server.
// The connection URL has the following format:
//     http[s]://<domain>:<port>[/<namespace>]
var socket = io.connect();//location.protocol + '//' + document.domain + ':' + location.port + namespace);

/**
 * The table controller. It keeps track of the data on the interface,
 * depending on the replies from the server.
 */
class  Table extends React.Component{
    constructor(){
        super();
//function( this.state, $rootScope, $http, $routeParams, $timeout, sounds ) {
        var seat = null;
        this.state={
            table : {dealerSeat: null},
            notifications : [{},{},{},{},{},{},{},{},{},{}],
            showingChipsModal:"none",
            actionState : '',
            myCards : ['', ''],
            mySeat : null,
            betAmount : 0,
            //$rootScope.sittingOnTable = null;
            sittingOnTable:null,
            buyInModalVisible:"none",
        }
    }
    //var showingNotification = false;
    componentDidMount() {
        // Existing listeners should be removed
        socket.removeAllListeners();

        // Getting the table data
        getRaw('/table-data/' + this.props.tableId,
            ( data)=>{
            console.log("table-data");
            console.log(data);
            this.setState({table:data.table});
            this.setState({buyInAmount : data.table.maxBuyIn});
            this.setState({betAmount : data.table.bigBlind});
        });

        // Joining the socket room
        socket.emit( 'enterRoom', this.props.tableId );
            // When the table data have changed
    socket.on( 'table-data', function( data ) {
        this.state.table = data;
        switch ( data.log.action ) {
            case 'fold':
                sounds.playFoldSound();
                break;
            case 'check':
                sounds.playCheckSound();
                break;
            case 'call':
                sounds.playCallSound();
                break;
            case 'bet':
                sounds.playBetSound();
                break;
            case 'raise':
                sounds.playRaiseSound();
                break;
        }
        if( data.log.message ) {
            var messageBox = document.querySelector('#messages');
            var messageElement = angular.element( '<p class="log-message">' + data.log.message + '</p>' );
            angular.element( messageBox ).append( messageElement );
            messageBox.scrollTop = messageBox.scrollHeight;
            if(data.log.notification && data.log.seat !== '') {
                if(!this.state.notifications[data.log.seat].message) {
                    this.state.notifications[data.log.seat].message = data.log.notification;
                    this.state.notifications[data.log.seat].timeout = $timeout(function() {
                        this.state.notifications[data.log.seat].message = '';
                    }, 1000);
                } else {
                    $timeout.cancel(this.state.notifications[data.log.seat].timeout);
                    this.state.notifications[data.log.seat].message = data.log.notification;
                    this.state.notifications[data.log.seat].timeout = $timeout(function() {
                        this.state.notifications[data.log.seat].message = '';
                    }, 1000);
                }
            }
        }
        this.state.$digest();
    });

    // When the game has stopped
    socket.on( 'gameStopped', function( data ) {
        this.state.table = data;
        this.state.actionState = 'waiting';
        this.state.$digest();
    });

    // When the player is asked to place the small blind
    socket.on( 'postSmallBlind', function( data ) {
        this.state.actionState = 'postSmallBlind';
        this.state.$digest();
    });

    // When the player is asked to place the big blind
    socket.on( 'postBigBlind', function( data ) {
        this.state.actionState = 'postBigBlind';
        this.state.$digest();
    });

    // When the player is dealt cards
    socket.on( 'dealingCards', function( cards ) {
        this.state.myCards[0] = 'card-'+cards[0];
        this.state.myCards[1] = 'card-'+cards[1];
        this.state.$digest();
    });

    // When the user is asked to act and the pot was betted
    socket.on( 'actBettedPot', function() {
        this.state.actionState = 'actBettedPot';

        var proposedBet = +this.state.table.biggestBet + this.state.table.bigBlind;
        this.state.betAmount = this.state.table.seats[this.state.mySeat].chipsInPlay < proposedBet ? this.state.table.seats[this.state.mySeat].chipsInPlay : proposedBet;
        this.state.$digest();
    });

    // When the user is asked to act and the pot was not betted
    socket.on( 'actNotBettedPot', function() {
        this.state.actionState = 'actNotBettedPot';

        this.state.betAmount = this.state.table.seats[this.state.mySeat].chipsInPlay < this.state.table.bigBlind ? this.state.table.seats[this.state.mySeat].chipsInPlay : this.state.table.bigBlind;
        this.state.$digest();
    });

    // When the user is asked to call an all in
    socket.on( 'actOthersAllIn', function() {
        this.state.actionState = 'actOthersAllIn';

        this.state.$digest();
    });
    }
    minBetAmount = ()=> {
        if( this.state.mySeat === null || typeof this.state.table.seats[this.state.mySeat] === 'undefined' || this.state.table.seats[this.state.mySeat] === null ) return 0;
        // If the pot was raised
        if( this.state.actionState === "actBettedPot" ) {
            var proposedBet = +this.state.table.biggestBet + this.state.table.bigBlind;
            return this.state.table.seats[this.state.mySeat].chipsInPlay < proposedBet ? this.state.table.seats[this.state.mySeat].chipsInPlay : proposedBet;
        } else {
            return this.state.table.seats[this.state.mySeat].chipsInPlay < this.state.table.bigBlind ? this.state.table.seats[this.state.mySeat].chipsInPlay : this.state.table.bigBlind;
        }
    }

    maxBetAmount = ()=> {
        if( this.state.mySeat === null || typeof this.state.table.seats[this.state.mySeat] === 'undefined' || this.state.table.seats[this.state.mySeat] === null ) return 0;
        return this.state.actionState === "actBettedPot" ? this.state.table.seats[this.state.mySeat].chipsInPlay + this.state.table.seats[this.state.mySeat].bet : this.state.table.seats[this.state.mySeat].chipsInPlay;
    }

    callAmount = ()=> {
        if( this.state.mySeat === null || typeof this.state.table.seats[this.state.mySeat] === 'undefined' || this.state.table.seats[this.state.mySeat] == null ) return 0;
        var callAmount = +this.state.table.biggestBet - this.state.table.seats[this.state.mySeat].bet;
        return callAmount > this.state.table.seats[this.state.mySeat].chipsInPlay ? this.state.table.seats[this.state.mySeat].chipsInPlay : callAmount;
    }

    showLeaveTableButton =()=> {
        //return $rootScope.sittingOnTable !== null && ( !$rootScope.sittingIn || this.state.actionState === "waiting" );
    }

    showPostSmallBlindButton = () =>{
        return this.state.actionState === "actNotBettedPot" || this.state.actionState === "actBettedPot";
    }

    showPostBigBlindButton = ()=> {
        return this.state.actionState === "actNotBettedPot" || this.state.actionState === "actBettedPot";
    }

    showFoldButton = ()=> {
        return this.state.actionState === "actNotBettedPot" || this.state.actionState === "actBettedPot" || this.state.actionState === "actOthersAllIn";
    }

    showCheckButton = () =>{
        return this.state.actionState === "actNotBettedPot" || ( this.state.actionState === "actBettedPot" && this.state.table.biggestBet == this.state.table.seats[this.state.mySeat].bet );
    }

    showCallButton =()=> {
        return this.state.actionState === "actOthersAllIn" || this.state.actionState === "actBettedPot"  && !( this.state.actionState === "actBettedPot" && this.state.table.biggestBet == this.state.table.seats[this.state.mySeat].bet );
    }

    showBetButton =()=> {
        return this.state.actionState === "actNotBettedPot" && this.state.table.seats[this.state.mySeat].chipsInPlay && this.state.table.biggestBet < this.state.table.seats[this.state.mySeat].chipsInPlay;
    }

    showRaiseButton = ()=> {
        return this.state.actionState === "actBettedPot" && this.state.table.seats[this.state.mySeat].chipsInPlay && this.state.table.biggestBet < this.state.table.seats[this.state.mySeat].chipsInPlay;
    }

    showBetRange = ()=> {
        return (this.state.actionState === "actNotBettedPot" || this.state.actionState === "actBettedPot") && this.state.table.seats[this.state.mySeat].chipsInPlay && this.state.table.biggestBet < this.state.table.seats[this.state.mySeat].chipsInPlay;
    }

    showBetInput = ()=> {
        return (this.state.actionState === "actNotBettedPot" || this.state.actionState === "actBettedPot")  && this.state.table.seats[this.state.mySeat].chipsInPlay && this.state.table.biggestBet < this.state.table.seats[this.state.mySeat].chipsInPlay;
    }

    showBuyInModal =( seat )=> {
        this.state.buyInModalVisible = true;
        selectedSeat = seat;
    }

    potText = ()=> {
        if( typeof this.state.table.pot !== 'undefined' && this.state.table.pot[0].amount ) {
            var potText = 'Pot: ' + this.state.table.pot[0].amount;

            var potCount = this.state.table.pot.length;
            if( potCount > 1 ) {
                for( var i=1 ; i<potCount ; i++ ) {
                    potText += ' - Sidepot: ' + this.state.table.pot[i].amount;
                }
            }
            return potText;
        }
    }

    getCardClass = ( seat, card ) =>{
        if( this.state.mySeat === seat ) {
            return this.state.myCards[card];
        }
        else if ( typeof this.state.table.seats !== 'undefined' && typeof this.state.table.seats[seat] !== 'undefined' && this.state.table.seats[seat] && typeof this.state.table.seats[seat].cards !== 'undefined' && typeof this.state.table.seats[seat].cards[card] !== 'undefined' ) {
            return 'card-' + this.state.table.seats[seat].cards[card];
        }
        else {
            return 'card-back';
        }
    }

    seatOccupied = ( seat ) =>{
        return !$rootScope.sittingOnTable || ( this.state.table.seats !== 'undefined' && typeof this.state.table.seats[seat] !== 'undefined' && this.state.table.seats[seat] && this.state.table.seats[seat].name );
    }

    // Leaving the socket room
    leaveRoom = ()=> {
        socket.emit( 'leaveRoom' );
    };

    // A request to sit on a specific seat on the table
    sitOnTheTable =()=>{
        socket.emit( 'sitOnTheTable', { 'seat': selectedSeat, 'tableId': $routeParams.tableId, 'chips': this.state.buyInAmount }, function( response ) {
            if( response.success ){
                this.state.buyInModalVisible = "none";
                $rootScope.sittingOnTable = $routeParams.tableId;
                $rootScope.sittingIn = true;
                this.state.buyInError = null;
                this.state.mySeat = selectedSeat;
                this.state.actionState = 'waiting';
                this.state.$digest();
            } else {
                if( response.error ) {
                    this.state.buyInError = response.error;
                    this.state.$digest();
                }
            }
        });
    }

    // Sit in the game
    sitIn = ()=> {
        socket.emit( 'sitIn', function( response ) {
            if( response.success ) {
                $rootScope.sittingIn = true;
                $rootScope.$digest();
            }
        });
    }

    // Leave the table (not the room)
    leaveTable = ()=> {
        socket.emit( 'leaveTable', function( response ) {
            if( response.success ) {
                $rootScope.sittingOnTable = null;
                $rootScope.totalChips = response.totalChips;
                $rootScope.sittingIn = false;
                this.state.actionState = '';
                $rootScope.$digest();
                this.state.$digest();
            }
        });
    }

    // Post a blind (or not)
    postBlind = ( posted )=> {
        socket.emit( 'postBlind', posted, function( response ) {
            if( response.success && !posted ) {
                $rootScope.sittingIn = false;
            } else {
                sounds.playBetSound();
            }
            this.state.actionState = '';
            this.state.$digest();
        });
    }

    check =()=> {
        socket.emit( 'check', function( response ) {
            if( response.success ) {
                sounds.playCheckSound();
                this.state.actionState = '';
                this.state.$digest();
            }
        });
    }

    fold =()=> {
        socket.emit( 'fold', function( response ) {
            if( response.success ) {
                sounds.playFoldSound();
                this.state.actionState = '';
                this.state.$digest();
            }
        });
    }

    call = ()=> {
        socket.emit( 'call', function( response ) {
            if( response.success ) {
                sounds.playCallSound();
                this.state.actionState = '';
                this.state.$digest();
            }
        });
    }

    bet = ()=> {
        socket.emit( 'bet', this.state.betAmount, function( response ) {
            if( response.success ) {
                sounds.playBetSound();
                this.state.actionState = '';
                this.state.$digest();
            }
        });
    }

    raise =() =>{
        socket.emit( 'raise', this.state.betAmount, function( response ) {
            if( response.success ) {
                sounds.playRaiseSound();
                this.state.actionState = '';
                this.state.$digest();
            }
        });
    }
    render=()=>{
        var table=this.state.table;
        var buyInError="";
        var potText="";
        var callAmount="";
        var betAmount=6;
        console.log("render table");
        var table_board0_visible="";
        var table_board1_visible="";
        var table_board2_visible="";
        var table_board3_visible="";
        var table_board4_visible="";
        var table_pot0_amount_visible="";
        var sittingOnTableVisible="";
        console.log(this.state.buyInModalVisible);
        return(<div id="table-wrap">
    <div className="modal-wrap" style={{display:this.state.buyInModalVisible}}>
        <div className="modal">
            <form ng-submit="sitOnTheTable()">
                <h1>{table.name}</h1>
                <span className="table-requirements">Max buy-in {table.maxBuyIn}</span>
                <span className="table-requirements">Min buy-in {table.minBuyIn}</span>
                <span className="table-requirements">You have a total of {this.props.totalChips} chips</span>
                <span className="table-requirements error" ng-show="buyInError">{buyInError}</span>
                <input className="input-left" type="number" ng-model="buyInAmount" ng-trim="true" required>
                </input>
                <input type="submit" value="Sit in"></input>
            </form>
        </div>
        <div id="curtain" style={{display:this.state.buyInModalVisible}} 
        onClick={()=>{this.state.buyInModalVisible="none"}}></div>
    </div>
    <div id="table">
        <div id="felt"></div>
    </div>
    <div className="row">
        <div className="cell">
            <a id="to-lobby" className="button" href="/"
            style={{display:sittingOnTableVisible}}
            ng-click="leaveRoom()">Lobby</a>
        </div>
        <div className="cell"></div>
        <div className="cell"></div>
        <div className="cell"></div>
    </div>
    <div className="row">
        <div className="cell">
            <seat player="{table.seats[0]}" 
             active-seat="{table.activeSeat}" 
             dealer-seat="{table.dealerSeat}"
             my-seat="mySeat" my-cards="myCards" 
             sitting-on-table={this.state.sittingOnTable}
             show-buy-in-modal="showBuyInModal(seat)" 
             notifications="notifications" seat-index="0" cell-number="9" 
             className="side"
            >
            </seat>
        </div>
        <div className="double-cell">
            <div id="pot-wrap">
                <span id="pot" style={{display:table_pot0_amount_visible}}>{potText}</span>
            </div>
            <div id="board-wrap">
                <div className="card-container">
                    <div className="card card-{table.board[0]}" style={{display:table_board0_visible}}></div>
                </div>
                <div className="card-container">
                    <div className="card card-{table.board[1]}" style={{display:table_board1_visible}}></div>
                </div>
                <div className="card-container">
                    <div className="card card-{table.board[2]}" style={{display:table_board2_visible}}></div>
                </div>
                <div className="card-container">
                    <div className="card card-{table.board[3]}" style={{display:table_board3_visible}}></div>
                </div>
                <div className="card-container">
                    <div className="card card-{table.board[4]}" style={{display:table_board4_visible}}></div>
                </div>
            </div>
        </div>
        <div className="cell">
            <seat player="table.seats[1]" active-seat="table.activeSeat" dealer-seat="table.dealerSeat" my-seat="mySeat" my-cards="myCards" sitting-on-table="$root.sittingOnTable" show-buy-in-modal="showBuyInModal(seat)" notifications="notifications" seat-index="1" cell-number="4" className="side"></seat>
        </div>
    </div>
    <div className="row">
        <div className="cell"></div>
        <div className="cell"></div>
        <div className="cell"></div>
        <div className="cell"></div>
    </div>
    <div className="row controls">
        <div className="chat-cell">
            <div id="chat" ng-controller="ChatController">
                <div id="messages"></div>
                <form ng-submit="sendMessage()">
                    <input type="text" ng-model="messageText"></input>
                    <input type="submit" value="↵"></input>
                </form>
            </div>
        </div>
        <div className="cell">
            <button className="control-button" ng-click="fold()" ng-show="showFoldButton()">Fold</button>
            <button className="control-button" ng-click="postBlind(false)" ng-show="actionState === 'postSmallBlind' || actionState === 'postBigBlind'">Sit Out</button>
            <button className="control-button" ng-click="leaveTable()" ng-show="showLeaveTableButton()">Leave Table</button>
        </div>
        <div className="cell">
            <button className="control-button" ng-click="sitIn()" ng-show="$root.sittingOnTable !== null && !$root.sittingIn">Sit In</button>
            <button className="control-button" ng-click="postBlind(true)" ng-show="actionState === 'postSmallBlind'">Small Blind ({table.smallBlind})</button>
            <button className="control-button" ng-click="postBlind(true)" ng-show="actionState === 'postBigBlind'">Big Blind ({table.bigBlind})</button>
            <button className="control-button" ng-click="check()" ng-show="showCheckButton()">Check</button>
            <button className="control-button" ng-click="call()" ng-show="showCallButton()">Call {callAmount}</button>
        </div>
        <div className="cell">
            <button className="control-button" ng-click="bet()" ng-show="showBetButton()">Bet {betAmount}</button>
            <button className="control-button" ng-click="raise()" ng-show="showRaiseButton()">Raise to {betAmount}</button>
        </div>
        <div className="double-cell">
            <div className="cell-content">
                <input type="range" ng-show="showBetRange()" min="{minBetAmount}" max="{maxBetAmount}" ng-model="betAmount">
                </input>
                <input type="number" id="bet-input" ng-show="showBetInput" min="{minBetAmount}" max="{maxBetAmount}" ng-model="betAmount" value="{betAmount}">
                </input>
            </div>
        </div>
    </div>
    <div id="audio">
        <audio id="fold-sound" src="/audio/fold.wav" preload="auto"></audio>
        <audio id="check-sound" src="/audio/check.wav" preload="auto"></audio>
        <audio id="call-sound" src="/audio/call.wav" preload="auto"></audio>
        <audio id="bet-sound" src="/audio/bet.wav" preload="auto"></audio>
        <audio id="raise-sound" src="/audio/raise.wav" preload="auto"></audio>
    </div>
</div>
            );
    }
}
class  Lobby extends React.Component{

    constructor(...args) {
      super(...args);
      this.state={
        lobbyTables:[], 
        newScreenName : '',
        totalChips:0,
        screenName:"",
        registerError:""
      };
    }

    componentDidMount() {
       socket.emit( '/get/UsePack', {start:0,limit:10,search:"",contact_id:185}, (response)=>{
            console.log(response);
            if( response.success ){
            } else {
                if( response.error ) {
                }
            }
        });
    }

    register=(event)=>{
        // If there is some trimmed value for a new screen name
        if( this.state.newScreenName ) {
            socket.emit( 'register', this.state.newScreenName, (response )=>{
                console.log(response);
                if( response.success ){
                    this.setState({screenName:response.screenName});
                    this.setState({totalChips:response.totalChips});
                    this.setState({registerError :''});
                    //$rootScope.$digest();
                }
                else if( response.message ) {
                    this.setState({registerError:response.message});
                }
                //this.state.$digest();
            });
        }
        event.preventDefault();
    }
    handle_newScreenName_Change=(e)=>{
        this.setState({newScreenName:e.target.value})
    }
    tableClick=(tableId)=>{
        console.log(tableId);
        this.props.onEnterRoom(tableId);
    }
    render() {
        const contactRows = this.state.lobbyTables.map(
           (table, idx) => (
           <tr key={idx} >
           <td>
            <button onClick={()=>{this.tableClick(table.id)}}>{table.name}</button>
           </td>
           <td className="centered-text">{table.bigBlind}/{table.smallBlind}
           </td><td className="centered-text">{table.playersSeatedCount}/{table.seatsCount}
           </td></tr>)
        );
        let form;
        if(this.state.screenName){
        }
        else{
            form=(<div className="modal-wrap" visible={this.state.screenName}>
                    <div className="modal">
                        <div>
                            <label for="screen-name-input">Enter your screen name</label>
                            <p className="table-requirements error" ng-show="registerError">{this.state.registerError}</p>
                            <input id="screen-name-input" 
                            className="input-left" type="text" 
                            ng-model="newScreenName" 
                            ng-trim="true" 
                            value={this.state.newScreenName}
                            onChange={this.handle_newScreenName_Change}
                            required>
                            </input>
                            <button onClick={this.register}>Submit</button>
                        </div>
                    </div>
                    <div id="curtain">{this.state.screenName}</div>
                </div>);
        }
        return (
            <div>
            <div id="lobby">
                {form}
                <table id="table-list">
                    <tr>
                        <th className="dark-border">Name</th>
                        <th className="dark-border">BB/SB</th>
                        <th>Players</th>
                    </tr>
                    {contactRows}
                </table>
            </div>          
            <p id="developer-info">
                Developed by George Balasis. View the code on <a href="https://github.com/geobalas/Poker" target="_blank">github</a>.
            </p>

            </div>
        );
    }
}
class  ChatApp extends React.Component{

    constructor(...args) {
      super(...args);
      this.state={
        tableId:0,
        screenName:"",
        totalChips:0,
        enterRoom:false
      };
    }
    onEnterRoom=(tableId)=>{
        console.log("here");
        this.setState({enterRoom:true,tableId:tableId});
    }
    render=()=>{
        if (this.state.enterRoom)
            return(<Table tableId={this.state.tableId} />);
        else
            return(<Lobby onEnterRoom={this.onEnterRoom}/>);
    }
}
ReactDOM.render(<ChatApp/>, document.getElementById('app'));