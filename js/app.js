

var canvas = document.getElementById('canvas');
var engine = new BABYLON.Engine(canvas, true);

var actor = {
        // Movement attributes
        speed : 3,
        moveLeft : false,
        moveRight : false,
        moveForward : false,
        moveBackwards : false,
        model: null
        };

var actor, camera;
var charModel, asset;


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


var createScene = function() {
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 50, 17), scene);

    console.log(camera);
    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

    // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
    var ground = BABYLON.Mesh.CreateGround('ground', 200, 200, 2, scene);
    

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


    var model = loader.addMeshTask("elf", "", "./assets/Varian/", "psc-warrior.babylon");
    model.onSuccess = function(t) {
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
        actor.model.isVisible = true;

        actor.model.position.z = 10;
        actor.model.position.y = 1;
        console.log(actor.model);        
        camera.target = actor.model;
        camera.radius = 15;
        camera.heightOffset = 8;
        camera.rotationOffset = 0; // the viewing angle
        
        engine.runRenderLoop(function() {
            if (!actor.killed) {
                move();
                //snowman.position.x += 0.1;
                /*camera.position.z += actor.speed;
                actor.position.z += actor.speed;
                ground.position.z += actor.speed;*/
                
            }
            scene.render();
        });
    };

    loader.load();

    var greenBox = BABYLON.Mesh.CreateBox("green", 10, scene);
    var greenMat = new BABYLON.StandardMaterial("ground", scene);
    greenMat.emissiveColor = BABYLON.Color3.Green();
    greenBox.material = greenMat;
    greenBox.position.z -= 100;
    greenBox.position.y = 0;
    greenBox.health = 3;


    //greenBox movement
    scene.registerBeforeRender(function () {
        if (greenBox.position.x < camera.position.x)
            greenBox.position.x += 0.2;
        if(greenBox.position.x > camera.position.x)
            greenBox.position.x -= 0.2;
        if(greenBox.position.z < camera.position.z)
            greenBox.position.z += 0.2;
        if(greenBox.position.z > camera.position.z)
            greenBox.position.z -= 0.2;
    });

    // Events
    var canvas = engine.getRenderingCanvas();
    var currentMesh;

    var getGroundPosition = function () {
        // Use a predicate to get position on the ground
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

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
        
    canvas.addEventListener("pointerdown", onPointerDown, false);
    

    scene.onDispose = function () {
        canvas.removeEventListener("pointerdown", onPointerDown);
    }
    

    // return the created scene

    return scene;
}

var scene = createScene();



window.addEventListener('resize', function() {
    engine.resize();
});


