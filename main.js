//three init
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0x000000, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById("renderdiv").appendChild(renderer.domElement);

const scene = new THREE.Scene();

const clock = new THREE.Clock();
let delta;

//camera
const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
scene.add(camera);
camera.position.set(0, 0, 20);

//cannon init
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
var groundMaterial = new CANNON.Material("groundMaterial");

//ground mats (mostly unused)
// Adjust constraint equation parameters for ground/ground contact
var ground_ground_cm = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
    friction: 0.4,
    restitution: 0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8,
    frictionEquationRegularizationTime: 3,
});

// Add contact material to the world
world.addContactMaterial(ground_ground_cm);
// Create a slippery material (friction coefficient = 0.0)
var slipperyMaterial = new CANNON.Material("slipperyMaterial");

// The ContactMaterial defines what happens when two materials meet.
// In this case we want friction coefficient = 0.0 when the slippery material touches ground.
var slippery_ground_cm = new CANNON.ContactMaterial(groundMaterial, slipperyMaterial, {
    friction: 0,
    restitution: 0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3
});

// We must add the contact materials to the world
world.addContactMaterial(slippery_ground_cm);

//js
var etoggle = -1;

function v3(x, y, z) {
    return (new CANNON.Vec3(x, y, z));
};

function q4(x, y, z, w) {
    return (new CANNON.Quaternion(x, y, z, w));
};

function ts(x) {
    return JSON.stringify(x);
}

function fs(x) {
    return JSON.parse(x);
}
//settings
//base plane height
let floorheight = -20;
//player speed
let speed = 4;
//jump height
let jump = 22;
//max object pickup distance
let pickuprange = 40;
//player strength (object move speed)
let strength = 3;
//angular damping
let restraint = 0.5;
//functions
function intorad(x) {
    return (x * (Math.PI / 180));
};
function reeesize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
};
//event listeners
document.addEventListener("click", function() {
    document.body.requestPointerLock();
});

document.addEventListener("click", shoot);

document.addEventListener("mousemove", cameramove);

document.addEventListener("keydown", keyinput);
document.addEventListener("keyup", keyupinput);

window.addEventListener('resize', reeesize, false);


//player
let speed1
const playershape = new CANNON.Cylinder(6, 6, 14, 24);
const playerbody = new CANNON.Body({
    mass: 5,
    material: groundMaterial,
    allowSleep: false,
    fixedRotation: true,
    collisionFilterGroup: 4,
    collisionFilterMask: 1 | 2
});
playerbody.addShape(playershape);
playerbody.position.set(0, 10, 30);
playerbody.health = 150;
playerbody.linearDamping = restraint;
world.addBody(playerbody);

const rolls = new CANNON.Sphere(2);
const rollbody = new CANNON.Body({
    mass: 10,
    material: groundMaterial,
    allowSleep: false,
    collisionFilterGroup: 8,
    collisionFilterMask: 1 | 2
});
rollbody.addShape(rolls);
rollbody.position.set(0, 10, 30);
rollbody.angularDamping = restraint;
world.addBody(rollbody);

//basic materials
let modelloaded = [];
const orangemat = new THREE.MeshPhysicalMaterial({
    color: 0xff4f00
});
const purplemat = new THREE.MeshPhysicalMaterial({
    color: 0xa020f0
});
const redmat = new THREE.MeshPhysicalMaterial({
    color: 0xaff0000
});
const orangematshiny = new THREE.MeshPhysicalMaterial({
    color: 0xff4f00,
    roughness: 0.25,
    metalness: 0.75
});
const purplematshiny = new THREE.MeshPhysicalMaterial({
    color: 0xa020f0,
    roughness: 0.25,
    metalness: 0.75
});
const redmatshiny = new THREE.MeshPhysicalMaterial({
    color: 0xff0000,
    roughness: 0.25,
    metalness: 0.75
});

