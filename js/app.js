

var canvas = document.getElementById('canvas');
var engine = new BABYLON.Engine(canvas, true);


var actor, camera;

var createScene = function() {
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 50, 17), scene);
    /*
    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
    camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 15,-17), scene);
    camera.speed = 4;
    // target the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // attach the camera to the canvas
    camera.attachControl(canvas, false);
    */
    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

    // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
    var ground = BABYLON.Mesh.CreateGround('ground1', 1000, 1000, 2, scene);

    //Creation of a repeated textured material
    var materialPlane = new BABYLON.StandardMaterial("texturePlane", scene);
    materialPlane.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", scene);
    materialPlane.diffuseTexture.uScale = 55.0;//Repeat 5 times on the Vertical Axes
    materialPlane.diffuseTexture.vScale = 55.0;//Repeat 5 times on the Horizontal Axes
    materialPlane.backFaceCulling = false;//Always show the front and the back of an element

    ground.material = materialPlane;

    actor = new Actor(1, scene);

    camera.target = actor;
    camera.radius = 15;
    camera.heightOffset = 8;
    // return the created scene
    
    return scene;
}

var scene = createScene();

engine.runRenderLoop(function() {
    if (!actor.killed) {
        actor.move();

        /*camera.position.z += actor.speed;
        actor.position.z += actor.speed;
        ground.position.z += actor.speed;*/
        
    }
    scene.render();
});

window.addEventListener('resize', function() {
    engine.resize();
});



