

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
        heal : 0, // healing amout
        aoe : 0, // damage explosive skill
        model: null,
        mana: 100,
        score: 0
        };

var asset, camera, scene, ground, currentMesh, loader, enemyMat, shadowGenerator;
var walkingEffect, swordEffect, dyingEffect, missEffect; //sound effects
var particleHeal, particleAoe; // particle effects
var enemies = [];
var enemy;
var enemyHealth = 3;
var needToSpawn = false, barrier = false;

var enemyCount= 4 // number of monsters to be generated;

var healthBar = document.getElementById("healthBar");
healthBar.value = 100;

var manaBar = document.getElementById("manaBar");
manaBar.value = 100;


var rotateY = function(model, angle) {
    var children = model.getChildren();
    children.forEach(function(element) {
        element.rotation.y = angle;
    });
};

var initParticles = function() {
    //Healing particle effect
    particleHeal = new BABYLON.ParticleSystem("particleHeal", 2000, scene);
    //Texture of each particle
    particleHeal.particleTexture = new BABYLON.Texture("textures/particles/particle2.png", scene);
    particleHeal.emitter = actor.model; // the starting object, the emitter
    particleHeal.minSize = 0.8;
    particleHeal.maxSize = 1.5;
    // Life time of each particle (random between...
    particleHeal.minLifeTime = 0.3;
    particleHeal.maxLifeTime = 0.5;

    // Colors of all particles
    particleHeal.color1 = new BABYLON.Color4(0, 1, 0, 1.0);
    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    particleHeal.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    // Direction of each particle after it has been emitted
    particleHeal.direction1 = new BABYLON.Vector3(0, 8, 3);

    // Speed
    particleHeal.minEmitPower = 1;
    particleHeal.maxEmitPower = 3;
    particleHeal.updateSpeed = 0.005;

    // Emission rate
    particleHeal.emitRate = 500;


    //explotion partical effect
    particleAoe = new BABYLON.ParticleSystem("particleDamage", 2000, scene);
    //Texture of each particle
    particleAoe.particleTexture = new BABYLON.Texture("textures/particles/particle4.png", scene);
    particleAoe.emitter = actor.model; // the starting object, the emitter
    particleAoe.minSize = 3;
    particleAoe.maxSize = 5;
    // Life time of each particle (random between...
    particleAoe.minLifeTime = 0.2;
    particleAoe.maxLifeTime = 0.3;

    // Colors of all particles
    particleAoe.color1 = new BABYLON.Color4(1, 0, 0, 1.0);
    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    particleAoe.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    // Direction of each particle after it has been emitted
    particleAoe.direction1 = new BABYLON.Vector3(10, 0, 10);
    particleAoe.direction2 = new BABYLON.Vector3(-10, 0, -10);

    // Speed
    particleAoe.minEmitPower = 2;
    particleAoe.maxEmitPower = 5;
    particleAoe.updateSpeed = 0.1;

    // Emission rate
    particleAoe.emitRate = 500;
}


//  Register key presses
var initMovement = function() {
    //console.log("MOVING");

    // When a key is pressed, set the movement
    var usmerjenost = 0; // gor-0, desno-1, dol-2, levo-3
    var onKeyDown = function(evt) {
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
        else if (evt.keyCode == 49) {
            // skill on number 1
            if(actor.mana>=40){
                actor.mana=actor.mana-40;
                actor.heal=20;
                manaBar.value = Math.floor(actor.mana);
                document.getElementById("manaDisplay").innerHTML = "MANA: " + Math.round(actor.mana*100)/100;
                particleHeal.start();
            }
            
        }
        else if (evt.keyCode == 50) {
            // skill on number 2
            if(actor.mana>=60){
                actor.mana=actor.mana-60;
                actor.aoe = 20;
                manaBar.value = Math.floor(actor.mana);
                document.getElementById("manaDisplay").innerHTML = "MANA: " + Math.round(actor.mana*100)/100;
                particleAoe.start();
            }
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

var spawnMonsters = function(){
    barrier = true;
    loader =  new BABYLON.AssetsManager(scene);
    enemies = [];

    for (var i = 0; i < enemyCount; i++) {
        var enemyLoad = loader.addMeshTask("enemy"+i, "", "./assets/gow/", "gears-of-war-3-lambent-female.babylon");
        enemyLoad.onSuccess = function(t) {
            var enemy = BABYLON.Mesh.CreateCylinder("enemy" + i, 3.8, 2, 2, 6, 1, scene, false);
            enemy.position.y++;
            enemy.actionManager = new BABYLON.ActionManager(scene);
            enemy.visibility = 0;
            enemy.position.z = Math.random()*50;
            enemy.position.x = Math.random()*50;
            enemy.position.y = 2;

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
                shadowGenerator.getShadowMap().renderList.push(m);
                //shadowGenerator.useVarianceShadowMap = true;
            });
            

            asset = {meshes: enemy};

            
            enemy.physicsImpostor = new BABYLON.PhysicsImpostor(enemy, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 5, restitution: 0.1 }, scene);
            enemy.isVisible = true;
            
            
            enemy.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
            enemy.health = enemyHealth;

            enemies.push(enemy);
        };
    };

    loader.onFinish = function (tasks) {

        for (var i = 0; i < enemies.length; i++) {
            enemies[i].index = i;
        }
        
        barrier = false;
    };
    loader.load();
};