let terrainlist = [];
//object hitboxes (hitbox creator)
function monkeybox(){let box1302571 = new CANNON.Body({mass: 50, collisionFilterGroup: 1, collisionFilterMask: -1}); const shape645426 = new CANNON.Sphere(1.875); box1302571.addShape(shape645426, v3(0,1.4500000000000006,-0.65), q4(0,0,0,1)); const shape6531925 = new CANNON.Box(v3(1.5,2.5,1)); box1302571.addShape(shape6531925, v3(0,-2.25,2.6499999999999986), q4(-6.938893903907228e-18,0,0,1)); const shape3674056 = new CANNON.Box(v3(1.75,1.375,0.5)); box1302571.addShape(shape3674056, v3(-4.799999999999991,0.8500000000000001,-1.9000000000000088), q4(0.03031364357631054,-0.17144890372772567,-0.17144890372772567,0.9696863564236894)); const shape2946292 = new CANNON.Box(v3(1.75,1.5,0.5)); box1302571.addShape(shape2946292, v3(5.349999999999989,0.8500000000000004,-2.000000000000001), q4(0.01983383807620987,0.19767681165408385,0.09784339500725571,0.975170327201816)); const shape3511336 = new CANNON.Box(v3(3,2.5,2)); box1302571.addShape(shape3511336, v3(0,1.2500000000000004,1.8500000000000008), q4(0,0,0,1)); world.addBody(box1302571); return box1302571;}
function enemy1box(){let box469612 = new CANNON.Body({mass: 5, collisionFilterGroup: 1, collisionFilterMask: -1}); const shape2867977 = new CANNON.Cylinder(3.5,0.5,5,16); box469612.addShape(shape2867977, v3(0,0,0), q4(0,0,0,1)); world.addBody(box469612); return box469612;}
//model loader
const loader = new THREE.OBJLoader();
/*because I am working on a file:// url and cannot use a webserver, I have to encode the object file as a base 64 url 
  and then decode it or CORS will stop me from loading it. Also I have to use three.js v1.60.1 and plugins ~v1.47.0 because
  fetch() and file imports are blocked.*/
function returnobj(x) {
    return ('data:@file/octet-stream;base64,' + btoa(x));
};
//names of all the models so they can have their postion updated
let objlist = [];
let objlistc = [];
//actual model loading part
/*addObject params:
object is the model name (the variable defined in the model)
hitbox is the hitbox name (exported from my hitbox maker, link in readme) 
amount is the amount of objects
positons is an array of vec3s that sets positions of each object, ex: [[1, 10, 30], [25, 15, 60], [-20, 40, -70]]
example function: addObject(monkey_obj, monkeybox, {mass: 1, collisionFilterGroup: 1, collisionFilterMask: -1}, 4, [50, 50, 50], [Math.random() * 20, 12, -30]);
*/
function addObject(object, hitbox, amount, positions) {
    for (let i = 0; i < amount; i++) {
        if (object != 0) {
            loader.load(returnobj(object), function(item) {
                scene.add(item);
                item.name = 'obj' + objlist.length;
                item.castShadow = true;
                item.scale.set(5, 5, 5);
                objlist[objlist.length] = item;
                //monkey hitbox
                objlistc[objlistc.length] = hitbox();
                objlistc[objlistc.length - 1].position.set(positions[i][0], positions[i][1], positions[i][2]);
            });
        }
    }
}

//levels/terrain
/*guide on groups and masks (irrelevant due to level editor but here for future reference)
  all groups have to be the next exponent of 2 (2^2, 2^3, etc.)
  group 1 is for objects that can be picked up/general physics objects. Only able to be jumped on if touching an object in group 2
  group 2 is for terrain objects, so things like ramps, the ground, etc. remember though if a player is touching group 2, they will always be able to jump on it
  group 4 is for the player cylinder, the one that pushes around stuff
  group 8 is for the player ball, and it was how I solved going up hills and fall speed
  group 16 is for enemys
*/

