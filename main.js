//js
var etoggle = -1;

function ts(x) {
    return JSON.stringify(x);
}

function fs(x) {
    return JSON.parse(x);
}
//settings
/*base plane height*/
let floorheight = -20;
/*player speed*/
let speed = 5;
/*jump height*/
let jump = 22;
/*max object pickup distance*/
let pickuprange = 60;
/*max velocity*/
let terminal = 22;
/*player strength (object move speed)*/
let strength = 3;
/*lower is faster, crazy exponential scaling and you gotta turn up terminal*/
let restraint = 0.99;
//functions
function intorad(x) {
    return (x * (Math.PI / 180));
};
//event listeners
document.addEventListener("click", function() {
    document.body.requestPointerLock();
});

document.addEventListener("click", shoot);

document.addEventListener("mousemove", cameramove);

document.addEventListener("keydown", keyinput);
document.addEventListener("keyup", keyupinput);

//movement
let speed1;
//cannon
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
var groundMaterial = new CANNON.Material("groundMaterial");

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
//plane
const planeShape = new CANNON.Box(new CANNON.Vec3(500, 0.5, 500));
const planeBody = new CANNON.Body({
    mass: 0,
    material: groundMaterial,
    collisionFilterGroup: 2,
    collisionFilterMask: -1
});
planeBody.addShape(planeShape);
planeBody.position.set(0, floorheight, 0);
world.addBody(planeBody);
//three
const clock = new THREE.Clock();
let delta;

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
//cam
const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
scene.add(camera);
camera.position.set(0, 0, 20);
//box
const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const basicMaterial = new THREE.MeshStandardMaterial({
    color: 0x0095dd
});
const cube = new THREE.Mesh(boxGeometry, basicMaterial);
cube.receiveShadow = true;
cube.castShadow = true;
scene.add(cube);

function reeesize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
};

window.addEventListener('resize', reeesize, false);
//plane
const plane = new THREE.BoxGeometry(1000, 1, 1000);
const planemat = new THREE.MeshStandardMaterial({
    color: 0xffffff
});
const planee = new THREE.Mesh(plane, planemat);
planee.receiveShadow = true;
scene.add(planee);
planee.position.set(0, planeBody.position.y, 0);

//lights
const light = new THREE.PointLight(0xffffff, 1500);
light.position.set(0, 15, 0);
light.castShadow = true;
scene.add(light);

const amb = new THREE.AmbientLight(0x404040, 1);
scene.add(amb);

//player
const playershape = new CANNON.Cylinder(6, 6, 10, 24);
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

//main objects
//obj loader
const loader = new THREE.OBJLoader();
/*because I am working on a file:// url and cannot use a webserver, I have to encode the object file as a base 64 url 
  and then decode it or CORS will stop me from loading it. Also I have to use three.js v1.60.1 and all plugins v 1.47.0 because
  es modules are blocked.*/
