

var canvas = document.getElementById('canvas');
var engine = new BABYLON.Engine(canvas, true);

var actor = {
        // Movement attributes
        health: 100,
        speed : 3,
        moveLeft : false,
        moveRight : false,
        moveForward : false,
        moveBackwards : false,
        model: null
        };

var charModel, asset, camera, scene, ground, currentMesh;
var enemies = [];
var greenBox;
var enemy;


//  Register key presses
var initMovement = function() {
    //console.log("MOVING");

    // When a key is pressed, set the movement
    var onKeyDown = function(evt) {
        // console.log(evt.keyCode);
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
var move = function() {
    var pos = actor.model.position;
    if (actor.moveRight) {
        pos.x += -0.3;
        //camera.position.x += 0.3;
    }
    if (actor.moveLeft) {
        pos.x += +0.3;
        //camera.position.x += -0.3;
    }
    if (actor.moveForward) {
        pos.z += -0.3;
        //camera.position.z += 0.3;
    }
    if (actor.moveBackwards) {
        pos.z += +0.3;
        //camera.position.z += -0.3;
    }
};

// Pointer Down event handler
var onPointerDown = function (evt) {
    if (evt.button !== 0) {
        return;
    }

    // check if we are under a mesh
    var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== ground; });
    if (pickInfo.hit) {
        currentMesh = pickInfo.pickedMesh;
    }
    currentMesh.health=currentMesh.health-1;
    if(currentMesh.health==0){
        currentMesh.dispose();
    }
}

var createScene = function() {
    // create a basic BJS Scene object
    scene = new BABYLON.Scene(engine);

    camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 50, 17), scene);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

    // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
    ground = BABYLON.Mesh.CreateGround('ground', 200, 200, 2, scene);
    
    // Create Canvas and attach mouse click listener
    var canvas = engine.getRenderingCanvas();
    canvas.addEventListener("pointerdown", onPointerDown, false);
    
    //Creation of a repeated textured material
    var materialPlane = new BABYLON.StandardMaterial("texturePlane", scene);
    materialPlane.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", scene);
    materialPlane.diffuseTexture.uScale = 5.0;//Repeat 5 times on the Vertical Axes
    materialPlane.diffuseTexture.vScale = 5.0;//Repeat 5 times on the Horizontal Axes
    materialPlane.backFaceCulling = false;//Always show the front and the back of an element
    ground.material = materialPlane;

    var box = BABYLON.Mesh.CreateBox("box", 3, scene);
    box.position.y = 3;
    box.position.z = 0;

    console.log("Set physx");

    scene.enablePhysics();
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, scene);
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    
    console.log("init movement")
    initMovement();

    // The function ImportMesh will import our custom model in the scene given in parameter
    var _this  = this;
    
        // The loader
    var loader =  new BABYLON.AssetsManager(scene);

    var modelLoad = loader.addMeshTask("actor", "", "./assets/Varian/", "psc-warrior.babylon");
    modelLoad.onSuccess = function(t) {
        console.log(t);
        //actor.model = new BABYLON.Mesh("characterModel", _this.scene);
        actor.model = BABYLON.Mesh.CreateCylinder("characterBox", 2, 2, 2, 6, 1, scene, false);
        //actor.model.scaling.y = 2;
        t.loadedMeshes.forEach(function(m) {
            m.parent = actor.model;
        });
        actor.model.scaling.scaleInPlace(1);
        //actor.model.rotation.y = -Math.PI/2;
        //actor.model.position.y = 0.5;
        actor.model.setEnabled(true);
        asset = {meshes: actor.model};

        
        actor.model.physicsImpostor = new BABYLON.PhysicsImpostor(actor.model, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1000, restitution: 0.1 }, scene);
        actor.model.isVisible = false;

        actor.model.position.z = 10;
        actor.model.position.y = 0.5;
        console.log(actor.model);        
        camera.target = actor.model;
        camera.radius = 15;
        camera.heightOffset = 8;
        camera.rotationOffset = 0; // the viewing angle
    };

    var enemyLoad = loader.addMeshTask("enemy", "", "./assets/gow/", "gears-of-war-3-lambent-female.babylon");
    enemyLoad.onSuccess = function(t) {
        enemy = BABYLON.Mesh.CreateCylinder("enemy", 2, 2, 2, 6, 1, scene, false);

        t.loadedMeshes.forEach(function(m) {
            m.parent = enemy;
        });
        enemy.position.z = 15;
        enemy.position.x = 10;
        asset = {meshes: enemy};

        
        enemy.physicsImpostor = new BABYLON.PhysicsImpostor(enemy, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 500, restitution: 0.1 }, scene);
        enemy.isVisible = false;

        enemy.position.y = 0.5;
        enemy.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
        enemy.health = 3;
        
    };


    loader.onFinish = function (tasks) {
        run(scene);
    };

    loader.load();


    // return the created scene
    return scene;
}

var run = function(scene){
    engine.runRenderLoop(function() {
        enemy.rotationQuaternion.x = 0;
        enemy.rotationQuaternion.z = 0;
        actor.model.rotationQuaternion.x = 0;
        actor.model.rotationQuaternion.z = 0;


        if (actor.health) {
            move(); 
        }
        if (enemy.position.x < actor.model.position.x + 2) {
            enemy.position.x += 0.2;
        } 
        if(enemy.position.x > actor.model.position.x -2) {
            enemy.position.x -= 0.2;
        }
        if(enemy.position.z < actor.model.position.z +2) {
            enemy.position.z += 0.2;
        }
            
        if(enemy.position.z > actor.model.position.z - 2) {
            enemy.position.z -= 0.2;
        }
            
        scene.render();
    });
}


var scene = createScene();


scene.onDispose = function () {
    canvas.removeEventListener("pointerdown", onPointerDown);
}
window.addEventListener('resize', function() {
    engine.resize();
});


/*
var getGroundPosition = function () {
    // Use a predicate to get position on the ground
    var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
    if (pickinfo.hit) {
        return pickinfo.pickedPoint;
    }

    return null;
}
*/

