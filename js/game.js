/**
 *
 * Hello, Crafty!
 * ==============
 *
 * A short, barebones example of a CraftyJS game.
 *
 * @see http://amberonrails.com/pixels-and-tactics
 * @author Amber Feng (@amfeng)
 * @license MIT
 *
 **/


window.launchGame = function(gameElement) {
  // Load assets

  // Main player sprite
  Crafty.sprite(32, 36, "assets/player.png", {
    player: [0, 0]
  });

  // Tileset for the ground and mushrooms
  Crafty.sprite(32, 32, "assets/tileset.png", {
    grass: [0, 0],
    mushroom: [1, 0]
  });

  // Some sound effects for when we pick up an item
  Crafty.audio.add({
    woosh: ["assets/woosh.wav"]
  });

  // Init the Crafty game
  Crafty.init(600, 400, gameElement);
  Crafty.pixelart(true);

  // Create the starting map scene
  Crafty.scene("map", function() {
    // Create the map
    for (var i = 0; i < 19; i++) {
      for (var j = 0; j < 13; j++) {
        // Add grass
        Crafty.e("2D, DOM")
          .attr({x: i * 32, y: j * 32, z: 0})
          .addComponent("grass");

        // Randomly decide if we need to put a mushroom or not
        if (Math.random() > 0.97) {
          Crafty.e("2D, DOM, Pickupable")
            .attr({x: i * 32, y: j * 32, z: 10})
            .addComponent("mushroom")
            .Pickupable("mushroom");
        }
      }
    }

    // Create the character entity
    var $player = Crafty.e("2D, DOM, SpriteAnimation, PlayerControl, Walkable")
      .attr({x: 10, y: 10, z: 100})
      .addComponent("player") // pulls the correct sprite
      .Walkable(5)
      .PlayerControl()
      .reel("walk_left", 600, 0, 1, 4)
      .reel("walk_right", 600, 0, 2, 4)
      .reel("walk_up", 600, 0, 3, 4)
      .reel("walk_down", 600, 0, 0, 4)
      .collision(Crafty.polygon([7, 23], [23, 23], [23, 38], [7, 38]))
      .onHit("Pickupable", function(collisions) {
        for (var c in collisions) {
          collisions[c].obj.trigger("pickedUp");
        }
      });
  });

  // Create some custom components. Some of these should actually just be
  // third-party modules so we can reuse them! (I may do that at some point,
  // most of this logic is just custom to my own game.)

  // A component that represents something that can be picked up by the player.
  Crafty.c("Pickupable", {
    Pickupable: function(name) {
      this.bind("pickedUp", function() {
        console.log("You picked up a " + name);
        Crafty.audio.play("woosh");

        this.destroy();
      });

      return this;
    }
  });

  // A component that allows keyboard controls (e.g. arrow keys) for movement,
  // and other player commands.
  Crafty.c("PlayerControl", {
    PlayerControl: function() {
      this.bind("KeyDown", function(e) {
        this.resetWalking();

        // For chaining with the Walkable component
        if (e.keyCode === Crafty.keys.RIGHT_ARROW) this._move.right = true;
        if (e.keyCode === Crafty.keys.LEFT_ARROW) this._move.left = true;
        if (e.keyCode === Crafty.keys.UP_ARROW) this._move.up = true;
        if (e.keyCode === Crafty.keys.DOWN_ARROW) this._move.down = true;

        // Player-specific commands
        if (e.keyCode === Crafty.keys.ENTER) {
          console.log("Interacting!");
        }
      })
      .bind("KeyUp", function(e) {

        // For chaining with the Walkable component
        if (e.keyCode === Crafty.keys.RIGHT_ARROW) this._move.right = false;
        if (e.keyCode === Crafty.keys.LEFT_ARROW) this._move.left = false;
        if (e.keyCode === Crafty.keys.UP_ARROW) this._move.up = false;
        if (e.keyCode === Crafty.keys.DOWN_ARROW) this._move.down = false;

        this.pauseAnimation();

        if (this.getReel()) {
          this.resetAnimation();
        }
      })

      return this;
    }
  });

  // A component that takes inputs from something that control's this entity's
  // direction (whether it's a PlayerControl, or some sort of AI) and moves and
  // animates the entity in a walking motion.
  Crafty.c("Walkable", {
    _move: undefined,
    _speed: 3,

    Walkable: function(speed) {
      if (speed) this._speed = speed;
      this._move = {left: false, right: false, up: false, down: false};

      this
        .addComponent("Collision")
        .bind("EnterFrame", function() {

          if (this._move.right) this.x += this._speed;
          else if (this._move.left) this.x -= this._speed;
          else if (this._move.up) this.y -= this._speed;
          else if (this._move.down) this.y += this._speed;

          if (this._move.left) {
            if(!this.isPlaying("walk_left"))
              this.pauseAnimation().animate("walk_left", 1);
          }

          if (this._move.right) {
            if(!this.isPlaying("walk_right"))
              this.pauseAnimation().animate("walk_right", 1);
          }

          if (this._move.up) {
            if(!this.isPlaying("walk_up"))
              this.pauseAnimation().animate("walk_up", 1);
          }

          if (this._move.down) {
            if(!this.isPlaying("walk_down"))
                this.pauseAnimation().animate("walk_down", 1);
          }
        });

      return this;
    },

    reverseMove: function() {
      if (this._move.left) {
        this.x += this._speed;
      } else if (this._move.right) {
        this.x -= this._speed;
      } else if (this._move.down) {
        this.y -= this._speed;
      } else if (this._move.up) {
        this.y += this._speed;
      }
    },

    resetWalking: function() {
      this._move.right = false;
      this._move.left = false;
      this._move.down = false;
      this._move.up = false;
    }
  });

  // Launch the scene!
  Crafty.enterScene("map");
};