function returnobj(x) {
    return ('data:@file/octet-stream;base64,' + btoa(x));
};
//names of all the models so they can have their postion updated
let objlist = []
let objlistc = []
let modelloaded = [];
//materials
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
/*guide on groups and masks
  all groups have to be the next exponent of 2 (2^2, 2^3, etc.)
  group 1 is for objects that can be picked up/general physics objects. Only able to be jumped on if touching an object in group 2
  group 2 is for terrain objects, so things like ramps, the ground, etc. remember though if a player is touching group 2, they will always be able to jump on it
  group 4 is for the player cylinder, the one that pushes around stuff
  group 8 is for the player ball, and it was how I solved going up hills and fall speed
  group 16 is for enemys
*/
//ramp 1
const ramp1a = new CANNON.Box(new CANNON.Vec3(25, 5, 25));
const ramp1a2 = new CANNON.Body({
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
const ramp1b2 = new THREE.Mesh(ramp1b, orangemat);
ramp1b2.position.set(ramp1a2.position.x, ramp1a2.position.y, ramp1a2.position.z, ramp1a2.position.w);
ramp1b2.quaternion.set(ramp1a2.quaternion.x, ramp1a2.quaternion.y, ramp1a2.quaternion.z, ramp1a2.quaternion.w);
ramp1b2.castShadow = true;
ramp1b2.recieveShadow = true;
scene.add(ramp1b2);

//sphere 1
const sphere1a = new CANNON.Sphere(5);
const sphere1a2 = new CANNON.Body({
    mass: 15,
    collisionFilterGroup: 1,
    collisionFilterMask: -1
});
sphere1a2.nameg = "Test Sphere"
sphere1a2.addShape(sphere1a);
sphere1a2.position.set(20, 0, 20);
world.addBody(sphere1a2);

const sphere1b = new THREE.SphereGeometry(5, 36, 16);
const sphere1b2 = new THREE.Mesh(sphere1b, purplematshiny);
sphere1b2.castShadow = true;
sphere1b2.recieveShadow = true;
scene.add(sphere1b2);
//cube 1
const cubeShape = new CANNON.Box(new CANNON.Vec3(5, 5, 5));
const cubeBody = new CANNON.Body({
    mass: 100,
    collisionFilterGroup: 1,
    collisionFilterMask: -1
});
cubeBody.nameg = "Test Cube";
cubeBody.addShape(cubeShape);
cubeBody.position.set(0, 0, 0);
world.addBody(cubeBody);
//enemy test
const enemy1a = new CANNON.Cylinder(6, 6, 10, 24);
const enemy1a2 = new CANNON.Body({
    mass: 10,
    collisionFilterGroup: 16,
    collisionFilterMask: -1
});
enemy1a2.addShape(enemy1a);
enemy1a2.position.set(-20, 0, 0);
enemy1a2.hp = 100;
world.addBody(enemy1a2);

const enemy1b = new THREE.CylinderGeometry(6, 6, 10, 24, 8);
const enemy1b2 = new THREE.Mesh(enemy1b, redmat);
enemy1b2.castShadow = true;
enemy1b2.recieveShadow = true;
enemy1a2.tr = enemy1b2;
scene.add(enemy1b2);
/*addObject params:
object is the model name (the variable defined in the model)
shape is the shape of the cannon object, might change later to allow multiple, probably not
parameters1 is the cannon.js body params, ex: {mass: 10, collisionFilterGroup: 1, etc}
amount is the amount of objects
positons is an array of vec3s that sets positions of each object, ex: [[1, 10, 30], [25, 15, 60], [-20, 40, -70]]
example function: addObject(monkey_obj, new CANNON.Sphere(3), {mass: 1, collisionFilterGroup: 1, collisionFilterMask: -1}, 2, [[Math.random() * 50, 20, Math.random() * 50], [Math.random() * 50, 20, Math.random() * 50]]);
*/
function addObject(object, shape, parameters1, amount, positions) {
    for (let i = 0; i < amount; i++) {
        if (object != 0) {
            loader.load(returnobj(object), function(item) {
                scene.add(item);
                item.name = 'obj' + objlist.length;
                item.castShadow = true;
                item.scale.set(5, 5, 5);
                objlist[objlist.length] = item;
                let itema = shape
                let itemb = new CANNON.Body(parameters1);
                itemb.addShape(itema);
                itemb.position.set(positions[i][0], positions[i][1], positions[i][2]);
                objlistc[objlistc.length] = itemb;
                world.addBody(itemb);
            });
        }
    }
}

/* unused because trimeshes don't work for collision with non spheres but I'm not gonna delete it yet
var mmt = [];
var mmt2 = []
    for (var i = 0; i < 507; i++) {
      mmt[mmt.length] = modelverts(monkey_obj, i, 0);
      mmt[mmt.length] = modelverts(monkey_obj, i, 1);
      mmt[mmt.length] = modelverts(monkey_obj, i, 2);
    };
    for (var i = 0; i < 965; i++) {
     mmt2[mmt2.length] = modelfaces(monkey_obj, i, 0);
     mmt2[mmt2.length] = modelfaces(monkey_obj, i, 1);
     mmt2[mmt2.length] = modelfaces(monkey_obj, i, 2);
    };

  var shape22 = new CANNON.Trimesh(mmt, mmt2);
  var shape23 = new CANNON.Body({mass: 15, collisionFilterGroup: 1, collisionFilterMask: -1});
  shape23.addShape(shape22);
  shape23.scale = new CANNON.Vec3(10, 10, 10);
  shape23.position.y = 5;
  shape23.position.z = 20;
  world.addBody(shape23);

//get model vertexes
function modelverts(object, i, y) {
  if (y == -1) {
  return((object.split('\n').filter(line => line.startsWith('v ')))[i].replace(/v /, '')).replace(/ /g, ', ');
  } else {
    let verts = (object.split('\n').filter(line => line.startsWith('v ')))[i].replace(/v /, '');
    let att = verts.split(' ');
    return att[y];
  }
}
function modelfaces(object, i, y) {
  if (!y) {
  return((object.split('\n').filter(line => line.startsWith('f ')))[i].replace(/f /, '')).replace(/ /g, ', ');
  } else {
    let verts = (object.split('\n').filter(line => line.startsWith('f ')))[i].replace(/f /, '');
    let verts1 = verts.replace(/[1234567890]+[/][/]/g, '');
    let att = verts1.split(' ');
    return att[y];
  }
}
  */

for (let h = 0; h < 20; h++) {
    addObject(monkey_obj, new CANNON.Sphere(3), {
        mass: 1,
        collisionFilterGroup: 1,
        collisionFilterMask: -1
    }, 2, [
        [Math.random() * 200, 20, Math.random() * 200],
        [Math.random() * 200, 20, Math.random() * 200]
    ]);
}

function poscopy(a, b) {
    a.position.copy(b.position);
    a.quaternion.copy(b.quaternion);
}

function positionsetter() {
    poscopy(enemy1b2, enemy1a2);
    poscopy(sphere1b2, sphere1a2);
    camera.position.set(playerbody.position.x, playerbody.position.y, playerbody.position.z);
    poscopy(cube, cubeBody);
    //models
    for (var i = 0; i < objlist.length; i++) {
        if (scene.getObjectByName('obj' + i)) {
            poscopy(objlist[i], objlistc[i]);
        }
    }
}

//movement and interactions
//key presses
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
            if (bodiesAreInContact(c.bj, 2, 1) === true) {
                return true;
            }
        }
    }
    return false;
}
//picking up stuff
//check for max object hold distance
function gdistance(p) {
    if (Math.abs(playerbody.position.x) - Math.abs(p.position.x) <= pickuprange && Math.abs(playerbody.position.y) - Math.abs(p.position.y) <= pickuprange && Math.abs(playerbody.position.z) - Math.abs(p.position.z) <= pickuprange && Math.abs(playerbody.position.x) - Math.abs(p.position.x) >= pickuprange * -1 && Math.abs(playerbody.position.y) - Math.abs(p.position.y) >= pickuprange * -1 && Math.abs(playerbody.position.z) - Math.abs(p.position.z) >= pickuprange * -1) {
        return true
    } else {
        return false
    }
}
//use raycasting to check for what object the cam is looking at
var pobj = new CANNON.RaycastResult

