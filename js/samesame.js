const CODE_PREFIX = "&#x1F0"
const CODE_CARDBACK = "&#x1F0A0"
const SUIT = {
	HEART : {value: 0, name: "H", code: "B"}, 
	DIAMOND: {value: 1, name: "D", code: "C"}, //U+00E9 --> &#xe9;  //U+1F0B1  ---> &#x1F0 B 1
	SPADE : {value: 2, name: "S", code: "A"},
	CLUB : {value: 3, name: "C", code: "D"},
};

const NUM = {
	ACE : {value: 1, name: "A", code: "1"}, 
	TWO: {value: 2, name: "2", code: "2"},
	THREE: {value: 3, name: "3", code: "3"},
	FOUR: {value: 4, name: "4", code: "4"},
	FIVE: {value: 5, name: "5", code: "5"},
	SIX: {value: 6, name: "6", code: "6"},
	SEVEN: {value: 7, name: "7", code: "7"},
	EIGHT: {value: 8, name: "8", code: "8"},
	NINE: {value: 9, name: "9", code: "9"},
	TEN: {value: 10, name: "10", code: "A"},
	JACK: {value: 11, name: "J", code: "B"},
	QUEEN: {value: 12, name: "Q", code: "D"},
	KING: {value: 13, name: "K", code: "E"},
};


$(function() {
	var players = 1;
	// $('#reset1P').click( function (event) {
	// 	players = 1;
	// });
	// $('#reset2P').click( function (event) {
	// 	players = 2;
	// });
	window.board = new Board(players);
	window.board.setup();
	window.board.shuffle();

	//disable right-click context menu
	$(document).bind("contextmenu",function(e){
		if (window.board.gameInPlay) {
	        e.preventDefault();
		}
    });
    //when card is clicked
	$('.card').click( function (event) {
    	clickCard( $(this).index(), $(this).parent().index());
	});

});

function clickCard(x, y) {
	var clickedCard = window.board.cards[y][x];
	console.log(clickedCard.cardInfo(), window.board.cardsVisible.length );
	

	//nothing to do for card already flipped
	if (window.board.cards[y][x].faceup) { return; }

	//clickedCard.flip(x, y);
	//show card
	if (window.board.cardsVisible.length < 2) {
		clickedCard.flip();
		window.board.cardsVisible.push(clickedCard);
		console.log(window.board.cardsVisible);
	} 
	if (window.board.cardsVisible.length == 2) {

		console.log(window.board.cardsVisible);
		setTimeout(function() { 
			window.board.checkMatch();
		}, 2000);
		window.board.endTurn();
	}

	//add card to known
	window.board.knownCards[y][x] = clickedCard;

}

function reduceDeck(deck) {
	var flattened = window.unknownCards.reduce(function(a, b) {
  		return a.concat(b);
	}, []);
}


function showLose() {
	window.gameInPlay = false;

	$('#reset').html('<i class="fa fa-frown-o fa-2x"></i>');
	$('body').css('background-image', 'url("../img/grumpy.gif")');
	$('body').css('background-size', '60%');
	$('body').css('background-repeat', 'no-repeat');
	$('body').css('background-position', 'center top');
}

function showWin() {
	reveal();
	$('body').css('background-image', 'url("../img/heartfall.gif")');
	$('body').css('background-repeat','repeat');
	$('body').css('background-position', 'center top');
}
function Player(number) {
	this.name = "Player"+String(number);
	this.score = 0;
}

function reveal() {
	window.board.reveal();
}
function reset(players) {
	window.board.reset(players);
}