var killEnemy = function(enemy) {
    if(enemy.health==0){
        actor.score=actor.score+100;
        document.getElementById("scoreDisplay").innerHTML = "SCORE: " + Math.round(actor.score*100)/100; 
        enemy.dispose();           
        enemies[enemy.index] = null;  
        dyingEffect.play();
    }
}
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
    
    if (currentMesh != undefined) {
        var xNear = true;
        var zNear = true;

        if (currentMesh.position.x < actor.model.position.x - 4) {
            xNear = false;
        } 
        else if(currentMesh.position.x > actor.model.position.x + 4) {
            xNear = false;
        }
        if(currentMesh.position.z < actor.model.position.z - 4) {
            zNear = false;
        }
        else if(currentMesh.position.z > actor.model.position.z + 4) {
            zNear = false;
        }

        if(xNear && zNear) {
            swordEffect.play();
            currentMesh.health=currentMesh.health-1;
        }
        else missEffect.play();

        killEnemy(currentMesh);
    }
    

    currentMesh = undefined;
}

// mouse over mesh event initializer
var makeOverOut = function (mesh) {
    //var child = enemy.getChildren();
    var child = mesh.getChildren()[0];  
    //console.log("makeoverout");
    mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
        mesh.visibility = 0.05;
        child.visibility = 0.5;
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

    /*BABYLON.SceneOptimizer.OptimizeAsync(scene, BABYLON.SceneOptimizerOptions.ModerateDegradationAllowed(),
    function() {
        console.log("Scene optimizer successfuly initialized");
    }, function() {
        console.log("Scene optimizer not initialized");
    })*/

    camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 30, 50), scene);
    
    // Debug Free camera
    /*
    var debugCamera = new BABYLON.FreeCamera("debugCamera", new BABYLON.Vector3(0, 20, 10), scene);
    debugCamera.setTarget(new BABYLON.Vector3(0,0,0));
    debugCamera.attachControl(canvas, false);
    */

    // Minimap
    /*
	var mm = new BABYLON.FreeCamera("minimap", new BABYLON.Vector3(0,0,0), scene);  
	mm.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
	mm.setTarget(new BABYLON.Vector3(0, 0, 0));
	mm.orthoLeft = -120/2;
    mm.orthoRight = 120/2;
    mm.orthoTop =  120/2;
    mm.orthoBottom = -120/2;
	mm.rotation.x = Math.PI/2;
    mm.rotation.y = Math.PI;
    mm.viewport = new BABYLON.Viewport(0.8, 0.1, 0.20, 0.20);

    scene.activeCameras.push(camera);
	scene.activeCameras.push(mm);
    scene.cameraToUseForPointers = camera;
    */
    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var hemiLight = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,-5,0), scene);

    var light = new BABYLON.DirectionalLight('light1', new BABYLON.Vector3(-1,-2,-1), scene);
    light.position = new BABYLON.Vector3(20, 40, 20);
	light.intensity = 0.7;

    // shadow generator
    shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
    //shadowGenerator.usePoissonSampling = true;
    shadowGenerator.useBlurVarianceShadowMap = true;

    // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
    ground = BABYLON.Mesh.CreateGround('ground', 300, 300, 2, scene);
    ground.receiveShadows = true;

    ground2 = BABYLON.Mesh.CreateGround('ground2', 50, 50, 2, scene);
    ground2.position.y=ground2.position.y+0.001;
    ground2.receiveShadows = true;
    
    swordEffect = new BABYLON.Sound("sword", "assets/sounds/sword.mp3", scene);

    dyingEffect = new BABYLON.Sound("dying", "assets/sounds/dying.mp3", scene);

    missEffect = new BABYLON.Sound("miss", "assets/sounds/miss.wav", scene);

    /*walkingEffect = new BABYLON.Sound("walking", "assets/sounds/walking2.wav", scene, function() {
        console.log("walking effect loaded");
    }, { loop: true, autoplay: true });*/

    /*var music = new BABYLON.Sound("music", "assets/sounds/diablo1.mp3", scene,
        function () {
        // Sound has been downloaded & decoded
        music.play();
        }, { loop: true, autoplay: true });*/

    //Creation of a repeated textured material
    var materialPlane = new BABYLON.StandardMaterial("texturePlane", scene);
    materialPlane.diffuseTexture = new BABYLON.Texture("textures/ground_arena.jpg", scene);
    materialPlane.diffuseTexture.uScale = 50.0;//Repeat 5 times on the Vertical Axes
    materialPlane.diffuseTexture.vScale = 50.0;//Repeat 5 times on the Horizontal Axes
    materialPlane.backFaceCulling = false;//Always show the front and the back of an element
    materialPlane.specularColor = new BABYLON.Color3(0.1,0.1,0.1); // no ground reflection
    ground.material = materialPlane;

    var materialPlane2 = new BABYLON.StandardMaterial("texturePlane2", scene);
    materialPlane2.diffuseTexture = new BABYLON.Texture("textures/ground3.jpg", scene);
    materialPlane2.diffuseTexture.uScale = 5.0;//Repeat 5 times on the Vertical Axes
    materialPlane2.diffuseTexture.vScale = 5.0;//Repeat 5 times on the Horizontal Axes
    materialPlane2.backFaceCulling = false;//Always show the front and the back of an element
    materialPlane2.specularColor = new BABYLON.Color3(0.1,0.1,0.1); // no ground reflection
    ground2.material = materialPlane2;

    var box = BABYLON.Mesh.CreateBox("box", 3, scene);
    var boxMat = new BABYLON.StandardMaterial("boxmMterial", scene);
    box.material = boxMat;
    box.position.y = 3;
    box.position.z = 0;

    console.log("Set physx");

    scene.enablePhysics();
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, scene);
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

    shadowGenerator.getShadowMap().renderList.push(box);
    //shadowGenerator.useVarianceShadowMap = true;

    console.log("init movement")
    initMovement();

    // The function ImportMesh will import our custom model in the scene given in parameter
    var _this  = this;
    
        // The loader
    loader =  new BABYLON.AssetsManager(scene);

    // horizontal walls
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 2; j++) {
            var wallLoad = loader.addMeshTask("wall"+i+j, "", "./assets/wall/", "mage_wall.babylon");
            wallLoad.onSuccess = function(t) {
                var index = [parseInt(t.name[4]), parseInt(t.name[5])];
                var mesh = t.loadedMeshes[0];
                mesh.position = new BABYLON.Vector3((index[0]-2)*15 + 5, 0, 50 - 100*index[1]);
                mesh.scaling = new BABYLON.Vector3(2.5,2.5,2.5);
                mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 5000, restitution: 0 }, scene);
                // if (index[1] == 0) {
                //     mesh.rotation.y = Math.PI;
                // }
                shadowGenerator.getShadowMap().renderList.push(mesh);
	            //shadowGenerator.useVarianceShadowMap = true;
            };   
        }
    }
    // vertical walls
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 2; j++) {
            var wallLoad = loader.addMeshTask("wall"+i+j, "", "./assets/wall/", "mage_wall.babylon");
            wallLoad.onSuccess = function(t) {
                var index = [parseInt(t.name[4]), parseInt(t.name[5])];
                var mesh = t.loadedMeshes[0];
                mesh.rotation.y = Math.PI/2;
                mesh.position = new BABYLON.Vector3(-40  + 90*index[1], 0, -30 + 15*index[0]);
                mesh.scaling = new BABYLON.Vector3(2.5,2.5,2.5);
                mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 5000, restitution: 0 }, scene);
                // if (index[1] == 1) {
                //     mesh.rotation.y = -Math.PI/2;
                // }
                shadowGenerator.getShadowMap().renderList.push(mesh);
	            //shadowGenerator.useVarianceShadowMap = true;
            };   
        }
    }

    var house = BABYLON.Mesh.CreateCylinder("house", 15, 15, 15, 6, 1, scene, false);
    house.position = new BABYLON.Vector3(0, 8 ,-10);

    var tree = BABYLON.Mesh.CreateCylinder("tree", 15, 15, 15, 6, 1, scene, false);
    tree.position = new BABYLON.Vector3(20, 7 ,20);

    var towerMesh1 = BABYLON.Mesh.CreateCylinder("tower1", 15, 15, 15, 6, 1, scene, false);
    towerMesh1.position = new BABYLON.Vector3(-38, 8 ,45);
    towerMesh1.physicsImpostor = new BABYLON.PhysicsImpostor(towerMesh1, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 5000, restitution: 0 }, scene);
    var towerMesh2 = BABYLON.Mesh.CreateCylinder("tower2", 15, 15, 15, 6, 1, scene, false);
    towerMesh2.position = new BABYLON.Vector3(50, 8 ,45);
    towerMesh1.physicsImpostor = new BABYLON.PhysicsImpostor(towerMesh2, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 5000, restitution: 0 }, scene);
    var towerMesh3 = BABYLON.Mesh.CreateCylinder("tower3", 15, 15, 15, 6, 1, scene, false);
    towerMesh3.position = new BABYLON.Vector3(-39, 8 ,-47);
    towerMesh3.physicsImpostor = new BABYLON.PhysicsImpostor(towerMesh3, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 5000, restitution: 0 }, scene);
    var towerMesh4 = BABYLON.Mesh.CreateCylinder("tower4", 15, 15, 15, 6, 1, scene, false);
    towerMesh4.position = new BABYLON.Vector3(52, 8 ,-47);
    towerMesh4.physicsImpostor = new BABYLON.PhysicsImpostor(towerMesh4, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 5000, restitution: 0 }, scene);
    var towers = [towerMesh1, towerMesh2, towerMesh3, towerMesh4];

    var materialWall = new BABYLON.StandardMaterial("towerTex", scene);
    materialWall.diffuseTexture = new BABYLON.Texture("textures/castle.jpg", scene);
    materialWall.backFaceCulling = true;//Always show the front and the back of an element
    materialWall.specularColor = new BABYLON.Color3(0,0,0); // no ground reflection

    for (var i = 0; i < 4; i++) {
        var towerLoad = loader.addMeshTask("towerMesh"+i, "", "./assets/wall/", "Only Tower.obj");
        towerLoad.onSuccess = function(t) {
            var index = parseInt(t.name[9]);
            t.loadedMeshes.forEach(function(mesh) {
                mesh.scaling = new BABYLON.Vector3(0.07, 0.07, 0.07);
                mesh.position.y += -7;
                mesh.material = materialWall;
                mesh.parent = towers[index];
                shadowGenerator.getShadowMap().renderList.push(mesh);
	            //shadowGenerator.useVarianceShadowMap = true;
            });
            towers[index].isVisible = false;
        };
    }

    var houseLoad = loader.addMeshTask("house", "", "./assets/house/", "medieval-house-2.obj");
        houseLoad.onSuccess = function(t) {
            t.loadedMeshes.forEach(function(mesh) {
                mesh.scaling = new BABYLON.Vector3(1.50, 1.50, 1.50);
                mesh.position.y += -7;
                mesh.material = materialWall;
                mesh.parent = house;
                shadowGenerator.getShadowMap().renderList.push(mesh);
	            //shadowGenerator.useVarianceShadowMap = true;
            });
            house.isVisible = false;
        };


    var treeLoad = loader.addMeshTask("tree", "", "./assets/tree/", "tree-05.obj");
        treeLoad.onSuccess = function(t) {
            t.loadedMeshes.forEach(function(mesh) {
                mesh.scaling = new BABYLON.Vector3(0.07, 0.07, 0.07);
                mesh.position.y += -7;
                mesh.material = materialWall;
                mesh.parent = tree;
                shadowGenerator.getShadowMap().renderList.push(mesh);
	            //shadowGenerator.useVarianceShadowMap = true;
            });
            tree.isVisible = false;
        };
    
    
    
    
    var modelLoad = loader.addMeshTask("actor", "", "./assets/Varian/", "psc-warrior.babylon");
    modelLoad.onSuccess = function(t) {
        //actor.model = new BABYLON.Mesh("characterModel", _this.scene);
        actor.model = BABYLON.Mesh.CreateCylinder("characterBox", 2, 2, 2, 6, 1, scene, false);
        actor.model.position.z = 10;
        actor.model.position.y = 2;
        t.loadedMeshes.forEach(function(m) {
            //m.rotation.y = -Math.PI/2;
            m.position.y -= 1;
            m.parent = actor.model;
            shadowGenerator.getShadowMap().renderList.push(m);
	        //shadowGenerator.useVarianceShadowMap = true;
        });
        //actor.model.skeleton = t.loadedSkeletons[0];
        
        //actor.model.scaling.scaleInPlace(1);
        //actor.model.rotation.y = -Math.PI/2;
        //actor.model.position.y = 0.5;
        actor.model.setEnabled(true);
        asset = {meshes: actor.model};

        
        
        actor.model.physicsImpostor = new BABYLON.PhysicsImpostor(actor.model, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 100, restitution: 0 }, scene);
        actor.model.isVisible = false;

        
        camera.target = actor.model;
        camera.radius = 15;
        camera.heightOffset = 15;
        camera.rotationOffset = 0; // the viewing angle

        actor.model.actionManager = new BABYLON.ActionManager(scene);
        
        initParticles();

        //walkingEffect.attachToMesh(actor.model); 
    };

    enemyMat = new BABYLON.StandardMaterial("enemyMaterial", scene);
    enemyMat.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red


    for (var i = 0; i < enemyCount; i++) {
        var enemyLoad = loader.addMeshTask("enemy"+i, "", "./assets/gow/", "gears-of-war-3-lambent-female.babylon");
        enemyLoad.onSuccess = function(t) {
            var enemy = BABYLON.Mesh.CreateCylinder("enemy" + i, 3.8, 2, 2, 6, 1, scene, false);
            enemy.actionManager = new BABYLON.ActionManager(scene);
            enemy.visibility = 0;
            enemy.position.z = Math.random()*50;
            enemy.position.x = Math.random()*50;
            enemy.position.y = 2;

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
                shadowGenerator.getShadowMap().renderList.push(m);
                //shadowGenerator.useVarianceShadowMap = true;
            });
            

            asset = {meshes: enemy};


            enemy.physicsImpostor = new BABYLON.PhysicsImpostor(enemy, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 5, restitution: 0.1 }, scene);
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
    
    loader.load();
}