//original test level
let cubeBody
let ramp1a2
let ramp1b2
let sphere1a2
let sphere1b2
let cube
let planeBody
let boxGeometry
let planee
function testlevel() {
world.gravity.set(0, -9.82, 0);
//terain
//level editor new
//level editor old (terrain creator)
let box8869008 = new CANNON.Body({mass: 0, collisionFilterGroup: 2, collisionFilterMask: 1 | 4 | 8}); const shape5319197 = new CANNON.Box(v3(5,10,5)); box8869008.addShape(shape5319197, v3(0,-21.900000000000176,0), q4(0,0,0.6051864057360398,0.7960837985490556)); let threeshape2663204 = new THREE.BoxGeometry(10,20,10); let threebox9082840 = new THREE.Mesh(threeshape2663204, redmat); scene.add(threebox9082840); threebox9082840.quaternion.x = 0; threebox9082840.quaternion.y = 0; threebox9082840.quaternion.z = 0.6051864057360398; threebox9082840.quaternion.w = 0.7960837985490556; threebox9082840.quaternion.normalize(); threebox9082840.position.x = 0; threebox9082840.position.y = -21.900000000000176; threebox9082840.position.z = 0; world.addBody(box8869008);
//old objects and terrain (not level editor created objects)
//original model adding test
for (let h = 0; h < 20; h++) {
    addObject(monkey_obj, monkeybox, 1, [
        [Math.random() * 200, 20, Math.random() * 200],
        [Math.random() * 200, 20, Math.random() * 200]
    ]);
}

//plane
const planeShape = new CANNON.Box(v3(500, 0.5, 500));
planeBody = new CANNON.Body({
    mass: 0,
    material: groundMaterial,
    collisionFilterGroup: 2,
    collisionFilterMask: -1
});
planeBody.addShape(planeShape);
planeBody.position.set(0, floorheight, 0);
world.addBody(planeBody);

//box
boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const basicMaterial = new THREE.MeshStandardMaterial({
    color: 0x0095dd
});
cube = new THREE.Mesh(boxGeometry, basicMaterial);
cube.receiveShadow = true;
cube.castShadow = true;
scene.add(cube);

//plane
const plane = new THREE.BoxGeometry(1000, 1, 1000);
const planemat = new THREE.MeshStandardMaterial({
    color: 0xffffff
});
planee = new THREE.Mesh(plane, planemat);
planee.receiveShadow = true;
scene.add(planee);
planee.position.set(0, planeBody.position.y, 0);

//lights
const light = new THREE.PointLight(0xffffff, 1500);
light.position.set(0, 15, 0);
light.castShadow = true;
scene.add(light);

const amb = new THREE.AmbientLight(0x404040, 5);
scene.add(amb);


//ramp 1
const ramp1a = new CANNON.Box(v3(25, 5, 25));
ramp1a2 = new CANNON.Body({
    mass: 0,
    collisionFilterGroup: 2,
    collisionFilterMask: 1 | 4 | 8
});
ramp1a2.addShape(ramp1a);
ramp1a2.position.set(60, -19, 20);
ramp1a2.quaternion.set(0.15, 0, 0, 1);
ramp1a2.quaternion.normalize();
world.addBody(ramp1a2);

const ramp1b = new THREE.BoxGeometry(50, 10, 50);
ramp1b2 = new THREE.Mesh(ramp1b, orangemat);
ramp1b2.position.set(ramp1a2.position.x, ramp1a2.position.y, ramp1a2.position.z, ramp1a2.position.w);
ramp1b2.quaternion.set(ramp1a2.quaternion.x, ramp1a2.quaternion.y, ramp1a2.quaternion.z, ramp1a2.quaternion.w);
ramp1b2.castShadow = true;
ramp1b2.recieveShadow = true;
scene.add(ramp1b2);

//sphere 1
const sphere1a = new CANNON.Sphere(5);
sphere1a2 = new CANNON.Body({
    mass: 15,
    collisionFilterGroup: 1,
    collisionFilterMask: -1
});
sphere1a2.nameg = "Test Sphere"
sphere1a2.addShape(sphere1a);
sphere1a2.position.set(20, 0, 20);
world.addBody(sphere1a2);

const sphere1b = new THREE.SphereGeometry(5, 36, 16);
sphere1b2 = new THREE.Mesh(sphere1b, purplematshiny);
sphere1b2.castShadow = true;
sphere1b2.recieveShadow = true;
scene.add(sphere1b2);
//cube 1
const cubeShape = new CANNON.Box(v3(5, 5, 5));
cubeBody = new CANNON.Body({
    mass: 10,
    collisionFilterGroup: 1,
    collisionFilterMask: -1
});
cubeBody.nameg = "Test Cube";
cubeBody.addShape(cubeShape)

cubeBody.position.set(0, -10, 30);
world.addBody(cubeBody);
//end of test level
}

