// the Game object used by the phaser.io library
var stateActions = { preload: preload, create: create, update: update };

var game = new Phaser.Game(790, 400, Phaser.AUTO, 'game', stateActions);
var score = 0;
var labelScore;
var player;
var pipes = [];
var firstTime = 1;
var splashDisplay;
var gameSpeed = 200;
var backgroundSprite;
var width = 790;
var height = 400;

$.get("/score", function(scores){
    scores.sort(function (scoreA, scoreB){
        var difference = scoreB.score - scoreA.score;
        return difference;
    });
    for (var i = 0; i < 5; i++) {
        $("#scoreBoard").append(
        "<li>" +
        scores[i].name + ": " + scores[i].score +
        "</li>");
    }
});

jQuery("#greeting-form").on("submit", function(event_details) {
    event_details.preventDefault();

    jQuery.ajax({url : '/score', type : 'post', data : $("#greeting-form").serialize()});

    var greeting = "Hello ";
    var name = jQuery("#fullName").val();
    var greeting_message = greeting + name + score;
    jQuery("#greeting-form").hide();
    jQuery("#greeting").append("<p>" + greeting_message + " (" +
    jQuery("#email").val() + "): " + jQuery("#score").val() + "</p>");

    // restart the game here
    score = 0;
    game.state.restart();
    $("#greeting").hide();
    // TODO: does not restart yet
    game.state.restart();

    $("#greeting").show();
});

function preload() {
    game.load.image("playerImg", "../assets/campervan.png");
    game.load.image("backgroundImg", "../assets/background.png");
    game.load.audio("score", "../assets/sound.mp3");
    game.load.image("pipe", "../assets/flower.png");
    game.load.image("birds1", "../assets/birds1.png");
    game.load.image("birds2", "../assets/birds2.png");
}

function create() {

    game.stage.setBackgroundColor("#E1C4FF");
    var background = game.add.image(0, 0, "backgroundImg");
    background.width = 790;
    background.height = 400;
    player = game.add.sprite(370, 200, "playerImg");
    player.width = 60;
    player.height = 35;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.enable(player);

    var backgroundVelocity = gameSpeed / 10;
    backgroundSprite = game.add.tileSprite(0,0,width,height,"birds1");
    backgroundSprite.autoScroll(-backgroundVelocity,0);

    var backgroundVelocity = -gameSpeed / 10;
    backgroundSprite = game.add.tileSprite(0,0,width,height,"birds2");
    backgroundSprite.autoScroll(-backgroundVelocity,0);

    game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
        .onDown.add(start);

    splashDisplay = game.add.text(180,200, "Press ENTER to start, SPACEBAR to jump",
                                 {font: "30px reprise script", fill: "#000000"});
}

function update() {
    for(var index=0; index<pipes.length; index++){
        game.physics.arcade
            .overlap(player,
        pipes[index],
        gameOver);
    }
    if (player.body.y>400)
    gameOver();

    player.rotation = Math.atan(player.body.velocity.y / 500);
}
function clickHandler(event) {
    alert("click!");
    alert("The position is: " + event.x + "," + event.y);
    game.add.sprite(event.x, event.y, "playerImg")
}
function spaceHandler() {
    game.sound.play("score");
}
function changeScore(){
    score++;
    labelScore.setText(score.toString());
}
function moveRight(){
    player.x = player.x + 10;
}
function moveLeft() {
    player.x = player.x - 10;
}
function moveUp() {
    player.y = player.y - 10;
}
function moveDown() {
    player.y = player.y + 10;
}
function generatePipe() {
    var gapStart = game.rnd.integerInRange(2, 5);
    var gapMargin = 50;
    var blockHeight = 50;
        for(var count = 0; count < 8; count++){
            if(count != gapStart && count != gapStart + 1){
                addPipeBlock(750, count*50);
            }
        }
    if (firstTime != 1) changeScore();
    else (firstTime = 0);
}

function addPipeBlock(x, y) {
    var pipeBlock = game.add.sprite(x,y,"pipe");
    pipes.push(pipeBlock);
    game.physics.arcade.enable(pipeBlock);
    pipeBlock.body.velocity.x = -150;
}
function playerJump() {
    player.body.velocity.y = -170;
}

function start() {
    game.input
        .keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        .onDown.add(spaceHandler);

    labelScore = game.add.text(20, 20, "0", {font: "30px reprise script", fill: "#000000"});



    player.body.velocity.x = 0;
    player.body.velocity.y = -150;
    player.body.gravity.y = 300;
    game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
        .onDown.add(moveRight);

    game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
        .onDown.add(moveLeft);

    game.input.keyboard.addKey(Phaser.Keyboard.UP)
        .onDown.add(moveUp);

    game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
        .onDown.add(moveDown);

   // generatePipe();

    game.input.keyboard
        .addKey(Phaser.Keyboard.SPACEBAR)
        .onDown.add(playerJump);

    pipeInterval = 2;
    game.time.events
        .loop(pipeInterval * Phaser.Timer.SECOND,
        generatePipe);

    game.physics.arcade.overlap(player, pipes, gameOver);

    player.anchor.setTo(0.5, 0.5);

    game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.remove(start);

    splashDisplay.destroy();
}

function gameOver() {
    $("#score").val(score);
    game.paused = true;
    $("#greeting").show();
}