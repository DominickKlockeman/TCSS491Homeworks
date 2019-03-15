var audio = new Audio("music.mp3");

globalGrid = true;
globalPause = false;

globalCells = [];

globalCount = 0.2;

function Board(game) {
  this.game = game;
  this.cells = [];
  this.clearBoard = false;
  this.grid = globalGrid;
  Entity.call(this, game, 0, 0);
  this.count = 0;
  this.maxCount = 0.2;
}

Board.prototype = new Entity();
Board.prototype.constructor = Board;

Board.prototype.update = function() {
  this.maxCount = globalCount;

  if (this.count > this.maxCount) {
    this.count = 0;

    var result = [];

    for (var i = 0; i < 40; i++) {
      result[i] = [];
    }

    for (i = 0; i < 40; i++) {
      for (j = 0; j < 40; j++) {
        alive = 0;
        count = numNeighbors(this.cells, i, j);

        if (this.cells[i][j] > 0) {
          alive = count === 2 || count === 3 ? 1 : 0;
        } else {
          alive = count === 3 ? 1 : 0;
        }

        result[i][j] = alive;
      }
    }

    this.cells = result;
  } else {
    this.count += this.game.clockTick;
    globalCells = this.cells;
  }
};

Board.prototype.draw = function(ctx) {
  ctx.rect(0, 0, 800, 800);
  ctx.stroke();
  for (i = 0; i < 40; i++) {
    for (j = 0; j < 40; j++) {
      ctx.beginPath();
      ctx.rect(i * 20, j * 20, 20, 20);
      if (this.cells[i][j] == 1) {
        ctx.fill();
      }
      if (this.game.grid) {
        ctx.stroke();
      }
    }
  }
};

Board.prototype.init = function() {
  audio.play();

  for (var i = 0; i < 40; i++) {
    this.cells[i] = [];
    for (var j = 0; j < 40; j++) {
      this.cells[i][j] = 0;
    }
  }

  this.cells[1][6] = 1;
  this.cells[2][5] = 1;
  this.cells[2][6] = 1;
  this.cells[11][5] = 1;
  this.cells[11][6] = 1;
  this.cells[11][7] = 1;
  this.cells[12][4] = 1;
  this.cells[12][8] = 1;
  this.cells[13][3] = 1;
  this.cells[13][9] = 1;
  this.cells[14][3] = 1;
  this.cells[14][9] = 1;
  this.cells[15][6] = 1;
  this.cells[16][4] = 1;
  this.cells[16][8] = 1;
  this.cells[17][5] = 1;
  this.cells[17][6] = 1;
  this.cells[17][7] = 1;
  this.cells[18][6] = 1;
  this.cells[21][3] = 1;
  this.cells[21][4] = 1;
  this.cells[21][5] = 1;
  this.cells[22][3] = 1;
  this.cells[22][4] = 1;
  this.cells[22][5] = 1;
  this.cells[23][2] = 1;
  this.cells[23][6] = 1;
  this.cells[25][1] = 1;
  this.cells[25][2] = 1;
  this.cells[25][6] = 1;
  this.cells[25][7] = 1;
  this.cells[35][3] = 1;
  this.cells[35][4] = 1;
  this.cells[36][3] = 1;
  this.cells[36][4] = 1;

  //diehard

  this.cells[10][30] = 1;
  this.cells[11][30] = 1;
  this.cells[11][31] = 1;
  this.cells[16][29] = 1;
  this.cells[15][31] = 1;
  this.cells[16][31] = 1;
  this.cells[17][31] = 1;
};

function cellAlive(cells, x, y) {
  if (x < 0 || x > 39) {
    return 0;
  }
  if (y < 0 || y > 39) {
    return 0;
  } else {
    return cells[x][y];
  }
}

function numNeighbors(cells, x, y) {
  var amount = 0;

  if (cellAlive(cells, x - 1, y - 1) == 1) {
    amount++;
  }
  if (cellAlive(cells, x, y - 1) == 1) {
    amount++;
  }
  if (cellAlive(cells, x + 1, y - 1) == 1) {
    amount++;
  }
  if (cellAlive(cells, x - 1, y) == 1) {
    amount++;
  }
  if (cellAlive(cells, x + 1, y) == 1) {
    amount++;
  }
  if (cellAlive(cells, x - 1, y + 1) == 1) {
    amount++;
  }
  if (cellAlive(cells, x, y + 1) == 1) {
    amount++;
  }
  if (cellAlive(cells, x + 1, y + 1) == 1) {
    amount++;
  }

  return amount;
}

function displayGrid() {
  globalGrid = !globalGrid;
}

function pauseLife() {
  globalPause = !globalPause;
}

function pauseMusic() {
  audio.pause();
}

function unpauseMusic() {
  audio.play();
}

function speedUp() {
  globalCount -= 0.01;
}

function slowDown() {
  globalCount += 0.01;
}

function changeYellow() {
  ctx.style = "yellow";
}

function changeBlack() {
  ctx.style = "black";
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.downloadAll(function() {
  console.log("starting up da sheild");
  var canvas = document.getElementById("gameWorld");
  var ctx = canvas.getContext("2d");

  var gameEngine = new GameEngine();
  var board = new Board(gameEngine);
  gameEngine.addEntity(board);
  gameEngine.init(ctx);
  board.init();
  gameEngine.start();

  var socket = io.connect("http://24.16.255.56:8888");

  socket.on("connect", function() {
    console.log("Socket connected.");
  });
  socket.on("disconnect", function() {
    console.log("Socket disconnected.");
  });
  socket.on("reconnect", function() {
    console.log("Socket reconnected.");
  });

  socket.on("load", function(data) {
    console.log(data);
  });

  var text = document.getElementById("text");
  var input = document.getElementById("savedState");
  var saveButton = document.getElementById("save");
  var loadButton = document.getElementById("load");

  saveButton.onclick = function() {
    console.log("save");
    text.innerHTML = "Saved.";
    socket.emit("save", {
      studentname: "Dominick Klockeman",
      statename: input,
      data: globalCells
    });
  };

  loadButton.onclick = function() {
    console.log("load");
    text.innerHTML = "Loaded.";
    socket.emit("load", {
      studentname: "Dominick Klockeman",
      statename: input
    });
  };

  socket.on("load", function(data) {
      console.log("hello");
    board.cells = data.data;
  })
});