function Board(nPlayers = 1) {
	this.width = Object.keys(NUM).length;
	this.height = Object.keys(SUIT).length;
	this.players = Array(nPlayers); //todo: safeguard against <1
	this.round = 1;
	this.gameInPlay = false;
	
	this.cards = new Array(this.width);
	this.knownCards = new Array(this.width); //13 because A, 1...10,J,Q,K
	this.unknownCards = new Array(this.width); //13 because A, 1...10,J,Q,K

	this.cardsVisible = [];
	//add players
	for (var i=0; i< this.nPlayers; i++) {
		this.players[i] = new Player(i+1);
	}

	this.setup = function () {	
		
		//set current player
		this.currentPlayer = this.players[nPlayers%this.round];

		$('#gameboard').empty();
		$('body').disableTextSelect();
		
		//lay down cards
		for (var s in SUIT) {
			this.cards[SUIT[s].value] = new Array(this.height);
			this.unknownCards[SUIT[s].value] = new Array(this.height);
			this.knownCards[SUIT[s].value] = new Array(this.height);
			$('#gameboard').append('<tr></tr>');

	  		for (var n in NUM) {
	  			var x = NUM[n].value
	  			var y = SUIT[s].value
	  			$('#gameboard tr:nth-child('+(y+1)+')').append('<td id="row'+y.toString()+'_col'+x.toString()+'" class="card clearfixfix">'+CODE_CARDBACK+'</td>');//&#xe9;
	  			this.cards[SUIT[s].value][NUM[n].value-1] = new Card(NUM[n], SUIT[s])
	  			this.unknownCards[SUIT[s].value][NUM[n].value-1] = new Card(NUM[n], SUIT[s])
	  		}
		}
		this.gameInPlay = true;
		this.print("initial setup");
	};

	this.shuffle = function() {
		var cnt = 4* this.width * this.height;
		for (cnt; cnt >=0; cnt--) {

			initialX =  Math.floor(Math.random() * this.width);
			initialY = Math.floor(Math.random() * this.height);

			destX = Math.floor(Math.random() * this.width);
			destY = Math.floor(Math.random() * this.height);

			tempCard = this.cards[initialY][initialX];

			this.cards[initialY][initialX] = this.cards[destY][destX];		
			this.cards[initialY][initialX].x = 	initialY;
			this.cards[initialY][initialX].y = 	initialX;

			this.cards[destY][destX] = tempCard;
			
			this.cards[destY][destX].x = destY;
			this.cards[destY][destX].y = destX;
			// console.log("cardB x,y:", this.cards[destY][destX].x, this.cards[destY][destX].y)
		}
		this.print("shuffled");
	};
	this.print = function(statename) {
		var board_str = "";
		for (var y = 0; y < this.height; y++) {
			board_str += "\n";
		 	for (var x =0; x< this.width; x++) {
		 		board_str += this.cards[y][x].cardInfo() + ", ";
		 	}
		}
		console.log("BOARD STATE: ", statename, "\n:", board_str);
	};
	this.reveal = function() {
		console.log(this.height, this.width);
		for (var y = 0; y < this.height; y++) {
			for (var x =0; x< this.width; x++) {
		 		this.cards[y][x].draw(this.cards[y][x].code);
		 	}
		}
		console.log('hit reveal');
	};
	this.checkMatch = function() {
		//assert( this.cardsVisible.length == 2, 'Board should have two visible cards');
		console.log ("hi", this.cardsVisible);
		if (this.cardsVisible[0].number.value == this.cardsVisible[1].number.value) {
			//Deal with a MATCH
			cnt = 0;
			while (cnt < this.cardsVisible.length) {
				card = this.cardsVisible[cnt];
				//set card to matched
				card.matched = true;
				//update known and unknown
				console.log(this.unknownCards);
				console.log(this.knownCards);
				this.unknownCards[card.y][card.x] = null;
				this.knownCards[card.y][card.x] = null;

				//draw cards to scoreboard
				card.drawToScoreboard();
				this.currentPlayer.score++;
				cnt++;
			}
		} else { //NO MATCH
			//flip over
			this.cardsVisible[0].flip();
			this.cardsVisible[1].flip();
		}
	};
	this.endTurn = function () {
		this.round++;
		this.currentPlayer = this.players[nPlayers%this.round];
		//set current player
		this.cardsVisible = [];
		console.log(this.currentPlayer, "'s turn now.");
	}

}
function Card(cardnum, cardsuit) {
	this.number = cardnum;
	this.suit = cardsuit;
	this.code = CODE_PREFIX+this.suit.code+this.number.code;
	this.faceup = false;
	this.matched = false;
	this.x = cardsuit.value;
	this.y = cardnum.value-1;
	this.draw = function (code) {
		//console.log("x: ", this.x, "y: ", this.y);
		$('#gameboard tr:nth-child('+(this.x+1)+') td:nth-child('+(this.y+1)+')').html(code);
	}
	this.drawToScoreboard = function () {
		$('#gameboard tr:nth-child('+(this.y+1)+') td:nth-child('+(this.x+1)+')').empty();
		$('#scoreboard tr:nth-child('+(this.y+1)+') td:nth-child('+(this.x+1)+')').html(this.code);	
	}
	this.flip = function (x, y) {
		if (!this.faceup) {
			this.draw(this.code);
		} else {
			this.draw(CODE_CARDBACK);
		}
		this.faceup = !this.faceup;
		console.log(this.cardInfo());
    };
    this.cardInfo = function () {
        return this.number.name + this.suit.name + "("+this.faceup+") @[" +this.x+","+this.y+"]";
    };
}
function assignUnknownCard() {
	var flattened = window.unknownCards.reduce(function(a, b) {
  		return a.concat(b);
	}, []);
	return Math.random(flattened.length)
	return (SUIT.HEART, NUM.ACE)
}

jQuery.fn.disableTextSelect = function() {
	return this.each(function() {
		$(this).css({
			'MozUserSelect':'none',
			'webkitUserSelect':'none'
		}).attr('unselectable','on').bind('selectstart', function() {
			return false;
		});
	});
};
