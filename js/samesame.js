$(function() {
	resetBoard();

	$('.square').dblclick( function (event) {
		row = $(this).parent().index();
	    col = $(this).index();
	    if (window.minefield[row][col].isClicked) {
	    	if (window.minefield[row][col].neighborMines == window.minefield[row][col].neighborFlags) {
	    		//handle case where it's the wrong mine marked

				for (var offsetRow = -1; offsetRow < 2; offsetRow++) {
					for (var offsetCol = -1; offsetCol < 2; offsetCol++) {
						if (inBounds(row, offsetRow, col, offsetCol) &&
							!window.minefield[row+offsetRow][col+offsetCol].isClicked &&
							!window.minefield[row+offsetRow][col+offsetCol].isFlag) {
								clickSquare(row+offsetRow, col+offsetCol);
						}
					}
				}
			} else if (window.minefield[row][col].neighborMines < window.minefield[row][col].neighborFlags) {
				//if flagged mines > number of neighbors, then lose
				$(this).append(window.timesHtml);
				reveal();
				showLose();
			}
			//if #marked mines is lesser than number of mines, then don't do anything
		}
	});
	$('.fa .fa-dot-circle-o').bind("contextmenu",function(e){
		if (window.gameInPlay) {
	        e.preventDefault();

	    	if (window.minefield[row][col].isFlag) {
	    		$(e.target).html('');
	    		window.minefield[row][col].isFlag = false;
    			window.clearedSquares--;
    			updateNeighborFlags(row, col, -1);
	    		window.mines++;
	        	updateMines();
	        }
	    }
	});

	$(document).bind("contextmenu",function(e){
		if (window.gameInPlay) {
	        e.preventDefault();

	        if (e.target.className == "fa fa-dot-circle-o") {
	        	//encounter Flagged icon
	        	row = $(e.target).parent().parent().index();
	    		col = $(e.target).parent().index();
    			$(e.target).parent().html('');
	    		setFlag(row, col, false);
	        } else if (e.target.className == "square") {
	        	//clicked on square
		        row = $(e.target).parent().index();
		    	col = $(e.target).index();

		    	if (!window.minefield[row][col].isFlag &&
		    		!window.minefield[row][col].isClicked &&
		    		window.mines > 1) {
		        	$(e.target).html(window.bombHtml);
		        	setFlag(row, col, true);
		        	if (window.clearedSquares+window.mines == (window.boardX*window.boardY) ) {
						showWin();
					}

				} else if (window.minefield[row][col].isFlag) {
		    		$(e.target).html('');
		    		setFlag(row, col, false);
		    	}
	        }
		}
    });
	$('.square').click( function (event) {
		if (window.gameInPlay) {
			if (!window.startedGame) {
				window.timer  = window.setTimeout( function(){
			          updateTime();
				}, 1000 );
				window.startedGame = true;
			}
	    	clickSquare($(this).parent().index(), $(this).index());
	    }
	});

});
function setFlag(row, col, boolVal) {
	window.minefield[row][col].isFlag = boolVal;
	if (!boolVal) {
		window.clearedSquares--;
		updateNeighborFlags(row, col, -1);
		window.mines++;
	} else {
		window.clearedSquares++;
		updateNeighborFlags(row, col, +1);
		window.mines--;
	}
	updateMines();
}
function updateNeighborFlags(row, col, amount) {
	/* Update the number of neighboring mines for a particular cell */
	for (var offsetRow = -1; offsetRow < 2; offsetRow++) {
		for (var offsetCol = -1; offsetCol < 2; offsetCol++) {
			if (inBounds(row, offsetRow, col, offsetCol)) {
				var square = window.minefield[row+offsetRow][col+offsetCol]
				if (square.neighborFlags == -1) {
					window.minefield[row+offsetRow][col+offsetCol].neighborFlags = 1;
				} else if(square.neighborFlags == 1 &&
						  amount < 0 ) {
					window.minefield[row+offsetRow][col+offsetCol].neighborFlags = -1;
				} else
				{
					window.minefield[row+offsetRow][col+offsetCol].neighborFlags+=amount;
				}
			}
		}
	}
}

function countNeighborMines(row, col) {

	for (var offsetRow = -1; offsetRow < 2; offsetRow++) {
		for (var offsetCol = -1; offsetCol < 2; offsetCol++) {
			if (inBounds(row, offsetRow, col, offsetCol) &&
				window.minefield[row+offsetRow][col+offsetCol].hasMine) {
					window.minefield[row+offsetRow][col+offsetCol].neighborMines++;
			}

		}
	}
}
function Square() {
	this.hasMine = false;
	this.isClicked = false;
	this.isFlag = false;
	this.neighborFlags = -1;
	this.neighborMines;
}

