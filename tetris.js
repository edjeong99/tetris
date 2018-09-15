var bgcolor = "lightgrey";  // Set the default color of spaces
var hd = true; // True for higher quality, false for lower quality
if (hd) {
    var shadow = "inset 0 0 10px #000000";
} else {
    var shadow = "none";
}
var score = 0;
var playing = true;

// Class Declarations

// A Piece has a base and 3 relative pieces
// @param type can specifiy which type of piece it is with integer 1-7
var Piece = function (type) {
    this.base = [5, 1];
    this.type = type || Math.floor(1 + Math.random() * 7);
    switch(this.type){
        case 1:
            this.blocks = [[0, 1], [1, 0], [-1, 0]]; // T
            this.color = "purple";
            break;
        case 2:
            this.blocks = [[0, 1], [0, -1], [0, -2]]; // I
            this.color = "cyan";
            break;
        case 3:
            this.blocks = [[0, 1], [0, -1], [1, -1]]; // L
            this.color = "orange";
            break;
        case 4:
            this.blocks = [[0, 1], [0, -1], [-1, -1]]; // J
            this.color = "blue";
            break;
        case 5:
            this.blocks = [[1, 0], [1, -1], [0, -1]]; // O
            this.color = "yellow";
            break;
        case 6:
            this.blocks = [[0, -1], [1, 0], [1, 1]]; // S
            this.color = "green";
            break;
        case 7:
            this.blocks = [[0, -1], [-1, 0], [-1, 1]]; // Z
            this.color = "red";
            break;
    }
}

Piece.prototype.cantSpawn =  function(){
    if(!spaceFree(this.base[0], this.base[1])){
        return true;
    }

    for (i = 0; i < 3; i++){
        if(!spaceFree(this.base[0] + this.blocks[i][0], this.base[1] - this.blocks[i][1])){
            return true;
        }
    }
    return false;
}

// Clears rows that are full
// Called each time a block is placed
//
Piece.prototype.tryClear = function() {
    var toCheck = this.getWhys();
    var multiplier = 0;
    for(i = 0; i < toCheck.length; i++){
        var breaker = false;

        for(j = 0; j < 10; j++){
            if(spaceFree(j, toCheck[i])){
                breaker = true;
                break;
            }
        }
        if(!breaker){
            multiplier++;

            score = score + (multiplier * 10);
            for(j = toCheck[i]; j > 0; j--){
                for(k = 0; k<10; k++){
                    document.getElementById(id(k, j)).style.backgroundColor = document.getElementById(id(k, j-1)).style.backgroundColor;
                    document.getElementById(id(k, j)).style.borderRadius = document.getElementById(id(k, j-1)).style.borderRadius;
                    document.getElementById(id(k, j)).style.boxShadow  = document.getElementById(id(k, j-1)).style.boxShadow ;
                }
            }
            for(z = i+1; z<toCheck.length; z++){
                if(toCheck[z] < toCheck[i] && toCheck[z] < 16){
                    toCheck[z] +=1;
                }
            }
        }

    }
    document.getElementById("score").innerHTML = "Score: " + score;
}

// Helper function for getWhys
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

// Returns all the rows that possibly be affected by placing a block
Piece.prototype.getWhys = function(){
    var res = [];
    var theBase = this.base[1];
    res.push(theBase);
    for(i = 0; i < 3; i++){
        res.push(theBase - this.blocks[i][1]);
    }
    return res.filter(onlyUnique);
}

// Flips a piece clockwise if possible and update the visual
Piece.prototype.clock = function(){
    if(t.canClock()){
        this.erase();
        for(i = 0; i < 3; i++){
            this.blocks[i] = [this.blocks[i][1], -1 * this.blocks[i][0]];
        }
        this.update();
    }
}

// Checks if a piece can rotate clockwise
Piece.prototype.canClock = function(){
    for(i = 0; i < 3; i++){
        x = this.blocks[i][1];
        y = this.blocks[i][0] * -1;
        if(this.base[0] + x < 0 || this.base[0] + x > 9 || this.base[1] - y > 16){
            return false;
        }
        if(!spaceFree(this.base[0]+x, this.base[1]-y)){
            return false;
        }
    }

    return true;
}

//Checks if a piece can rotate counterclockwise
Piece.prototype.canCounter = function(){
    for(i = 0; i < 3; i++){
        x = this.blocks[i][1] * -1;
        y = this.blocks[i][0];
        if(this.base[0] + x < 0 || this.base[0] + x > 9 || this.base[1] - y > 16){
            return false;
        }
       if(!spaceFree(this.base[0]+x, this.base[1]-y)){
            return false;
        }
    }

    return true;
}