//movement and interactions
//input handling
var keystatus = [0, "w", 0, "a", 0, "s", 0, "d", 0, " ", 0, "y", 0, "e", 0, "v", 0, "Shift"];

function keyinput(e) {
    keystatus[keystatus.indexOf(e.key) - 1] = 1;
    if (e.code == "KeyV") {
        noclip *= -1;
    };
    if (e.code == "KeyE") {
        etoggle *= -1;
    };
};

function keyupinput(e) {
    keystatus[keystatus.indexOf(e.key) - 1] = 0;
};

camera.rotation.order = "YXZ";

function cameramove(e) {
    camera.rotateX(-1 * e.movementY / 1000);
    camera.rotation.y -= e.movementX / 1000;
}

const camdir = new THREE.Vector3;

let noclip = -1;
//the check for jump height
function bodiesAreInContact(obj, group, y) {
    for (var i = 0; i < world.contacts.length; i++) {
        var c = world.contacts[i];
        if (c.bi === obj && c.bj.collisionFilterGroup === group) {
            return true;
        } else if (c.bi === obj && c.bj.collisionFilterGroup === 1 && y != 1) {
            if (bodiesAreInContact(c.bj, group, 1) === true) {
                return true;
            }
        }
    }
    return false;
}
//picking up stuff
//check for max object hold distance
function gdistance(p, r) {
    if (Math.abs(playerbody.position.x) - Math.abs(p.position.x) <= r && Math.abs(playerbody.position.y) - Math.abs(p.position.y) <= r && Math.abs(playerbody.position.z) - Math.abs(p.position.z) <= r && Math.abs(playerbody.position.x) - Math.abs(p.position.x) >= r * -1 && Math.abs(playerbody.position.y) - Math.abs(p.position.y) >= r * -1 && Math.abs(playerbody.position.z) - Math.abs(p.position.z) >= r * -1) {
        return true
    } else {
        return false
    }
}
//use raycasting to check for what object the cam is looking at
var pobj = new CANNON.RaycastResult

