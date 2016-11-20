

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
        jump : 0,
        fast : false,
        model: null
        };

var charModel, asset, camera, scene, ground, currentMesh;
var walkingEffect, swordEffect, dyingEffect; //sound effects
var enemies = [];
var enemy;

var enemyCount= 10 // number of monsters to be generated;

var healthBar = document.getElementById("healthBar");
healthBar.value = 100;


var rotateY = function(model, angle) {
    var children = model.getChildren();
    children.forEach(function(element) {
        element.rotation.y = angle;
    });
};

//  Register key presses
var initMovement = function() {
    //console.log("MOVING");

    // When a key is pressed, set the movement
    var usmerjenost = 0; // gor-0, desno-1, dol-2, levo-3
    var onKeyDown = function(evt) {
        // console.log(evt.keyCode);
        // To the left
        if (evt.keyCode == 65) {
            if(usmerjenost == 0){
                rotateY(actor.model, -Math.PI/2);
                usmerjenost=3;
            }
            if(usmerjenost == 1){
                rotateY(actor.model, Math.PI);
                usmerjenost=3;
            }
            if(usmerjenost == 2){
                rotateY(actor.model, Math.PI/2);
                usmerjenost=3;
            }
            actor.moveLeft = true;
            actor.moveRight = false;

        } 
        else if (evt.keyCode == 68) {
            // To the right
            if(usmerjenost == 0){
                rotateY(actor.model, Math.PI/2);
                usmerjenost=1;
            }
            if(usmerjenost == 3){
                rotateY(actor.model, Math.PI);
                usmerjenost=1;
            }
            if(usmerjenost == 2){
                rotateY(actor.model, -Math.PI/2);
                usmerjenost=1;
            }
            actor.moveRight = true;
            actor.moveLeft = false;
        }
        else if (evt.keyCode == 87) {
            // Forward
            if(usmerjenost == 3){
                rotateY(actor.model, Math.PI/2);
                usmerjenost=0;
            }
            if(usmerjenost == 2){
                rotateY(actor.model, Math.PI);
                usmerjenost=0;
            }
            if(usmerjenost == 1){
                rotateY(actor.model, -Math.PI/2);
                usmerjenost=0;
            }
            actor.moveBackwards = false;
            actor.moveForward = true;
        }
        else if (evt.keyCode == 83) {
            // Backwards
            if(usmerjenost == 3){
                rotateY(actor.model, -Math.PI/2);
                usmerjenost=2;
            }
            if(usmerjenost == 0){
                rotateY(actor.model, Math.PI);
                usmerjenost=2;
            }
            if(usmerjenost == 1){
                rotateY(actor.model, Math.PI/2);
                usmerjenost=2;
            }
            actor.moveBackwards = true;
            actor.moveForward = false;
        }
        else if (evt.keyCode == 32) {
            actor.jump = 18; // the value to be decreased as the model gradially jumps higher
        }
        if (evt.keyCode == 16) {
            actor.fast = true;
        }
        else{
            actor.fast = false;
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
    var change = 0.3;
    if (actor.fast) {
        change = 0.5;
    }
    if (actor.moveRight) {
        pos.x -= change;
    }
    if (actor.moveLeft) {
        pos.x += change;
        
    }
    if (actor.moveForward) {
        pos.z -= change;
    }
    if (actor.moveBackwards) {
        pos.z += change;
    }
    if (actor.jump) {
        actor.model.position.y += 0.3;
        actor.jump--;
    }
};








// Pointer Down event handler
var onPointerDown = function (evt) {
    if (evt.button !== 0) {
        return;
    }
    swordEffect.play();
    // check if we are under a mesh
    var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== ground; });
    if (pickInfo.hit) {
        currentMesh = pickInfo.pickedMesh;
    }
    currentMesh.health=currentMesh.health-1;
    if(currentMesh.health==0){        
        currentMesh.dispose();
        enemies[currentMesh.index] = null;  
        dyingEffect.play();     
    }
}

// mouse over mesh event initializer
var makeOverOut = function (mesh) {
    //var child = enemy.getChildren();
    var child = mesh.getChildren()[0];  
    //console.log("makeoverout");
    mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
        mesh.visibility = 0.05;
        child.visibility = 0.5;
		scene.hoverCursor = " url('http://jerome.bousquie.fr/BJS/test/viseur.png') 12 12, auto ";
	}));

    mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev) {
        mesh.visibility = 0;
        child.visibility = 0;
    }));

    // mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh, "scaling", new BABYLON.Vector3(1, 1, 1), 150));
    //mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh, "scaling", new BABYLON.Vector3(1.05, 1.05, 1.05), 150));

}

