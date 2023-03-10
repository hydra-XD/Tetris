//Tetris.js contains all gameplay functionality for the game

//Canvas contains entire game board, displayed on webpage as canvas object
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

//Determines if a row has been cleared. If so, remove rows and add points.
//Number of points increases for each row cleared
//calculation is 100 points per row, times 2^rows-1
//1 row is 100, 2 is 400, 3 is 1200, 4 is 3200

function arenaSweep() {
  let rowsCleared = 0;
  for (let y = arena.length - 1; y >= 0; y--) {
    if (arena[y].every(cell => cell !== 0)) {
      rowsCleared++;
      arena.splice(y, 1);
      arena.unshift(Array(arena[0].length).fill(0));
      y++;
    }
  }

  if (rowsCleared > 0) {
    player.score += rowsCleared * 100 * Math.pow(2, rowsCleared - 1);
    clear.play();
  }
}

//Determines if the player's piece makes a collision with existing pieces/boundaries of arena
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for(var y = 0; y < m.length; y++){
        for(var x = 0; x < m[y].length; x++){
            if(m[y][x] !== 0 && 
                (arena[y + o.y] && 
                arena[y + o.y][x + o.x]) !== 0) {
                    return true;
            }
        }
    }
    return false;
}

//Creates matrix that holds the position of placed pieces in the arena
//This matrix keeps track of pieces that have been placed
function createMatrix(w, h) {
    const matrix = [];
    while(h--) {
        matrix.push(new Array(w).fill(0));
    }

    return matrix;
}

//Creates piece for player to use based on the current piece of the player
//Available pieces are of types: T, O, L, J, S, Z, and I
function createPiece(type) {
    if(type === 'T') {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    }
    else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    }
    else if (type === 'L') {
        return [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0],
        ];
    }
    else if (type === 'J') {
        return [
            [4, 0, 0],
            [4, 4, 4],
            [0, 0, 0],
        ];
    }
    else if (type === 'S') {
        return [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0],
        ];
    }
    else if (type === 'Z') {
        return [
            [6, 6, 0],
            [0, 6, 6],
            [0, 0, 0],
        ];
    }
    else if (type === 'I') {
        return [
            [0, 0, 0, 0],
            [7, 7, 7, 7],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
    }
}

//Fills the canvas with the arena matrix and player piece
function draw() {
    context.fillStyle = '#212121';
    context.fillRect(0, 0, canvas.width, canvas.height);
   
    drawMatrix(arena, {x: 0, y:0});
    drawMatrix(player.matrix, player.pos);    
}