function clickSquare(row, col) {

	//invalid row/col [0-7]
	if (row < 0 || row > window.boardY-1 || col < 0 || col > window.boardX-1) { return; }

	//nothing to do for square already clicked
	if (window.minefield[row][col].isClicked) { return; }

	//if space is marked as flag, and not a mine, unmark as flag
	if (window.minefield[row][col].isFlag &&
		!window.minefield[row][col].hasMine) {
		setFlag(row, col, false);
	}
	/*
	if (window.minefield[row][col].isFlag &&
		window.minefield[row][col].hasMine) {
		$(this).append(window.timesHtml);
		reveal();
		showLose();
	}*/

	//hit a bomb
	if (window.minefield[row][col].hasMine ) {
		$('#gameboard tr:nth-child('+(row+1)+') td:nth-child('+(col+1)+')').css('color', 'red');
		if (window.minefield[row][col].isFlag ) {
			$(this).append(window.timesHtml);
		}
		reveal();
		showLose();
		return;
	} else {

		$('#gameboard tr:nth-child('+(row+1)+') td:nth-child('+(col+1)+')').css('background-color', 'red')
		window.clearedSquares++;
		window.minefield[row][col].isClicked = true;
		bombsNear = 0;
		flagsNear = 0;
		//count bombs in rows & cols around
		for (var offsetRow = -1; offsetRow < 2; offsetRow++) {
			for (var offsetCol = -1; offsetCol < 2; offsetCol++) {
				if (inBounds(row, offsetRow, col, offsetCol)) {
					if (window.minefield[row+offsetRow][col+offsetCol].hasMine) {
						bombsNear++;
					}
					if (window.minefield[row+offsetRow][col+offsetCol].isFlag) {
						flagsNear++;
					}
				}

			}
		}

		if (bombsNear == 0) {
			$('#gameboard tr:nth-child('+(row+1)+') td:nth-child('+(col+1)+')').css('background-color', 'black');
			for (var offsetRow = -1; offsetRow < 2; offsetRow++) {
				for (var offsetCol = -1; offsetCol < 2; offsetCol++) {
					clickSquare(row+offsetRow, col+offsetCol);
					if (!window.gameInPlay) {

					}
				}
			}
		} else { //show number of mines neighboring
			if (window.minefield[row][col].isFlag) {
				$('#gameboard tr:nth-child('+(row+1)+') td:nth-child('+(col+1)+')').css('color', 'black');
			} else {
				$('#gameboard tr:nth-child('+(row+1)+') td:nth-child('+(col+1)+')').html(bombsNear);
				window.minefield[row][col].neighborMines = bombsNear;
			}
		}
	   	if ((window.flags.length+window.clearedSquares+window.mines) == (window.boardX*window.boardY)) {
			showWin();
		}
	}

}
function inBounds(row, offsetRow, col, offsetCol) {
	if (row+offsetRow >= 0 && row+offsetRow < window.boardY &&
		col+offsetCol >= 0 && col+offsetCol < window.boardX) {
		return true;
	}
	return false;
}

function updateMines() {
	$($('#numMines')).html(window.mines.toString());
}
function updateTime() {
	$($('#timer')).html(window.mines.toString());
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
function resetBoard() {
	window.mines = 10;
	window.clearedSquares = 0;
	window.gameInPlay = true;
	window.flags = new Array();
	window.bombHtml = '<i class="fa fa-dot-circle-o"></i>';
	window.timesHtml = '<i class="fa fa-times fa-2x"></i>';
	window.startedGame = false;
	window.clearInterval(window.timer);
	$('body').disableTextSelect();
	/*
	for (var row=1; row <= window.boardX; row++) {
		$('#gameboard tr:nth-child('+row+')').remove();
	}*/
	createGameboard();
	placeBombs();
	for(var cnt=0; cnt < window.locations.length; cnt++) {
		countNeighborMines(window.locations[cnt][0], window.locations[cnt][1]);
	}
}
function placeBombs(minefield) {
	bombsLeft = window.mines;
	window.locations = new Array(bombsLeft);
	while ( bombsLeft ) {
		x = Math.floor((Math.random()*window.boardX));
		y = Math.floor((Math.random()*window.boardY));

		if (window.minefield[x][y].hasMine != true) {
			window.locations[window.mines - bombsLeft] = [x,y];
			window.minefield[x][y].hasMine = true;
			bombsLeft--;
		}
	}
}

function createGameboard() {
	//create 8x8 array each holding square object
	window.boardX=8;
	window.boardY=8;

	window.minefield = new Array(window.boardY);
	for (var cnt=0; cnt < window.boardY; cnt++) {
		$('#gameboard').append('<tr></tr>');
		minefield[cnt] = new Array(window.boardX);
		for (var hcnt=0;hcnt < window.boardX; hcnt++) {
			$('#gameboard tr:nth-child('+(cnt+1)+')').append('<td id="row'+cnt.toString()+'_col'+hcnt.toString()+'" class="square"></td>');
			window.minefield[cnt][hcnt] = new Square();
		}
	}
}

function reveal() {

	for (var cnt=0; cnt < window.boardY; cnt++) {
		for (var hcnt=0;hcnt < window.boardX; hcnt++) {
			if (window.minefield[cnt][hcnt].isFlag &&
				!window.minefield[cnt][hcnt].hasMine) {
				$('tr:nth-child('+(cnt+1)+') td:nth-child('+(hcnt+1)+')').append(window.timesHtml);
			}
		}
	}
	for (var cnt=0; cnt < window.locations.length; cnt++) {
		window.minefield[window.locations[cnt][0]].isFlag = true;
		updateNeighborFlags(window.locations[cnt][0], window.locations[cnt][1], 1);
		$('tr:nth-child('+(window.locations[cnt][0]+1)+') td:nth-child('+(window.locations[cnt][1]+1)+')').html(window.bombHtml);
	}
	window.mines = 0;
	window.flags = window.locations;

	updateMines();
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
