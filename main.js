function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
}

BoundingBox.prototype.collide = function (oth) {
    if (this.right > oth.left && this.left < oth.right && this.top < oth.bottom && this.bottom > oth.top) return true;
    return false;
}

// no inheritance
function Background(game, spritesheet) {
    this.x = 00;
    this.y = 1;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    // Entity.call(this, game, 0, 400);
    this.radius = 200;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
    this.x, this.y);
};

Background.prototype.update = function () {
    //this.x += 1;
    //if(this.x > 0) this.x = -800;
}

function Foreground(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    // Entity.call(this, game, 0, 400);
    this.radius = 200;
}

Foreground.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
    this.x, this.y);
};

Foreground.prototype.update = function () {
    //this.x -= 1;
    //if(this.x < -800) this.x = 0;
}

function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
}

function PlayGame(game, x, y) {
    Entity.call(this, game, x, y);
}

PlayGame.prototype = new Entity();
PlayGame.prototype.constructor = PlayGame;

PlayGame.prototype.reset = function () {
    this.game.running = false;

}
PlayGame.prototype.update = function () {
    //if (this.game.click && this.game.unicorn.lives > 0) {
        this.game.running = true;
    //} 
}

PlayGame.prototype.draw = function (ctx) {
    if (!this.game.running) {
        ctx.font = "24pt Impact";
        ctx.fillStyle = "purple";
        if (this.game.mouse) { ctx.fillStyle = "pink"; }
        if (this.game.unicorn.lives > 0) {
            ctx.fillText("Click to Play!", this.x, this.y);
        }
        else {
            ctx.fillText("Game Over Man!", this.x-30, this.y);
        }
    }
}
function Cube(game) {
    cubeSlideBeginning = new Animation(ASSET_MANAGER.getAsset("./img/cyborg_run.png"), 0, 0, 48, 36, 0.5, 3, true, false);
    this.animation = cubeSlideBeginning;
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/cyborg_jump.png"), 0, 0, 48, 36, 0.2, 4, false, false);
    this.jumping = false;
    // this.radius = 100;
    this.ground = 350;
    Entity.call(this, game, 0, 350);
}

Cube.prototype = new Entity();
Cube.prototype.constructor = Cube;

Cube.prototype.update = function () {
    if (this.game.space) this.jumping = true;
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
            Cube.animation = cubeSlideBeginning;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 200;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
    Entity.prototype.update.call(this);
}

Cube.prototype.draw = function (ctx) {
    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
    }
    else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
    }
    Entity.prototype.draw.call(this);
}

function Block(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/block.png"), 0, 0, 64, 64, 0.20, 2, true, false);
    // this.boundingbox = new BoundingBox(this.x + 64, this.y + 64, this.animation.frameWidth - 40, this.animation.frameHeight - 20);
    // this.radius = 100;
    this.ground = 350;
    Entity.call(this, game, 300, 350);
}

Block.prototype = new Entity();
Block.prototype.constructor = Block;

Block.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Block.prototype.draw = function (ctx) {
    if(this.x < -64) {
        this.x = 800;
    }
    this.animation.drawFrame(this.game.clockTick, ctx, this.x -= 15, this.y, 3);
    Entity.prototype.draw.call(this);
}

function Spike(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/spike.png"), 0, 0, 64, 64, 0.5, 2, true, false);
    // this.boundingbox = new BoundingBox(this.x + 64, this.y + 64, this.animation.frameWidth - 40, this.animation.frameHeight - 20);
    // this.radius = 100;
    this.ground = 350;
    Entity.call(this, game, 500, 350);
}

Spike.prototype = new Entity();
Spike.prototype.constructor = Spike;

Spike.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Spike.prototype.draw = function (ctx) {
    if(this.x < -64) {
        this.x = 800;
    }
    this.animation.drawFrame(this.game.clockTick, ctx, this.x -= 15, this.y, 3);
    Entity.prototype.draw.call(this);
}




// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/cyborg_run.png");
ASSET_MANAGER.queueDownload("./img/cyborg_jump.png");
ASSET_MANAGER.queueDownload("./img/block.png");
ASSET_MANAGER.queueDownload("./img/spike.png");
// ASSET_MANAGER.queueDownload("./img/background_test2.png");
ASSET_MANAGER.queueDownload("./img/galaxy.png");
ASSET_MANAGER.queueDownload("./img/transparent_bg.png");


ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    document.getElementById('gameWorld').focus();
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
 
    gameEngine.init(ctx);
    gameEngine.start();
    // gameEngine.addEntity(new Background(gameEngine, ASSET_MANAGER.getAsset("./img/background_test2.png")));
    let timer = new VisibleTimer(gameEngine);
    let pg = new PlayGame(gameEngine, 320, 350);
    gameEngine.addEntity(new Background(gameEngine, ASSET_MANAGER.getAsset("./img/galaxy.png")));
    gameEngine.addEntity(new Foreground(gameEngine, ASSET_MANAGER.getAsset("./img/transparent_bg.png")));
    gameEngine.addEntity(new Cube(gameEngine));
    gameEngine.addEntity(new Block(gameEngine));
    gameEngine.addEntity(new Spike(gameEngine));
    gameEngine.addEntity(timer);
    gameEngine.addEntity(pg);
});