function pickup() {
    if (etoggle == 1) {
        if (pobj.body != null && gdistance(pobj.body, pickuprange) == true) {
            pobj.body.velocity.x = ((playerbody.position.x - pobj.body.position.x + 5 * camdir.x) / (pobj.body.mass / 7)) * strength;
            pobj.body.velocity.y = ((playerbody.position.y - pobj.body.position.y + 5 * camdir.y) / (pobj.body.mass / 7)) * strength;
            pobj.body.velocity.z = ((playerbody.position.z - pobj.body.position.z + 5 * camdir.z) / (pobj.body.mass / 7)) * strength;
        } else {
            etoggle = -1
        }
    } else {
        world.raycastClosest(v3(camera.position.x, camera.position.y, camera.position.z), v3(camera.position.x + camdir.x * 100, camera.position.y + camdir.y * 100, camera.position.z + camdir.z * 100), {
            collisionFilterMask: 1,
            collisionFilterGroup: 32
        }, pobj);
    };
}
//actual movement controls
function mover() {
    camera.getWorldDirection(camdir);
    camdir.x *= speed1;
    camdir.y *= speed1;
    camdir.z *= speed1;
    if (keystatus[0] == 1) {
        if (noclip == 1) {
            playerbody.velocity.x += camdir.x;
            playerbody.velocity.z += camdir.z;
            rollbody.velocity.y += camdir.z;
        } else {
            playerbody.velocity.x += camdir.x;
            playerbody.velocity.z += camdir.z;
        }
    }
    if (keystatus[2] == 1) {
        playerbody.velocity.x += camdir.z;
        playerbody.velocity.z += camdir.x * -1;
    };
    if (keystatus[4] == 1) {
        if (noclip == 1) {
            playerbody.velocity.x -= camdir.x;
            playerbody.velocity.z -= camdir.z;
            rollbody.velocity.y -= camdir.z;
        } else {
            playerbody.velocity.x -= camdir.x;
            playerbody.velocity.z -= camdir.z;
        }
    }
    if (keystatus[6] == 1) {
        playerbody.velocity.x += camdir.z * -1;
        playerbody.velocity.z += camdir.x;
    };
    if (keystatus[8] == 1) {
        if (bodiesAreInContact(rollbody, 2, 0) === true) {
            rollbody.velocity.y += jump;
        }
    };
    if (keystatus[10] == 1) {
        camera.position.y -= 1;
    };
    if (keystatus[16] == 1) {
        //speed1 = speed * 1.4;
    } else {
        speed1 = speed;
    }
    //max velocity enforcer and better slowing
    if (bodiesAreInContact(rollbody, 2) === false) {
        if (rollbody.velocity.y >= 0) {
            rollbody.velocity.y = Math.min(22, rollbody.velocity.y - 0.5);
        } else {
            rollbody.velocity.y = Math.max(-22, rollbody.velocity.y - 0.5);
        }
    }
    playerbody.velocity.x /= 1.075;
    playerbody.velocity.z /= 1.075;
    pickup(etoggle);
    rollbody.position.x = playerbody.position.x;
    rollbody.position.z = playerbody.position.z;
    playerbody.position.y = rollbody.position.y + 8;
}

//enemy/weapons
var enemylist = [];
function enemy1base(){let box1756912 = new CANNON.Body({mass: 10, collisionFilterGroup: 16, collisionFilterMask: -1}); const shape7993561 = new CANNON.Box(v3(3.5,2.5,3.5)); box1756912.addShape(shape7993561, v3(0,-1.6000000000000005,0), q4(0,0,0,1)); const shape7072548 = new CANNON.Box(v3(5,3,5)); box1756912.addShape(shape7072548, v3(0,2.9999999999999973,0), q4(0,0,0,1)); world.addBody(box1756912); box1756912.health = 100; box1756912.maxdist = 100; enemylist[enemylist.length] = [box1756912]; let enemy2head = new THREE.BoxGeometry(10, 6, 10); let enemy1head2 = new THREE.Mesh(enemy2head, orangematshiny); scene.add(enemy1head2); enemy1head2.name = 'obj' + enemylist.length; enemylist[enemylist.length - 1][1] = enemy1head2; enemylist[enemylist.length - 1][2] = [0, 10, 0]; enemylist[enemylist.length - 1][1].damage = 10; return box1756912;}
addObject(enemy1base_obj, enemy1base, 1, [[10, 50, 0]]);
addObject(enemy1base_obj, enemy1base, 1, [[20, 50, 0]]);
//shooting
//name, damage, model
let g1_obj;
var weplist = [["g1", 10, g1_obj]];
var wep = 0;
function shoot() {
    var sobj = new CANNON.RaycastResult();
    world.raycastClosest(v3(camera.position.x, camera.position.y, camera.position.z), v3(camera.position.x + camdir.x * 100, camera.position.y + camdir.y * 100, camera.position.z + camdir.z * 100), {
        collisionFilterMask: 16,
        collisionFilterGroup: 32
    }, sobj);
    if (sobj.body.health) {
    sobj.body.health -= weplist[wep][1];
    sobj.body.applyImpulse(v3(camdir.x * weplist[wep][1]/(sobj.body.mass/1.5), camdir.y * weplist[wep][1]/(sobj.body.mass/1.5), camdir.z * weplist[wep][1]/(sobj.body.mass/1.5)), v3(0, 0, 0))
    if (sobj.body.health <= 0) {
        world.removeBody(sobj.body);
        scene.remove(objlist[objlistc.indexOf(sobj.body)]);
        for (let i = 0; i < enemylist.length; i++) {
            if (enemylist[i][0] == sobj.body) {
                scene.remove(enemylist[i][1]);
            }
        } 
    }
    }
}

