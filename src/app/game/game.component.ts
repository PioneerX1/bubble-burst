import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';


@Component({
  selector: '[app-game]',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent implements AfterViewInit {

  context:CanvasRenderingContext2D;

  // Image
  bubbleimage;

  // Timing and frames per second
    lastframe = 0;
    fpstime = 0;
    framecount = 0;
    fps = 0;

    initialized = false;

    // Level
    level = {
        x: 4,           // X position
        y: 83,          // Y position
        width: 0,       // Width, gets calculated
        height: 0,      // Height, gets calculated
        // columns: 15,    // Number of tile columns
        // rows: 14,       // Number of tile rows
        rows: 10,
        columns: 10,
        // tilewidth: 40,  // Visual width of a tile
        // tileheight: 40, // Visual height of a tile
        tilewidth: 80,
        tileheight: 80,
        // rowheight: 34,  // Height of a row
        // radius: 20,     // Bubble collision radius
        rowheight: 68,
        radius: 40,
        tiles: []       // The two-dimensional tile array
    };

    // Define a tile class
    Tile = function(x, y, type, shift) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.removed = false;
        this.shift = shift;
        this.velocity = 0;
        this.alpha = 1;
        this.processed = false;
    };

    // Player
    player = {
        x: 0,
        y: 0,
        angle: 0,
        tiletype: 0,
        bubble: {
                    x: 0,
                    y: 0,
                    angle: 0,
                    speed: 1000,
                    dropspeed: 900,
                    tiletype: 0,
                    visible: false
                },
        nextbubble: {
                        x: 0,
                        y: 0,
                        tiletype: 0
                    }
    };

    // Neighbor offset table
    neighborsoffsets = [[[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]], // Even row tiles
                            [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]]];  // Odd row tiles

    // Number of different colors
    bubblecolors = 7;

    // Game states
    gamestates = { init: 0, ready: 1, shootbubble: 2, removecluster: 3, gameover: 4 };
    gamestate = this.gamestates.init;

    // Score
    score = 0;

    turncounter = 0;
    rowoffset = 0;

    // Animation variables
    animationstate = 0;
    animationtime = 0;

    // Clusters
    showcluster = false;
    cluster = [];
    floatingclusters = [];




    // Image loading global variables
    loadcount = 0;
    loadtotal = 0;
    preloaded = false;

  @ViewChild("myCanvas") myCanvas;

  constructor() { }

  ngAfterViewInit() {
    let canvas = this.myCanvas.nativeElement;
    this.context = canvas.getContext("2d");
    this.context.fillStyle = "#ffffff";
    this.context.fillRect(0, 0, canvas.width, canvas.height);

    this.bubbleimage = new Image();
    this.bubbleimage.src = "../assets/images/planets-sprite.png";

    setTimeout(function(){
      this.context.drawImage(this.bubbleimage, 0, 0);
      this.context.drawImage(this.bubbleimage, 30, 46);
      this.context.drawImage(this.bubbleimage, 0, 0, 40, 40, 10, 90, 40, 40);
      this.context.drawImage(this.bubbleimage, 40, 0, 40, 40, 30, 130, 40, 40);
    }.bind(this), 10);

    for (var i=0; i<this.level.columns; i++) {
                this.level.tiles[i] = [];
                for (var j=0; j<this.level.rows; j++) {
                    // Define a tile type and a shift parameter for animation
                    this.level.tiles[i][j] = new this.Tile(i, j, 0, 0);
                }
            }

            this.level.width = this.level.columns * this.level.tilewidth + this.level.tilewidth/2;
            this.level.height = (this.level.rows-1) * this.level.rowheight + this.level.tileheight;

            // Init the player
            this.player.x = this.level.x + this.level.width/2 - this.level.tilewidth/2;
            this.player.y = this.level.y + this.level.height;
            this.player.angle = 90;
            this.player.tiletype = 0;

            this.player.nextbubble.x = this.player.x - 2 * this.level.tilewidth;
            this.player.nextbubble.y = this.player.y;

            // New game
            this.newGame();

            // Enter main loop
            this.main();




  }

  newGame() {alert("newGame");}

  main() {alert("main");}




}