var createScene = function() {
    // create a basic BJS Scene object
    scene = new BABYLON.Scene(engine);

    camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 30, 50), scene);
    
    /* Debu Free camera
    var debugCamera = new BABYLON.FreeCamera("debugCamera", new BABYLON.Vector3(0, 5, -10), scene);
    debugCamera.setTarget(new BABYLON.Vector3.Zero());
    debugCamera.attachControl(canvas, false);
    */

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

    // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
    ground = BABYLON.Mesh.CreateGround('ground', 400, 400, 2, scene);

    
    swordEffect = new BABYLON.Sound("sword", "assets/sword.mp3", scene);

    dyingEffect = new BABYLON.Sound("dying", "assets/dying.mp3", scene);

    /*walkingEffect = new BABYLON.Sound("walking", "assets/walking2.wav", scene, function() {
        console.log("walking effect loaded");
    }, { loop: true, autoplay: true });*/

    /*var music = new BABYLON.Sound("music", "assets/diablo1.mp3", scene,
        function () {
        // Sound has been downloaded & decoded
        music.play();
        }, { loop: true, autoplay: true });*/

    //Creation of a repeated textured material
    var materialPlane = new BABYLON.StandardMaterial("texturePlane", scene);
    materialPlane.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", scene);
    materialPlane.diffuseTexture.uScale = 55.0;//Repeat 5 times on the Vertical Axes
    materialPlane.diffuseTexture.vScale = 55.0;//Repeat 5 times on the Horizontal Axes
    materialPlane.backFaceCulling = false;//Always show the front and the back of an element
    materialPlane.specularColor = new BABYLON.Color3(0,0,0); // no ground reflection
    ground.material = materialPlane;

    var box = BABYLON.Mesh.CreateBox("box", 3, scene);
    var boxMat = new BABYLON.StandardMaterial("boxmMterial", scene);
    box.material = boxMat;
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
        //actor.model = new BABYLON.Mesh("characterModel", _this.scene);
        actor.model = BABYLON.Mesh.CreateCylinder("characterBox", 2, 2, 2, 6, 1, scene, false);
        t.loadedMeshes.forEach(function(m) {
            //m.rotation.y = -Math.PI/2;
            m.position.y -= 1;
            m.parent = actor.model;
        });
        //actor.model.skeleton = t.loadedSkeletons[0];
        //actor.model.scaling.scaleInPlace(1);
        //actor.model.rotation.y = -Math.PI/2;
        //actor.model.position.y = 0.5;
        actor.model.setEnabled(true);
        asset = {meshes: actor.model};

        
        actor.model.physicsImpostor = new BABYLON.PhysicsImpostor(actor.model, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 1000, restitution: 0 }, scene);
        actor.model.isVisible = false;

        actor.model.position.z = 10;
        actor.model.position.y = 0.5;
        camera.target = actor.model;
        camera.radius = 15;
        camera.heightOffset = 15;
        camera.rotationOffset = 0; // the viewing angle

        actor.model.actionManager = new BABYLON.ActionManager(scene);
        

        //walkingEffect.attachToMesh(actor.model); 
    };

var enemyMat = new BABYLON.StandardMaterial("enemyMaterial", scene);
enemyMat.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red

for (var i = 0; i < enemyCount; i++) {
    var enemyLoad = loader.addMeshTask("enemy"+i, "", "./assets/gow/", "gears-of-war-3-lambent-female.babylon");
    enemyLoad.onSuccess = function(t) {
        var enemy = BABYLON.Mesh.CreateCylinder("enemy" + i, 3.8, 2, 2, 6, 1, scene, false);
        enemy.actionManager = new BABYLON.ActionManager(scene);
        enemy.visibility = 0;

        var enemyTorus = BABYLON.Mesh.CreateTorus("enemyTorus" + i, 1.3, 0.2, 16, scene, false);
        enemyTorus.position.y -= 1.7;
        enemyTorus.parent = enemy;
        enemyTorus.material = enemyMat;
        enemyTorus.visibility = 0;
        //console.log(enemy.getChildren());
        makeOverOut(enemy);



        t.loadedMeshes.forEach(function(m) {
            m.position.y -= 1.6;
            m.parent = enemy;
        });

        enemy.position.z = Math.random()*100;
        enemy.position.x = Math.random()*100;
        enemy.position.y = 0.5;

        asset = {meshes: enemy};

        
        enemy.physicsImpostor = new BABYLON.PhysicsImpostor(enemy, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 500, restitution: 0.1 }, scene);
        enemy.isVisible = true;

        
        enemy.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
        enemy.health = 3;

        enemies.push(enemy);

    };
};

    loader.onFinish = function (tasks) {

        for (var i = 0; i < enemies.length; i++) {
            enemies[i].index = i;
        }
        run(scene);
    };

    loader.load();


    

    scene.onPointerDown = function (evt, pickResult) {
        // if the click hits the ground object, we change the impact position
        if (pickResult.hit) {
            var impact = BABYLON.Mesh.CreateSphere("sphere", 0.2, 0.2, scene);
            impact.isVisible=false;
            impact.position.x = pickResult.pickedPoint.x;
            impact.position.y = pickResult.pickedPoint.y;
            impact.position.z = pickResult.pickedPoint.z;
            impact.isVisible = true;
            setTimeout(function(){
                impact.isVisible = false;
            }, 500);
        }
        
    };

    // return the created scene
    return scene;
}

var run = function(scene){
    engine.runRenderLoop(function() {
        
        actor.model.rotationQuaternion.x = 0;
        actor.model.rotationQuaternion.z = 0;


        if (actor.health > 0) {
            move(); 
        }

        var nearX, nearZ;

        enemies.forEach(function(enemy) {
            if (enemy != null) {
                enemy.rotationQuaternion.x = 0;
                enemy.rotationQuaternion.z = 0;
                nearX = true; nearZ = true;
                if (enemy.position.x < actor.model.position.x - 2) {
                    enemy.position.x += 0.1;
                    nearX = false;
                } 
                else if(enemy.position.x > actor.model.position.x + 2) {
                    enemy.position.x -= 0.1;
                    nearX = false;
                }
                if(enemy.position.z < actor.model.position.z - 2) {
                    enemy.position.z += 0.1;
                    nearZ = false;
                }
                else if(enemy.position.z > actor.model.position.z + 2) {
                    enemy.position.z -= 0.1;
                    nearZ = false;
                }

                if(nearX && nearZ) {
                    actor.health += -0.1;
                    healthBar.value = Math.floor(actor.health);
                    document.getElementById("healthDisplay").innerHTML = "HEALTH: " + Math.round(actor.health*100)/100;
                }
            }
            
        }, this);
        
            
        scene.render();
    });

};

var scene = createScene();

canvas.addEventListener("pointerdown", onPointerDown, false);


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

