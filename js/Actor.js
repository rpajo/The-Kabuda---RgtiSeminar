
/**
* A mesh representing the player Actor
* @param size The Actor size
* @param scene The scene where the Actor will be created
* @constructor
*/
Actor = function(size, scene) {
    // Call the super class BABYLON.Mesh
    var mesh = BABYLON.Mesh.call(this, "actor", scene);
    // Creates a box (yes, our Actor will be a box)
    var vd = BABYLON.VertexData.CreateBox(size);
    // Apply the box shape to our mesh
    vd.applyToMesh(this, false);

    // Our Actor is all fresh (for now)
    this.killed = false;

    // Its position is in (0,0), and a little bit above the ground.
    this.position.x = 0;
    this.position.z = 0;
    this.position.y = size/2;

    // Movement attributes
    this.speed = 3;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveForward = false;
    this.moveBackwards = false;

    this._initMovement();
};

// Our object is a BABYLON.Mesh
Actor.prototype = Object.create(BABYLON.Mesh.prototype);
// And its constructor is the Actor function described above.
Actor.prototype.constructor = Actor;





//  Register key presses
Actor.prototype._initMovement = function() {
    //console.log("MOVING");

    // When a key is pressed, set the movement
    var onKeyDown = function(evt) {
        //console.log(evt.keyCode);
        // To the left
        if (evt.keyCode == 65) {
            actor.moveLeft = true;
            actor.moveRight = false;
        } 
        else if (evt.keyCode == 68) {
            // To the right
            actor.moveRight = true;
            actor.moveLeft = false;
        }
        else if (evt.keyCode == 87) {
            // Forward
            actor.moveForward = true;
            actor.moveBackwards = false;
        }
        else if (evt.keyCode == 83) {
            // Backwards
            actor.moveBackwards = true;
            actor.moveForward = false;
        }
    };

    // On key up, reset the movement
    var onKeyUp = function(evt) {
        //console.log("up event: " + evt.keyCode);
        if (evt.keyCode == 68) actor.moveRight = false;
        if (evt.keyCode == 65) actor.moveLeft = false;
        if (evt.keyCode == 87) actor.moveForward = false;
        if (evt.keyCode == 83) actor.moveBackwards = false;
    };

    // Register events with the right Babylon function
    BABYLON.Tools.RegisterTopRootEvents([{
        name: "keydown",
        handler: onKeyDown
    }, {
        name: "keyup",
        handler: onKeyUp
    }]);
};

//Movement
Actor.prototype.move = function() {
    if (actor.moveRight) {
        actor.position.x += -0.3;
        //camera.position.x += 0.3;
    }
    if (actor.moveLeft) {
        actor.position.x += +0.3;
        //camera.position.x += -0.3;
    }
    if (actor.moveForward) {
        actor.position.z += -0.3;
        //camera.position.z += 0.3;
    }
    if (actor.moveBackwards) {
        actor.position.z += +0.3;
        //camera.position.z += -0.3;
    }
};