//Draws the 2D matrix onto the canvas, including arena and player piece
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x)  => {
            if(value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

//Once piece has been placed, save piece values in arena matrix
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

var dropSpeed = 1;

//Moves piece down every second/when player input is given
//If the piece collides with the arena, move player piece back one space and merge the arena
//Reset the player piece and check if lines were cleared
function playerDrop() {
    player.pos.y += dropSpeed;
  
    if(collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        canHold = true;
    }

    dropCounter = 0;
}

//Piece hold functionality common in most modern tetris games
//Able to hold one piece for later use
//If there is no current piece held, take that piece and save it in holdPiece
//Else, replace current piece with the held piece, and hold said current piece
//Cannot hold again until the next piece is placed after holding once
let holdPiece = '';
let canHold = true;

function playerHold() {
  if (!canHold) {
    return;
  }

  hold.play();
  const temp = current;
  if (holdPiece === '') {
    holdPiece = current;
    playerReset();
  } else {
    currentpieces.unshift(holdPiece);
    playerReset();
    holdPiece = temp;
  }
  document.querySelector('#holdpiece').innerHTML = holdPiece;
  canHold = false;
}

//Hard drop functionality common in most modern tetris games
//Drops player piece to the lowest possible place on arena before it makes a collision
//Similar in functionality to playerDrop()
function playerHardDrop() {
    harddrop.play();
    while(!collide(arena, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
    canHold = true;
    dropCounter = 0;
}

//Moves player piece given a direction from user input
function playerMove(dir) {
    player.pos.x += dir;
    if(collide(arena, player)) {
        player.pos.x -= dir;
    }
    else move.play();
}

//Pauses gameplay when Enter key is pressed, sets drop speed of player piece to 0 when paused,
//Back to 1 when unpaused. All movement/player input is restricted when game is paused

pstxt = "UNPAUSED"

function updatePause(){
  document.querySelector('#pstxt').innerHTML = pstxt;
}

var isPaused = false;
function playerPause() {
    if(isPaused !== true){
        dropSpeed = 0;
        isPaused = true;
        pstxt = "PAUSED";
        updatePause();
    }
    else{
        dropSpeed = 1;
        isPaused = false;
        pstxt = "UNPAUSED";
        updatePause();
    }

}


//Random sort to rearrange array of characters used to determine the next set of pieces to be placed
function randomsort() {
    return Math.random() > .5 ? -1 : 1;
};


//Variables used for 7-bag randomizer of pieces to be placed
//Ensures that every piece is used at least once before the same piece is created
const pieces = 'ILJTOSZ';
var nextpieces = pieces.split('').sort(randomsort);
var currentpieces = pieces.split('').sort(randomsort);

var current = '';
function playerReset() {
    player.matrix = createPiece(currentpieces[0]);
    current = currentpieces[0];
    currentpieces.splice(0, 1);

    document.querySelector('#nextpiece').innerHTML = currentpieces[0];

    //If currentpieces array gets too short, add the next 7 pieces to be used
    //and renew the nextpieces array with another 7 random pieces
    if(currentpieces.length < 3){
        for(var i = 0; i < nextpieces.length; i++){
            currentpieces.push(nextpieces[i]);
        }
        nextpieces = pieces.split('').sort(randomsort);
    }

    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);


    //If you reach top of the screen, reset everything
    if(collide(arena, player)) {
        lose.play();
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();

        nextpieces = pieces.split('').sort(randomsort);
        currentpieces = pieces.split('').sort(randomsort);
        
        player.matrix = createPiece(currentpieces[0]);
        current = currentpieces[0];
        currentpieces.splice(0, 1);
        document.querySelector('#nextpiece').innerHTML = currentpieces[0];
        holdPiece = '';
        document.querySelector('#holdpiece').innerHTML = holdPiece;
    }
}

//Rotates player piece depending on input given by player,
//Will not rotate if it causes a collision and is not able to do so even with an offset
function playerRotate(dir) {
    const pos = player.pos.x;
    var offset = 1;
    rotate(player.matrix, dir);
    
    while(collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }

    if(!collide(arena, player)) {
        rotating.play();
    }
}

//Rotation algorithm for pieces
function rotate(matrix, dir) {
    for(var y = 0; y < matrix.length; y++){
        for(var x = 0; x < y; x++){
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if(dir > 0) {
        matrix.forEach(row => row.reverse());
    }
    else {
        matrix.reverse();
    }
}

/*function trickle(){
  
  player.score += (speedtext)
  var intervalId = window.setInterval(function(){
    trickle();
    }, 1000);
 
  updateScore();
}*/

//function to change speeds

var customspeed = 1300
var speedtext = 5

function updateSpeed(){
    document.querySelector('#speed').innerHTML = speedtext;
}
        
function slowdown(){
  if (customspeed <= 2200) {
      customspeed += 300
      speedtext -= 1
      updateSpeed();
  }

}

function speedup(){
  if (customspeed >= 400) {
    customspeed -= 300
    speedtext += 1
    updateSpeed();
  }

}

//Function that animates the game, updates every second

var dropCounter = 1;
var dropInterval = 1500;
var lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if(dropCounter > customspeed) {
        playerDrop();
    }
  
    draw();
    requestAnimationFrame(update);
}



//manual reset
function quit(){
  lose.play();
  arena.forEach(row => row.fill(0));
  player.score = 0;
  updateScore();

  nextpieces = pieces.split('').sort(randomsort);
  currentpieces = pieces.split('').sort(randomsort);
        
  player.matrix = createPiece(currentpieces[0]);
  current = currentpieces[0];
  currentpieces.splice(0, 1);
  document.querySelector('#nextpiece').innerHTML = currentpieces[0];
  holdPiece = '';
  document.querySelector('#holdpiece').innerHTML = holdPiece;
}

//Sets the current score and highscore whenever a line is cleared
function updateScore() {
    document.querySelector('#score').innerHTML = player.score;
    if(player.score > player.highscore){
        player.highscore = player.score;
    }
    document.querySelector('#highscore').innerHTML = player.highscore;
}

const arena = createMatrix(10, 20);


const colors = [
    null,
    '#D500F9',
    '#FFEA00',
    '#FF9100',
    '#3D5AFE',
    '#76FF03',
    '#FF1744',
    '#00E5FF',
]

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
    highscore: 0,
}

document.addEventListener('keydown', event => {
    if(isPaused !== true){
        if(event.keyCode === 37){
            playerMove(-1);
        }
        else if(event.keyCode === 39){
            playerMove(1);
        }
        else if(event.keyCode === 40){
            playerDrop();
        }
        else if(event.keyCode === 90 || event.keyCode === 17) {
            playerRotate(-1);
        }
        else if(event.keyCode === 88 || event.keyCode === 38) {
            playerRotate(1);
        }
        else if(event.keyCode === 67 || event.keyCode === 16) {
            playerHold();
        }
        else if(event.keyCode === 32) {
            playerHardDrop();
        }
    }
});
     
document.addEventListener('keypress', event => {
    if(event.keyCode === 13){
        pauseSound.play();
        playerPause();
    }
});

document.addEventListener('keypress', event => {
    if (event.keyCode === 48) {
      quit();
      playerReset();
    }
});

document.addEventListener('keypress', event => {
    if (event.keyCode === 50) {
      speedup();
    }
});

document.addEventListener('keypress', event => {
    if (event.keyCode === 49) {
      slowdown();
    }
});


document.addEventListener('keydown', event => {
    if(event.keyCode === 77){
        musicPlay();
    }
});


var clear, harddrop, hold, lose, move, rotating;
var flamingo;
var pauseSound;
function loadSounds() {
    clear = new Audio('sounds/clear.mp3');
    clear.volume = .9;

    harddrop = new Audio('sounds/harddrop.mp3');
    harddrop.volume = .9;

    hold = new Audio('sounds/hold.mp3');
    hold.volume = .9;

    lose = new Audio('sounds/lose.mp3');
    lose.volume = .7;

    move = new Audio('sounds/move.mp3');
    move.volume = .9;

    rotating = new Audio('sounds/rotate.mp3');
    rotating.volume = .9;

    pauseSound = new Audio('sounds/pause.mp3');
    pauseSound.volume = .9;

    flamingo = new Audio('sounds/flamingo.mp3');
    flamingo.volume = .40;
    flamingo.loop = true;
}

var musicPlaying = false;
function musicPlay() {
    console.log("it should be doing something");

    if(musicPlaying !== true){
        flamingo.play();
        musicPlaying = true;
    }    
    else{
        flamingo.pause();
        musicPlaying = false;
    }
}

function init() {
    loadSounds();
    updateScore();
    playerReset();
    update();
    updateSpeed();
    updatePause();
   // trickle();
}

window.onload = init;