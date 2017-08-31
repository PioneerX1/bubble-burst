import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Score } from '../score.model';
import { ScoreService } from '../score.service';



@Component({
  selector: '[app-game]',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [ScoreService]
})


export class GameComponent implements AfterViewInit {
  canvas;
  context:CanvasRenderingContext2D;
  bubbleimage;

  lastframe = 0;
  fpstime = 0;
  framecount = 0;
  fps = 0;

  tframe = 0;

  formRejected=false;
  formOpen = false;
  initialized = false;

  // Level
  level = {
        x: 4,           // X position
        y: 83,          // Y position
        width: 0,       // Width, gets calculated
        height: 0,      // Height, gets calculated
        columns: 15,    // Number of tile columns
        rows: 14,       // Number of tile rows
        tilewidth: 40,  // Visual width of a tile
        tileheight: 40, // Visual height of a tile
        rowheight: 34,  // Height of a row
        radius: 20,     // Bubble collision radius
        tiles: []       // The two-dimensional tile array
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

  loadcount = 0;
  loadtotal = 0;
  preloaded = true;

  // set to true when no tiles are left
  winner=false;

  formClosed=false; // true when user closes form after winning game, resets with new game.
  formTimer;

  @ViewChild("myCanvas") myCanvas;


  constructor(private router: Router, private scoreService: ScoreService) { }

  ngAfterViewInit() {
    let canvas = this.myCanvas.nativeElement;
    this.context = canvas.getContext("2d");


    // Define a tile class
    var Tile = function(x, y, type, shift) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.removed = false;
        this.shift = shift;
        this.velocity = 0;
        this.alpha = 1;
        this.processed = false;
    };



    // Images
    var images = [];
    var bubbleimage;

    // Image loading global variables

    this.context.fillStyle = "#ffffff";
    this.context.fillRect(0, 0, canvas.width, canvas.height);

    this.bubbleimage = new Image();
    this.bubbleimage.src = "../assets/images/planets-sprite-sm.png";

    setTimeout(function(){
      this.context.drawImage(this.bubbleimage, 0, 100);

    }.bind(this), 10);

    for (var i=0; i<this.level.columns; i++) {
                this.level.tiles[i] = [];
                for (var j=0; j<this.level.rows; j++) {
                    // Define a tile type and a shift parameter for animation
                    this.level.tiles[i][j] = new Tile(i, j, 0, 0);
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
            this.main(0);

  }

  // Main loop
    main(tframe) {

      // for test
        if (this.framecount % 6==0){
          console.log(this.turncounter);
        }

        // Request animation frames

        window.requestAnimationFrame(this.main.bind(this));
        // test


        let canvas = this.myCanvas.nativeElement;
        this.context = canvas.getContext("2d");


        if(this.winner && !this.formRejected && !this.formOpen) {
          this.formOpen = true;
          this.formTimer = setTimeout(function(){this.openForm();}.bind(this), 3000);
        } // close form handled by click event in html

        if (!this.initialized) {
            // Preloader

            // Clear the canvas
            this.context.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the frame
            this.drawFrame();

            // Draw a progress bar
            let loadpercentage = this.loadcount/this.loadtotal;
            this.context.strokeStyle = "#ff8080";
            this.context.lineWidth=3;
            this.context.strokeRect(18.5, 0.5 + canvas.height - 51, canvas.width-37, 32);
            this.context.fillStyle = "#ff8080";
            this.context.fillRect(18.5, 0.5 + canvas.height - 51, loadpercentage*(canvas.width-37), 32);

            // Draw the progress text
            let loadtext = "Loaded " + this.loadcount + "/" + this.loadtotal + " images";
            this.context.fillStyle = "#000000";
            this.context.font = "16px Verdana";
            this.context.fillText(loadtext, 18, 0.5 + canvas.height - 63);

            if (this.preloaded) {
                // Add a delay for demonstration purposes
                setTimeout(function(){this.initialized = true;}.bind(this), 60);
            }
        } else {
            // Update and render the game
            this.update(tframe);
            this.render();
        }
    }

    // Update the game state
    update(tframe) {
        var dt = (tframe - this.lastframe) / 1000;
        this.lastframe = tframe;

        // Update the fps counter
        this.updateFps(dt);

        if (this.gamestate == this.gamestates.ready) {
            // Game is ready for player input
        } else if (this.gamestate == this.gamestates.shootbubble) {
            // Bubble is moving
            this.stateShootBubble(dt);
        } else if (this.gamestate == this.gamestates.removecluster) {
            // Remove cluster and drop tiles
            this.stateRemoveCluster(dt);
        }
    }

    setGameState(newgamestate) {
        this.gamestate = newgamestate;

        this.animationstate = 0;
        this.animationtime = 0;
    }

    stateShootBubble(dt) {
        // Bubble is moving

        // Move the bubble in the direction of the mouse
        this.player.bubble.x += dt * this.player.bubble.speed * Math.cos(this.degToRad(this.player.bubble.angle));
        this.player.bubble.y += dt * this.player.bubble.speed * -1*Math.sin(this.degToRad(this.player.bubble.angle));

        // Handle left and right collisions with the level
        if (this.player.bubble.x <= this.level.x) {
            // Left edge
            this.player.bubble.angle = 180 - this.player.bubble.angle;
            this.player.bubble.x = this.level.x;
        } else if (this.player.bubble.x + this.level.tilewidth >= this.level.x + this.level.width) {
            // Right edge
            this.player.bubble.angle = 180 - this.player.bubble.angle;
            this.player.bubble.x = this.level.x + this.level.width - this.level.tilewidth;
        }

        // Collisions with the top of the level
        if (this.player.bubble.y <= this.level.y) {
            // Top collision
            this.player.bubble.y = this.level.y;
            this.snapBubble();
            return;
        }

        // Collisions with other tiles
        for (var i=0; i<this.level.columns; i++) {
            for (var j=0; j<this.level.rows; j++) {
                var tile = this.level.tiles[i][j];

                // Skip empty tiles
                if (tile.type < 0) {
                    continue;
                }

                // Check for intersections
                var coord = this.getTileCoordinate(i, j);
                if (this.circleIntersection(this.player.bubble.x + this.level.tilewidth/2,
                                       this.player.bubble.y + this.level.tileheight/2,
                                       this.level.radius,
                                       coord.tilex + this.level.tilewidth/2,
                                       coord.tiley + this.level.tileheight/2,
                                       this.level.radius)) {

                    // Intersection with a level bubble
                    this.snapBubble();
                    return;
                }
            }
        }
    }

    stateRemoveCluster(dt) {
        if (this.animationstate == 0) {
            this.resetRemoved();

            // Mark the tiles as removed
            for (var i=0; i<this.cluster.length; i++) {
                // Set the removed flag
                this.cluster[i].removed = true;
            }

            // Add cluster score
            this.score += this.cluster.length * 100;

            // Find floating clusters
            this.floatingclusters = this.findFloatingClusters();

            if (this.floatingclusters.length > 0) {
                // Setup drop animation
                for (var i=0; i<this.floatingclusters.length; i++) {
                    for (var j=0; j<this.floatingclusters[i].length; j++) {
                        var tile = this.floatingclusters[i][j];
                        tile.shift = 0;
                        tile.shift = 1;
                        tile.velocity = this.player.bubble.dropspeed;

                        this.score += 100;
                    }
                }
            }

            this.animationstate = 1;
        }

        if (this.animationstate == 1) {
            // Pop bubbles
            var tilesleft = false;
            for (var i=0; i<this.cluster.length; i++) {
                var tile = this.cluster[i];

                if (tile.type >= 0) {
                    tilesleft = true;

                    // Alpha animation
                    tile.alpha -= dt * 15;
                    if (tile.alpha < 0) {
                        tile.alpha = 0;
                    }

                    if (tile.alpha == 0) {
                        tile.type = -1;
                        tile.alpha = 1;
                    }
                }
            }

            // Drop bubbles
            for (var i=0; i<this.floatingclusters.length; i++) {
                for (var j=0; j<this.floatingclusters[i].length; j++) {
                    var tile = this.floatingclusters[i][j];

                    if (tile.type >= 0) {
                        tilesleft = true;

                        // Accelerate dropped tiles
                        tile.velocity += dt * 700;
                        tile.shift += dt * tile.velocity;

                        // Alpha animation
                        tile.alpha -= dt * 8;
                        if (tile.alpha < 0) {
                            tile.alpha = 0;
                        }

                        // Check if the bubbles are past the bottom of the level
                        if (tile.alpha == 0 || (tile.y * this.level.rowheight + tile.shift > (this.level.rows - 1) * this.level.rowheight + this.level.tileheight)) {
                            tile.type = -1;
                            tile.shift = 0;
                            tile.alpha = 1;
                        }
                    }

                }
            }

            if (!tilesleft) {
                // Next bubble
                this.nextBubble();

                // Check for game over
                var tilefound = false
                for (var i=0; i<this.level.columns; i++) {
                    for (var j=0; j<this.level.rows; j++) {
                        if (this.level.tiles[i][j].type != -1) {
                            tilefound = true;
                            break;
                        }
                    }
                }

                if (tilefound) {
                    this.setGameState(this.gamestates.ready);
                } else {
                    // No tiles left, game over
                    this.winner=true;
                    this.setGameState(this.gamestates.gameover);
                }
            }
        }
    }

    // Snap bubble to the grid
    snapBubble() {
        // Get the grid position
        var centerx = this.player.bubble.x + this.level.tilewidth/2;
        var centery = this.player.bubble.y + this.level.tileheight/2;
        var gridpos = this.getGridPosition(centerx, centery);

        // Make sure the grid position is valid
        if (gridpos.x < 0) {
            gridpos.x = 0;
        }

        if (gridpos.x >= this.level.columns) {
            gridpos.x = this.level.columns - 1;
        }

        if (gridpos.y < 0) {
            gridpos.y = 0;
        }

        if (gridpos.y >= this.level.rows) {
            gridpos.y = this.level.rows - 1;
        }

        // Check if the tile is empty
        var addtile = false;
        if (this.level.tiles[gridpos.x][gridpos.y].type != -1) {
            // Tile is not empty, shift the new tile downwards
            for (var newrow=gridpos.y+1; newrow<this.level.rows; newrow++) {
                if (this.level.tiles[gridpos.x][newrow].type == -1) {
                    gridpos.y = newrow;
                    addtile = true;
                    break;
                }
            }
        } else {
            addtile = true;
        }

        // Add the tile to the grid
        if (addtile) {
            // Hide the player bubble
            this.player.bubble.visible = false;

            // Set the tile
            this.level.tiles[gridpos.x][gridpos.y].type = this.player.bubble.tiletype;

            // Check for game over
            if (this.checkGameOver()) {
                return;
            }

            // Find clusters
            this.cluster = this.findCluster(gridpos.x, gridpos.y, true, true, false);

            if (this.cluster.length >= 3) {
                // Remove the cluster
                this.setGameState(this.gamestates.removecluster);
                return;
            }
        }

        // No clusters found
        this.turncounter++;
        if (this.turncounter >= 5) {
            // Add a row of bubbles
            this.addBubbles();
            this.turncounter = 0;
            this.rowoffset = (this.rowoffset + 1) % 2;

            if (this.checkGameOver()) {
                return;
            }
        }

        // Next bubble
        this.nextBubble();
        this.setGameState(this.gamestates.ready);
    }

    checkGameOver() {
        // Check for game over
        for (var i=0; i<this.level.columns; i++) {
            // Check if there are bubbles in the bottom row
            if (this.level.tiles[i][this.level.rows-1].type != -1) {
                // Game over
                this.nextBubble();
                this.setGameState(this.gamestates.gameover);
                return true;
            }
        }

        return false;
    }

    addBubbles() {
        // Move the rows downwards
        for (var i=0; i<this.level.columns; i++) {
            for (var j=0; j<this.level.rows-1; j++) {
                this.level.tiles[i][this.level.rows-1-j].type = this.level.tiles[i][this.level.rows-1-j-1].type;
            }
        }

        // Add a new row of bubbles at the top
        for (var i=0; i<this.level.columns; i++) {
            // Add random, existing, colors
            this.level.tiles[i][0].type = this.getExistingColor();
        }
    }

    // Find the remaining colors
    findColors() {
        var foundcolors = [];
        var colortable = [];
        for (var i=0; i<this.bubblecolors; i++) {
            colortable.push(false);
        }

        // Check all tiles
        for (var i=0; i<this.level.columns; i++) {
            for (var j=0; j<this.level.rows; j++) {
                var tile = this.level.tiles[i][j];
                if (tile.type >= 0) {
                    if (!colortable[tile.type]) {
                        colortable[tile.type] = true;
                        foundcolors.push(tile.type);
                    }
                }
            }
        }

        return foundcolors;
    }

    // Find cluster at the specified tile location
    findCluster(tx, ty, matchtype, reset, skipremoved) {
        // Reset the processed flags
        if (reset) {
            this.resetProcessed();
        }

        // Get the target tile. Tile coord must be valid.
        var targettile = this.level.tiles[tx][ty];

        // Initialize the toprocess array with the specified tile
        var toprocess = [targettile];
        targettile.processed = true;
        var foundcluster = [];

        while (toprocess.length > 0) {
            // Pop the last element from the array
            var currenttile = toprocess.pop();

            // Skip processed and empty tiles
            if (currenttile.type == -1) {
                continue;
            }

            // Skip tiles with the removed flag
            if (skipremoved && currenttile.removed) {
                continue;
            }

            // Check if current tile has the right type, if matchtype is true
            if (!matchtype || (currenttile.type == targettile.type)) {
                // Add current tile to the cluster
                foundcluster.push(currenttile);

                // Get the neighbors of the current tile
                var neighbors = this.getNeighbors(currenttile);

                // Check the type of each neighbor
                for (var i=0; i<neighbors.length; i++) {
                    if (!neighbors[i].processed) {
                        // Add the neighbor to the toprocess array
                        toprocess.push(neighbors[i]);
                        neighbors[i].processed = true;
                    }
                }
            }
        }

        // Return the found cluster
        return foundcluster;
    }

    // Find floating clusters
    findFloatingClusters() {
        // Reset the processed flags
        this.resetProcessed();

        var foundclusters = [];

        // Check all tiles
        for (var i=0; i<this.level.columns; i++) {
            for (var j=0; j<this.level.rows; j++) {
                var tile = this.level.tiles[i][j];
                if (!tile.processed) {
                    // Find all attached tiles
                    var foundcluster = this.findCluster(i, j, false, false, true);

                    // There must be a tile in the cluster
                    if (foundcluster.length <= 0) {
                        continue;
                    }

                    // Check if the cluster is floating
                    var floating = true;
                    for (var k=0; k<foundcluster.length; k++) {
                        if (foundcluster[k].y == 0) {
                            // Tile is attached to the roof
                            floating = false;
                            break;
                        }
                    }

                    if (floating) {
                        // Found a floating cluster
                        foundclusters.push(foundcluster);
                    }
                }
            }
        }

        return foundclusters;
    }

    // Reset the processed flags
        resetProcessed() {
            for (var i=0; i<this.level.columns; i++) {
                for (var j=0; j<this.level.rows; j++) {
                    this.level.tiles[i][j].processed = false;
                }
            }
        }

        // Reset the removed flags
        resetRemoved() {
            for (var i=0; i<this.level.columns; i++) {
                for (var j=0; j<this.level.rows; j++) {
                    this.level.tiles[i][j].removed = false;
                }
            }
        }

        // Get the neighbors of the specified tile
        getNeighbors(tile) {
            var tilerow = (tile.y + this.rowoffset) % 2; // Even or odd row
            var neighbors = [];

            // Get the neighbor offsets for the specified tile
            var n = this.neighborsoffsets[tilerow];

            // Get the neighbors
            for (var i=0; i<n.length; i++) {
                // Neighbor coordinate
                var nx = tile.x + n[i][0];
                var ny = tile.y + n[i][1];

                // Make sure the tile is valid
                if (nx >= 0 && nx < this.level.columns && ny >= 0 && ny < this.level.rows) {
                    neighbors.push(this.level.tiles[nx][ny]);
                }
            }

            return neighbors;
        }

        updateFps(dt) {

            if (this.fpstime > 0.25) {
                // Calculate fps
                this.fps = Math.round(this.framecount / this.fpstime);

                // Reset time and framecount
                this.fpstime = 0;
                this.framecount = 0;
            }

            // Increase time and framecount
            this.fpstime += dt;
            this.framecount++;
        }

        // Draw text that is centered
        drawCenterText(text, x, y, width) {

            var textdim = this.context.measureText(text);
            this.context.fillText(text, x + (width-textdim.width)/2, y);
        }

        render() {
          // Draw the frame around the game
          this.drawFrame();

          var yoffset =  this.level.tileheight/2;

          // Draw level background
          this.context.fillStyle = "#8c8c8c";
          this.context.fillRect(this.level.x - 4, this.level.y - 4, this.level.width + 8, this.level.height + 4 - yoffset);

          // Render tiles
          this.renderTiles();

          // Draw level bottom
          this.context.fillStyle = "#656565";
          this.context.fillRect(this.level.x - 4, this.level.y - 4 + this.level.height + 4 - yoffset, this.level.width + 8, 2*this.level.tileheight + 3);

          // Draw score
          this.context.fillStyle = "#ffffff";
          this.context.font = "18px Verdana";
          var scorex = this.level.x + this.level.width - 150;
          var scorey = this.level.y+this.level.height + this.level.tileheight - yoffset - 8;
          this.drawCenterText("Score:", scorex, scorey, 150);
          this.context.font = "24px Verdana";
          this.drawCenterText(this.score, scorex, scorey+30, 150);

          // Render cluster
          if (this.showcluster) {
              this.renderCluster(this.cluster, 255, 128, 128);

              for (var i=0; i<this.floatingclusters.length; i++) {
                  var col = Math.floor(100 + 100 * i / this.floatingclusters.length);
                  this.renderCluster(this.floatingclusters[i], col, col, col);
              }
          }


          // Render player bubble
          this.renderPlayer();

          // Game Over overlay
          if (this.gamestate == this.gamestates.gameover) {
            let winnerText = "";
            this.context.fillStyle = "rgba(0, 0, 0, 0.8)";
            this.context.fillRect(this.level.x - 4, this.level.y - 4, this.level.width + 8, this.level.height + 2 * this.level.tileheight + 8 - yoffset);

            this.context.fillStyle = "#ffffff";
            this.context.font = "24px Verdana";
            if(this.winner){
              winnerText += "You won!"
            } else {
              winnerText += "You lost!"
            }
            this.drawCenterText(winnerText, this.level.x, this.level.y + this.level.height / 2 + 10, this.level.width);
            this.drawCenterText("Click to start", this.level.x, this.level.y + this.level.height / 2 + 40, this.level.width);


          }
      }

    // Draw a frame around the game
    drawFrame() {
        let canvas = this.myCanvas.nativeElement;

        // Draw background
        this.context.fillStyle = "#e8eaec";
        this.context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw header
        this.context.fillStyle = "#303030";
        this.context.fillRect(0, 0, canvas.width, 79);

        // Draw title
        this.context.fillStyle = "#ffffff";
        this.context.font = "24px Verdana";
        this.context.fillText("Destroyer of Worlds!", 10, 37);

        // Display fps
        this.context.fillStyle = "#ffffff";
        this.context.font = "12px Verdana";
        this.context.fillText("Fps: " + this.fps, 13, 57);
    }

    // Render tiles
    renderTiles() {
        // Top to bottom
        for (var j=0; j<this.level.rows; j++) {
            for (var i=0; i<this.level.columns; i++) {
                // Get the tile
                var tile = this.level.tiles[i][j];

                // Get the shift of the tile for animation
                var shift = tile.shift;

                // Calculate the tile coordinates
                var coord = this.getTileCoordinate(i, j);

                // Check if there is a tile present
                if (tile.type >= 0) {
                    // Support transparency
                    this.context.save();
                    this.context.globalAlpha = tile.alpha;

                    // Draw the tile using the color
                    this.drawBubble(coord.tilex, coord.tiley + shift, tile.type);

                    this.context.restore();
                }
            }
        }
    }

    // Render cluster
        renderCluster(cluster, r, g, b) {
            for (var i=0; i<cluster.length; i++) {
                // Calculate the tile coordinates
                var coord = this.getTileCoordinate(cluster[i].x, cluster[i].y);

                // Draw the tile using the color
                this.context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                this.context.fillRect(coord.tilex+this.level.tilewidth/4, coord.tiley+this.level.tileheight/4, this.level.tilewidth/2, this.level.tileheight/2);
            }
        }

        // Render the player bubble
        renderPlayer() {
            var centerx = this.player.x + this.level.tilewidth/2;
            var centery = this.player.y + this.level.tileheight/2;

            // Draw player background circle
            this.context.fillStyle = "#7a7a7a";
            this.context.beginPath();
            this.context.arc(centerx, centery, this.level.radius+12, 0, 2*Math.PI, false);
            this.context.fill();
            this.context.lineWidth = 2;
            this.context.strokeStyle = "#8c8c8c";
            this.context.stroke();

            // Draw the angle
            this.context.lineWidth = 2;
            this.context.strokeStyle = "#0000ff";
            this.context.beginPath();
            this.context.moveTo(centerx, centery);
            this.context.lineTo(centerx + 1.5*this.level.tilewidth * Math.cos(this.degToRad(this.player.angle)), centery - 1.5*this.level.tileheight * Math.sin(this.degToRad(this.player.angle)));
            this.context.stroke();

            // Draw the next bubble
            this.drawBubble(this.player.nextbubble.x, this.player.nextbubble.y, this.player.nextbubble.tiletype);

            // Draw the bubble
            if (this.player.bubble.visible) {
                this.drawBubble(this.player.bubble.x, this.player.bubble.y, this.player.bubble.tiletype);
            }

        }

        // Get the tile coordinate
        getTileCoordinate(column, row) {
            var tilex = this.level.x + column * this.level.tilewidth;

            // X offset for odd or even rows
            if ((row + this.rowoffset) % 2) {
                tilex += this.level.tilewidth/2;
            }

            var tiley = this.level.y + row * this.level.rowheight;
            return { tilex: tilex, tiley: tiley };
        }

        // Get the closest grid position
        getGridPosition(x, y) {
            var gridy = Math.floor((y - this.level.y) / this.level.rowheight);

            // Check for offset
            var xoffset = 0;
            if ((gridy + this.rowoffset) % 2) {
                xoffset = this.level.tilewidth / 2;
            }
            var gridx = Math.floor(((x - xoffset) - this.level.x) / this.level.tilewidth);

            return { x: gridx, y: gridy };
        }


        // Draw the bubble
        drawBubble(x, y, index) {
            if (index < 0 || index >= this.bubblecolors)
                return;

            // Draw the bubble sprite
            this.context.drawImage(this.bubbleimage, index * 40, 0, 40, 40, x, y, this.level.tilewidth, this.level.tileheight);
            // this.context.drawImage(this.bubbleimage, index * 80, 0, 80, 80, x, y, this.level.tilewidth, this.level.tileheight);
        }

        // Start a new game
        newGame() {
        if(this.winner && !this.formRejected) {
          clearTimeout(this.formTimer);
        }

        this.winner = false;
        this.formRejected = false;
        this.formOpen = false;


            // Reset score
            this.score = 0;

            this.turncounter = 0;
            this.rowoffset = 0;

            // Set the gamestate to ready
            this.setGameState(this.gamestates.ready);

            // Create the level
            this.createLevel();

            // Init the next bubble and set the current bubble
            this.nextBubble();
            this.nextBubble();
        }

        // Create a random level
        createLevel() {
            // Create a level with random tiles
            for (var j=0; j<this.level.rows; j++) {
                var randomtile = this.randRange(0, this.bubblecolors-1);
                var count = 0;
                for (var i=0; i<this.level.columns; i++) {
                    if (count >= 2) {
                        // Change the random tile
                        var newtile = this.randRange(0, this.bubblecolors-1);

                        // Make sure the new tile is different from the previous tile
                        if (newtile == randomtile) {
                            newtile = (newtile + 1) % this.bubblecolors;
                        }
                        randomtile = newtile;
                        count = 0;
                    }
                    count++;

                    if (j < this.level.rows/2) {
                        this.level.tiles[i][j].type = randomtile;
                    } else {
                        this.level.tiles[i][j].type = -1;
                    }
                }
            }
        }

        // Create a random bubble for the player
        nextBubble() {
            // Set the current bubble
            this.player.tiletype = this.player.nextbubble.tiletype;
            this.player.bubble.tiletype = this.player.nextbubble.tiletype;
            this.player.bubble.x = this.player.x;
            this.player.bubble.y = this.player.y;
            this.player.bubble.visible = true;

            // Get a random type from the existing colors
            var nextcolor = this.getExistingColor();

            // Set the next bubble
            this.player.nextbubble.tiletype = nextcolor;
        }

        // Get a random existing color
        getExistingColor() {
            var existingcolors = this.findColors();

            var bubbletype = 0;
            if (existingcolors.length > 0) {
                bubbletype = existingcolors[this.randRange(0, existingcolors.length-1)];
            }

            return bubbletype;
        }

        // Get a random int between low and high, inclusive
        randRange(low, high) {
            return Math.floor(low + Math.random()*(high-low+1));
        }

        // Shoot the bubble
        shootBubble() {
            // Shoot the bubble in the direction of the mouse
            this.player.bubble.x = this.player.x;
            this.player.bubble.y = this.player.y;
            this.player.bubble.angle = this.player.angle;
            this.player.bubble.tiletype = this.player.tiletype;

            // Set the gamestate
            this.setGameState(this.gamestates.shootbubble);
        }

        // Check if two circles intersect
        circleIntersection(x1, y1, r1, x2, y2, r2) {
            // Calculate the distance between the centers
            var dx = x1 - x2;
            var dy = y1 - y2;
            var len = Math.sqrt(dx * dx + dy * dy);

            if (len < r1 + r2) {
                // Circles intersect
                return true;
            }

            return false;
        }

        // Convert radians to degrees
        radToDeg(angle) {
            return angle * (180 / Math.PI);
        }

        // Convert degrees to radians
        degToRad(angle) {
            return angle * (Math.PI / 180);
        }

        private onMouseButton(event: MouseEvent): void {
        // Get the mouse position
        let canvas = this.myCanvas.nativeElement;
        let pos = this.getMousePos(canvas, event);

        if (this.gamestate == this.gamestates.ready) {

            this.shootBubble();
        } else if (this.gamestate == this.gamestates.gameover) {


            this.newGame();
        }

    }

    private onMouseMove(event: MouseEvent): void {
    let canvas = this.myCanvas.nativeElement;
    // Get the mouse position
    var pos = this.getMousePos(canvas, event);

    // Get the mouse angle
    var mouseangle = this.radToDeg(Math.atan2((this.player.y+this.level.tileheight/2) - pos.y, pos.x - (this.player.x+this.level.tilewidth/2)));

    // Convert range to 0, 360 degrees
    if (mouseangle < 0) {
        mouseangle = 180 + (180 + mouseangle);
    }

    // Restrict angle to 8, 172 degrees
    var lbound = 8;
    var ubound = 172;
    if (mouseangle > 90 && mouseangle < 270) {
        // Left
        if (mouseangle > ubound) {
            mouseangle = ubound;
        }
    } else {
        // Right
        if (mouseangle < lbound || mouseangle >= 270) {
            mouseangle = lbound;
        }
    }

    // Set the player angle
    this.player.angle = mouseangle;
    }

    // Get the mouse position
    getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
            y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
        };
    }

    openForm() {
        document.getElementById("myNav").style.height = "100%";
    }

    closeForm(e) {

        this.formRejected=true;
        this.formOpen=false;
        document.getElementById("myNav").style.height = "0%";
    }

    captureWinnerStats(name: string) {
      let newScore: Score = new Score(name, this.score);
      this.scoreService.addScore(newScore);
      this.router.navigate(['highscores']);
    }

}