// Rotates a piece counterclockwise if possible
Piece.prototype.counter = function(){
    if(t.canCounter()){
        this.erase();
        for(i = 0; i < 3; i++){
            this.blocks[i] = [-1 * this.blocks[i][1], this.blocks[i][0]];
        }
        this.update();
    }
}

// Used for debugging. Prints out the piece's extra block positions
Piece.prototype.print = function(){
    for(i = 0; i < 3; i++){
        console.log(i + "[" + this.blocks[i][0] + ", " + this.blocks[i][1] + "]");
    }
}

// Draws the piece
Piece.prototype.update = function(){
    document.getElementById(id(this.base[0], this.base[1])).style.backgroundColor = this.color;
    document.getElementById(id(this.base[0], this.base[1])).style.boxShadow  = shadow;
    for(i = 0; i < 3; i++){
        document.getElementById(id(this.base[0] + this.blocks[i][0], this.base[1] - this.blocks[i][1])).style.backgroundColor = this.color;
        document.getElementById(id(this.base[0] + this.blocks[i][0], this.base[1] - this.blocks[i][1])).style.boxShadow  = shadow;
    }
}
// Erases the piece from the screen (used when a piece's position is about to change)
Piece.prototype.erase = function(){
    document.getElementById(id(this.base[0], this.base[1])).style.backgroundColor = bgcolor;
    document.getElementById(id(this.base[0], this.base[1])).style.boxShadow  = "none";
    for(i = 0; i < 3; i++){
        document.getElementById(id(this.base[0] + this.blocks[i][0], this.base[1] - this.blocks[i][1])).style.backgroundColor = bgcolor;
        document.getElementById(id(this.base[0] + this.blocks[i][0], this.base[1] - this.blocks[i][1])).style.boxShadow  = "none";
    }
}

// Moves a piece
// @param x the horizontal shift
// @param y the vertical shift
Piece.prototype.shift = function(x, y){
    if(this.canShift(x, y)){
        this.erase();
        this.base = [this.base[0] + x, this.base[1]-y];
        this.update();
     //   this.print();
    }
}

// Checks if a piece can move
// @param x the horizontal shift
// %param y the vertical shift
Piece.prototype.canShift = function(x, y){
    if(this.base[0] + x < 0 || this.base[0] + x > 9){
        return false;
    }
    if(!spaceFree(this.base[0] + x, this.base[1] - y)){
        return false;
    }
    for (i = 0; i < 3; i++){
        if(this.base[0] + this.blocks[i][0] + x < 0 || this.base[0] +this.blocks[i][0] + x > 9){
            return false;
        }
        if(!spaceFree(this.base[0] + this.blocks[i][0] + x, this.base[1] - this.blocks[i][1]- y)){
            return false;
        }
    }

    return true;
}

// Checks if a piece won't go below the floor
Piece.prototype.canGoDown = function(){
    if(this.base[1] == 16){
        return false;
    }
    for (i = 0; i < 3; i++){
        if(this.base[1] - this.blocks[i][1] == 16){
            return false;
        }
    }
    if(!this.canShift(0, -1)){
        return false;
    }
    return true;
}

Piece.prototype.place = function(){
    document.getElementById(id(this.base[0], this.base[1])).style.borderRadius = "0px";
    for(i = 0; i < 3; i++){
        document.getElementById(id(this.base[0] + this.blocks[i][0], this.base[1] - this.blocks[i][1])).style.borderRadius  = "0px";
    }
}

// End of Class Declarations

// Unused method

function appendBox() {
    var box1 = '<div class="box"></div>';
    $("body").append(box1);     // Append new elements
 }

// Used to create the tetris grid
function appendBoxes() {
    for(i = 0; i < 170; i++){
        if(i%10 == 0){
            var box1 = '<div class="box breaker" id=' + id(Math.floor(i%10), Math.floor(i/10)) +  '></div>';
        } else {
            var box1 = '<div class="box" id=' + id(Math.floor(i%10), Math.floor(i/10)) + '></div>';
        }
        $("#field").append(box1);     // Append new elements
    }
}

// Used to create the swap space
function appendSwap() {
    for(i = 0; i < 12; i++){
        if(i%3 == 0){
            var box1 = '<div class="box breaker" id=' + idz(Math.floor(i%3), Math.floor(i/3)) +  '></div>';
        } else {
            var box1 = '<div class="box" id=' + idz(Math.floor(i%3), Math.floor(i/3)) + '></div>';
        }
        $("#nextPiece").append(box1);     // Append new elements
    }
}


// Helper function used for javascript document by id methods
function id(x, y){
    return x + "." + y;
}