function enemyshoot(enemy, i) {
    enemylist[i][3] = 1;
    setTimeout(() => {
    var hitm = new CANNON.RaycastResult();
    let efacing = new THREE.Vector3();
    enemy.getWorldDirection(efacing);
    world.raycastClosest(v3(enemy.position.x, enemy.position.y, enemy.position.z), v3(enemy.position.x + efacing.x * 100, enemy.position.y + efacing.y * 100, enemy.position.z + efacing.z * 100), {
        collisionFilterMask: 1 | 2 | 4,
        collisionFilterGroup: -1
    }, hitm);
    if (hitm.body && hitm.body.collisionFilterGroup == 4 && gdistance(enemylist[i][1], enemylist[i][0].maxdist) == true && enemylist[i][1].parent == scene) {
        if (playerbody.health > 0) {
            playerbody.health -= enemy.damage;
            document.getElementById("health").innerHTML = Math.round(playerbody.health);
        }
    }
    enemylist[i][3] = 0;
    }, 3000);
}

const target1 = new THREE.Object3D();
function track(i) {
    if (gdistance(enemylist[i][1], enemylist[i][0].maxdist) == true && enemylist[i][1].parent == scene) {
        poscopy(target1, enemylist[i][1]);
        target1.lookAt(camera.position);
        enemylist[i][1].quaternion.slerp(target1.quaternion, 0.075);
        if (!(enemylist[i][3]) || enemylist[i][3] == 0) {
            enemyshoot(enemylist[i][1], i);
        }
    }
}
//model/hitbox synchronizing
function poscopy(a, b) {
    a.position.copy(b.position);
    a.quaternion.copy(b.quaternion);
}

function positionsetter() {
    poscopy(sphere1b2, sphere1a2);
    camera.position.set(playerbody.position.x, playerbody.position.y, playerbody.position.z);
    poscopy(cube, cubeBody);
    //models
    for (var i = 0; i < objlist.length; i++) {
        if (scene.getObjectByName('obj' + i)) {
            poscopy(objlist[i], objlistc[i]);
        }
    }
    for (var i = 0; i < enemylist.length; i++) {
        if (scene.getObjectByName('obj' + i)) {
            enemylist[i][1].position.copy(enemylist[i][0].position);
            if (enemylist[i][2]) {
                enemylist[i][1].position.x += enemylist[i][2][0];
                enemylist[i][1].position.y += enemylist[i][2][1];
                enemylist[i][1].position.z += enemylist[i][2][2];
            }
            track(i);
        }
    }
}
//load level (testing purposes)
testlevel()
//render
function render() {
    positionsetter();
    delta = Math.min(clock.getDelta(), 0.1);
    mover();
    world.step(delta);
    world.step(delta);
    requestAnimationFrame(render);
    // Get and print the rigid-body's position.
    renderer.render(scene, camera);
}
render();