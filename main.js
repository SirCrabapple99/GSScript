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
const cubeBody = new CANNON.Body({mass: 5, collisionFilterGroup: 1, collisionFilterMask: 1 | 4});
cubeBody.addShape(cubeShape);
cubeBody.position.set(0, 0, 0);
world.addBody(cubeBody);
//plane
const planeShape = new CANNON.Box(new CANNON.Vec3(500, 0.5, 500));
const planeBody = new CANNON.Body({mass: 0, material: groundMaterial, collisionFilterGroup: 1, collisionFilterMask: 1 | 2});
planeBody.addShape(planeShape);
planeBody.position.set(0, -20, 0);
world.addBody(planeBody);
//player
const rollshape = new CANNON.Box(new CANNON.Vec3(3, 3, 3));
const rollbody = new CANNON.Body({mass: 5, allowSleep: false, collisionFilterGroup: 2, collisionFilterMask: 1});
rollbody.addShape(rollshape);
rollbody.position.set(0, 5, 20);
world.addBody(rollbody);

const playershape = new CANNON.Box(new CANNON.Vec3(5, 12, 5));
const playerbody = new CANNON.Body({mass: 5, material: groundMaterial, allowSleep: false, fixedRotation: true, collisionFilterGroup: 4, collisionFilterMask: 1});
playerbody.addShape(playershape);
playerbody.position.set(0, 25, 20);
playerbody.linearDamping = 0.99;
world.addBody(playerbody);
//three
const clock = new THREE.Clock();
let delta;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0xdddddd, 1);
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
const light = new THREE.PointLight(0xffffff, 1000);
light.position.set(0, 15, 0);
light.castShadow = true;
scene.add(light);

const amb = new THREE.AmbientLight(0x404040, 5);
scene.add(amb);
//movement
var keystatus = [0, "KeyW", 0, "KeyA", 0, "KeyS", 0, "KeyD", 0, "Space", 0, "KeyY", 0, "KeyE", 0, "KeyV"];

function keyinput(e) {
  keystatus[keystatus.indexOf(e.code) - 1] = 1;
  if (e.code == "KeyV") {
    noclip *= -1;
  }
};

function keyupinput(e) {
  keystatus[keystatus.indexOf(e.code) - 1] = 0;
};

camera.rotation.order = "YXZ";

function cameramove(e) {
   camera.rotateX(-1 * e.movementY / 1000);
   camera.rotation.y -= e.movementX / 1000;
}

const camdir = new THREE.Vector3;

let noclip = -1;

function mover() {
  camera.getWorldDirection(camdir);
  camdir.x *= 1000;
  camdir.y *= 1000;
  camdir.z *= 1000;
  playerbody.position.y = rollbody.position.y + 16;
  if (keystatus[0] == 1) {
    if (noclip == 1) {
      playerbody.applyForce(camdir, new CANNON.Vec3(0, 0, 0));
      rollerbody.position.y = playerbody.position.y - 16
    } else {
      playerbody.applyForce(new CANNON.Vec3(camdir.x, 0, camdir.z), new CANNON.Vec3(0, 0, 0));
    }
  };
  if (keystatus[2] == 1) {
  camera.translateX(-1);
  };
  if (keystatus[4] == 1) {
    if (noclip == 1) {
      playerbody.applyForce(new CANNON.Vec3(camdir.x * -1, camdir.y * -1, camdir.z * -1), new CANNON.Vec3(0, 0, 0));
      } else {
        playerbody.applyForce(new CANNON.Vec3(camdir.x * -1, 0, camdir.z * -1), new CANNON.Vec3(0, 0, 0));
      }
  };
  if (keystatus[6] == 1) {
    camera.translateX(1);
  };
  if (keystatus[8] == 1) {
    camera.position.y += 1;
  };
  if (keystatus[10] == 1) {
    camera.position.y -= 1;
  };
}
document.addEventListener("click", function(){
  document.body.requestPointerLock();
});
document.addEventListener("mousemove", cameramove);

document.addEventListener("keypress", keyinput);
document.addEventListener("keyup", keyupinput);
//render

let t = 0;
function render() {
  delta = Math.min(clock.getDelta(), 0.1);
  world.step(delta);
  mover();
  t += delta;
  camera.position.set(playerbody.position.x, playerbody.position.y, playerbody.position.z);
  cube.position.set(cubeBody.position.x, cubeBody.position.y, cubeBody.position.z);
  cube.quaternion.set(cubeBody.quaternion.x, cubeBody.quaternion.y, cubeBody.quaternion.z, cubeBody.quaternion.w);
  world.step(delta);
  requestAnimationFrame(render);

  // Get and print the rigid-body's position.
  renderer.render(scene, camera);
}
render();