// Helper function used for jQuery selector
function jid(x, y){
    return "#" + id(x, y);
}

// appendBoxes();

function showSwap(type){


    for (i = 0; i < 3; i++){
        for(j = 0; j < 4; j++){
            document.getElementById(idz(i, j)).style.backgroundColor = "lightgray";
            document.getElementById(idz(i, j)).style.boxShadow = "none";
        }
    }

    var myPiece = new Piece(type);
    myPiece.base = [1, 1];
    document.getElementById(idz(myPiece.base[0], myPiece.base[1])).style.backgroundColor = myPiece.color;
    document.getElementById(idz(myPiece.base[0], myPiece.base[1])).style.boxShadow = shadow;
    for (i = 0; i < 3; i++){
         document.getElementById(idz(myPiece.base[0] + myPiece.blocks[i][0], myPiece.base[1] - myPiece.blocks[i][1])).style.backgroundColor = myPiece.color;
         document.getElementById(idz(myPiece.base[0] + myPiece.blocks[i][0], myPiece.base[1] - myPiece.blocks[i][1])).style.boxShadow = shadow;
    }
}
// Helper function referring to ID of the  swap section
function idz(x, y){
    return 'z' + x + y;
}

function level(x){
    return Math.sqrt(x)*80;
}

function resetTimer(){
    clearInterval(timer);
    timer = setInterval(function(){
    if(t.canGoDown()){
        t.shift(0, -1);
    } else {
        t.place();
        t.tryClear();
        t = new Piece();
        if(t.cantSpawn()){
            clearInterval(timer);
            playing = false;
            document.getElementById("message").style.display = "block";
            return;
        }
        t.update();
        hasSwapped = false;
        pieces++;
        resetTimer();
        }
    }, 1250-level(pieces));
}

function spaceFree(x, y){
    return document.getElementById(id(x, y)).style.borderRadius  != "0px";
}

function startGame(){
    
    // Disable page navigating keys
    var ar=new Array(33,34,35,36,37,38,39,40);
    $(document).keydown(function(e) {
         var key = e.which;
          if($.inArray(key,ar) > -1) {
              e.preventDefault();
              return false;
          }
          return true;
    });
    
    savedType = 10; // Saved key sentinel value
    hasSwapped = false; // The game starts allowing you to swap
    
                                                    // Set keyboard controls
    $(document).keydown(function(event){
        if(playing){
            if(event.which == 37){                  // Left Arrow
                t.shift(-1, 0);                     //  Move Left
            } else if(event.which == 39){           // Right Arrow
                t.shift(1, 0);                      //  Move Right
            } else if(event.which == 88){           // X
                if(t.type != 5)                     //  Don't rotate a square
                    t.clock();                      //  Rotate Clockwise
            } else if(event.which == 90){           // Z
                if(t.type != 5)                     //  Don't rotate a square
                    t.counter();                    //  Rotate counterclockwise
            } else if(event.which == 40){           // Down Arrow
               if(t.canGoDown()){                   //  Check if the piece can go down
                   t.shift(0, -1);                  // Move Down
                   resetTimer();                    //  Reset The Timer
               }        
            } else if(event.which == 16){           // Left Shift
                if(!hasSwapped){                    //  Check if user has swapped this piece yet
                    if(savedType == 10){            //      Checks if there is a piece in swap
                        savedType = t.type;         //          Save the Piece's shape
                        t.erase();                  //          Erase the Piece from the board
                        t = new Piece();            //          Create the next Piece
                        t.update();                 //          Draw the new Piece to the board
                        hasSwapped = true;          //          Don't let the user swap again this round
                        showSwap(savedType);        //          Display the swap Piece in swap space
                    } else{                         //      If there is a piece in swap space:
                        var toChange = t.type;      //          Save old piece's type temporarily
                        t.erase();                  //          Erase piece on board
                        t = new Piece(savedType);   //          Bring back old piece
                        savedType = toChange;       //          Save old piece's type for real
                        t.update();                 //          Draw the new piece
                        hasSwapped = true;          //          Don't let the user swap again this round
                        showSwap(savedType);        //          Display the swap Piece in swpa space
                    }
                }
            }
        }
    });


    appendBoxes();
    appendSwap();

    t = new Piece();
    pieces = 0;
    t.update();

    timer = setInterval(function(){
        if(t.canGoDown()){
            t.shift(0, -1);
        } else {
            t.place();
            t.tryClear();
            t = new Piece();
            if(t.cantSpawn()){
                clearInterval(timer);
                return;
            }
            t.update();
            hasSwapped = false;
            pieces++;
            resetTimer();
        }
    }, 1250-level(pieces));
}