function pickup() {
    if (etoggle == 1) {
        if (pobj.body != null && gdistance(pobj.body) == true) {
            pobj.body.velocity.x = ((playerbody.position.x - pobj.body.position.x + 5 * camdir.x) / (pobj.body.mass / 7)) * strength;
            pobj.body.velocity.y = ((playerbody.position.y - pobj.body.position.y + 5 * camdir.y) / (pobj.body.mass / 7)) * strength;
            pobj.body.velocity.z = ((playerbody.position.z - pobj.body.position.z + 5 * camdir.z) / (pobj.body.mass / 7)) * strength;
        } else {
            etoggle = -1
        }
    } else {
        world.raycastClosest(new CANNON.Vec3(camera.position.x, camera.position.y, camera.position.z), new CANNON.Vec3(camera.position.x + camdir.x * 100, camera.position.y + camdir.y * 100, camera.position.z + camdir.z * 100), {
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
            rollbody.velocity.x += camdir.x;
            rollbody.velocity.z += camdir.z;
            rollbody.velocity.y += camdir.z;
        } else {
            rollbody.velocity.x += camdir.x;
            rollbody.velocity.z += camdir.z;
        }
    }
    if (keystatus[2] == 1) {
        rollbody.velocity.x += camdir.z;
        rollbody.velocity.z += camdir.x * -1;
    };
    if (keystatus[4] == 1) {
        if (noclip == 1) {
            playerbody.velocity.x -= camdir.x;
            playerbody.velocity.z -= camdir.z;
            rollbody.velocity.y -= camdir.z;
        } else {
            rollbody.velocity.x -= camdir.x;
            rollbody.velocity.z -= camdir.z;
        }
    }
    if (keystatus[6] == 1) {
        rollbody.velocity.x += camdir.z * -1;
        rollbody.velocity.z += camdir.x;
    };
    if (keystatus[8] == 1) {
        if (bodiesAreInContact(rollbody, 2) === true) {
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
            rollbody.velocity.y = Math.min(terminal, rollbody.velocity.y - 0.5);
        } else {
            rollbody.velocity.y = Math.max(terminal * -1, rollbody.velocity.y - 0.5);
        }
    }
    if (rollbody.velocity.x >= 0) {
        rollbody.velocity.x = Math.min(terminal, rollbody.velocity.x - 0.5);
    } else {
        rollbody.velocity.x = Math.max(terminal * -1, rollbody.velocity.x + 0.5);
    }

    if (rollbody.velocity.z >= 0) {
        rollbody.velocity.z = Math.min(terminal, rollbody.velocity.z - 0.5);
    } else {
        rollbody.velocity.z = Math.max(terminal * -1, rollbody.velocity.z + 0.5);
    }
    pickup(etoggle);
    playerbody.position.x = rollbody.position.x;
    playerbody.position.z = rollbody.position.z;
    playerbody.position.y = rollbody.position.y + 10;
}
//shooting
function shoot() {
    var sobj = new CANNON.RaycastResult();
    world.raycastClosest(new CANNON.Vec3(camera.position.x, camera.position.y, camera.position.z), new CANNON.Vec3(camera.position.x + camdir.x * 100, camera.position.y + camdir.y * 100, camera.position.z + camdir.z * 100), {
        collisionFilterMask: 16,
        collisionFilterGroup: 32
    }, sobj);
    sobj.body.hp -= 20;
    if (sobj.body.hp <= 0) {
        world.removeBody(sobj.body);
        scene.remove(sobj.body.tr);
    }
}
//render

let t = 0;
var cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world, {});

function render() {
    positionsetter();
    delta = Math.min(clock.getDelta(), 0.1);
    world.step(delta);

    mover();

    t += delta;
    world.step(delta);
    requestAnimationFrame(render);

    // Get and print the rigid-body's position.
    renderer.render(scene, camera);
}
render();