var run = function(scene){
    engine.runRenderLoop(function() {
        
        actor.model.rotationQuaternion = new BABYLON.Quaternion(0,0,0,1);
        
        if (actor.health > 0) {
            move(); 
        }
        else{
            var r = confirm("You Have Died. Play again?");
            if (r == true) {
                location.reload();
            } else {
                alert("Okej pa ne.");
            }
        }

        if (actor.mana < 100) {
            actor.mana = actor.mana + 0.05;
        }
        

        manaBar.value = Math.floor(actor.mana);
        document.getElementById("manaDisplay").innerHTML = "MANA: " + Math.round(actor.mana);


        var nearX, nearZ;

        needToSpawn = true;
        enemies.forEach(function(enemy) {
            if (enemy != null) {
                needToSpawn = false;
                enemy.rotationQuaternion = new BABYLON.Quaternion(0,0,0,1);

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
                    actor.score = actor.score - 1;
                    document.getElementById("scoreDisplay").innerHTML = "SCORE: " + Math.round(actor.score*100)/100;
                    healthBar.value = Math.floor(actor.health);
                    document.getElementById("healthDisplay").innerHTML = "HEALTH: " + Math.round(actor.health*100)/100;

                    // if explosive skill is active
                    if (actor.aoe > 0) {
                        enemy.health--;
                        killEnemy(enemy);
                    }
                }
            }
        });

        // if healing is active
        if (actor.heal > 0) {
            actor.health += 0.4;
            actor.heal += -0.4;
            healthBar.value = Math.floor(actor.health);
            document.getElementById("healthDisplay").innerHTML = "HEALTH: " + Math.round(actor.health*100)/100;
            if (actor.heal <= 0) {
                particleHeal.stop();
            }
        }

        if (actor.aoe > 0) {
            actor.aoe += -1;
            if (actor.aoe <= 0) {
                particleAoe.stop();
            }
        }

        if (needToSpawn && !barrier) {
            console.log("Better monsters");
            enemyCount += 2;
            enemyHealth++;
            spawnMonsters();
        }
            
        scene.render();
    });

};



var setup = function() {
    document.getElementById("hud").style.visibility = "visible";
    document.getElementById("title").style.display = "none";
    createScene();
}


canvas.addEventListener("pointerdown", onPointerDown, false);


scene.onDispose = function () {
    canvas.removeEventListener("pointerdown", onPointerDown);
}

window.addEventListener('resize', function() {
    engine.resize();
});

