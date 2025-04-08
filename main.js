//js
//settings
let floorheight = -20;
let speed = 5;
let jump = 0;
//terminal falling velocity
let terminal = 25;
//functions
function intorad(x) {
  return (x * (Math.PI/180));
};
//event listeners
document.addEventListener("click", function(){
  document.body.requestPointerLock();
});
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
 
//cube
const cubeShape = new CANNON.Box(new CANNON.Vec3(5, 5, 5));
const cubeBody = new CANNON.Body({mass: 5, collisionFilterGroup: 1, collisionFilterMask: -1});
cubeBody.addShape(cubeShape);
cubeBody.position.set(0, 0, 0);
world.addBody(cubeBody);
//plane
const planeShape = new CANNON.Box(new CANNON.Vec3(500, 0.5, 500));
const planeBody = new CANNON.Body({mass: 0, material: groundMaterial, collisionFilterGroup: 2, collisionFilterMask: -1});
planeBody.addShape(planeShape);
planeBody.position.set(0, floorheight, 0);
world.addBody(planeBody);
//player
const playershape = new CANNON.Cylinder(6, 6, 12, 8);
const playerbody = new CANNON.Body({mass: 5, material: groundMaterial, allowSleep: false, fixedRotation: true, collisionFilterGroup: 4, collisionFilterMask: 1 | 2});
playerbody.addShape(playershape);
playerbody.position.set(0, 25, 20);
playerbody.linearDamping = 0.99;
world.addBody(playerbody);

const rolls = new CANNON.Sphere(2);
const rollbody = new CANNON.Body({mass: 10, material: groundMaterial, allowSleep: false, collisionFilterGroup: 8, collisionFilterMask: 1 | 2});
rollbody.addShape(rolls);
rollbody.position.y = 10;
world.addBody(rollbody);
//three
const clock = new THREE.Clock();
let delta;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0x000000, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
//cam
const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
scene.add(camera);
camera.position.set(0, 0, 20);
//box
const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const basicMaterial = new THREE.MeshStandardMaterial({ color: 0x0095dd });
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
const planemat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const planee = new THREE.Mesh(plane, planemat);
planee.receiveShadow = true;
scene.add(planee);
planee.position.set(0, planeBody.position.y, 0);

//lights
const light = new THREE.PointLight(0xffffff, 1500);
light.position.set(0, 15, 0);
light.castShadow = true;
scene.add(light);

const amb = new THREE.AmbientLight(0x404040, 0);
scene.add(amb);


  //materials
  const orangemat = new THREE.MeshPhysicalMaterial({color: 0xff4f00});
  const purplemat = new THREE.MeshPhysicalMaterial({color: 0xa020f0});
  const orangematshiny = new THREE.MeshPhysicalMaterial({color: 0xff4f00, roughness: 0.25, metalness: 0.75});
  const purplematshiny = new THREE.MeshStandardMaterial({color: 0xa020f0, roughness: 0.25, metalness: 0.75});
  //ramp 1
  const ramp1a = new CANNON.Box(new CANNON.Vec3(25, 5, 25));
  const ramp1a2 = new CANNON.Body({mass: 0, collisionFilterGroup: 2, collisionFilterMask: 1 | 4 | 8});
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
  const sphere1a2 = new CANNON.Body({mass: 15, collisionFilterGroup: 1, collisionFilterMask: -1});
  sphere1a2.addShape(sphere1a);
  sphere1a2.position.set(20, 0, 20);
  world.addBody(sphere1a2);

  const sphere1b = new THREE.SphereGeometry(5, 36, 16);
  const sphere1b2 = new THREE.Mesh(sphere1b, purplematshiny);
  scene.add(sphere1b2);

function positionsetter() {
  sphere1b2.position.set(sphere1a2.position.x, sphere1a2.position.y, sphere1a2.position.z);
  sphere1b2.quaternion.set(sphere1a2.quaternion.x, sphere1a2.quaternion.y, sphere1a2.quaternion.z, sphere1a2.quaternion.w);
  camera.position.set(playerbody.position.x, playerbody.position.y, playerbody.position.z);
  cube.position.set(cubeBody.position.x, cubeBody.position.y, cubeBody.position.z);
  cube.quaternion.set(cubeBody.quaternion.x, cubeBody.quaternion.y, cubeBody.quaternion.z, cubeBody.quaternion.w);
}

//movement
var keystatus = [0, "w", 0, "a", 0, "s", 0, "d", 0, " ", 0, "y", 0, "e", 0, "v", 0, "Shift"];

function keyinput(e) {
  keystatus[keystatus.indexOf(e.key) - 1] = 1;
  if (e.code == "KeyV") {
    noclip *= -1;
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

var rayy = new CANNON.Ray();

function bodiesAreInContact(obj, group, y){
  for(var i=0; i<world.contacts.length; i++){
      var c = world.contacts[i];
      if(c.bi === obj && c.bj.collisionFilterGroup === group){
          return true;
      } else if (c.bi === obj && c.bj.collisionFilterGroup === 1 && y != 1) {
        if (bodiesAreInContact(c.bj, 2, 1) === true) {
          return true;
        }
      }
  }
  return false;
}

function mover() {
  camera.getWorldDirection(camdir);
  camdir.x *= speed1;
  camdir.y *= speed1;
  camdir.z *= speed1;
  if (keystatus[0] == 1) {
    if (noclip == 1) {
      playerbody.velocity.x += camdir.x;
      playerbody.velocity.z += camdir.z;
      playerbody.velocity.y += camdir.z;
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
        playerbody.velocity.y -= camdir.z;
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
    if (bodiesAreInContact(rollbody, 2) === true) {
      rollbody.velocity.y += 30;
    }
  };
  if (keystatus[10] == 1) {
    camera.position.y -= 1;
  };
  if (keystatus[16] == 1) {
    speed1 = speed * 1.65;
  } else {
    speed1 = speed;
  }
  if (bodiesAreInContact(rollbody, 2) === false)  {
    rollbody.velocity.y = Math.max(terminal * -1, rollbody.velocity.y - 0.5);
  }
    rollbody.position.x = playerbody.position.x;
    rollbody.position.z = playerbody.position.z;
    playerbody.position.y = rollbody.position.y + 10;
}

let t = 0;
function render() {
  delta = Math.min(clock.getDelta(), 0.1);
  world.step(delta);
  mover();
  positionsetter();
  t += delta;
  world.step(delta);
  requestAnimationFrame(render);

  // Get and print the rigid-body's position.
  renderer.render(scene, camera);
}
render();
