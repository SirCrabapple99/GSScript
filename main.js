//ammo


//three
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0xdddddd, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
scene.add(camera);
camera.position.set(0, 0, 20);

const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const basicMaterial = new THREE.MeshStandardMaterial({ color: 0x0095dd });
const cube = new THREE.Mesh(boxGeometry, basicMaterial);
cube.receiveShadow = true;
cube.castShadow = true;
scene.add(cube);

const plane = new THREE.BoxGeometry(1000, 1, 1000);
const planemat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const planee = new THREE.Mesh(plane, planemat);
planee.receiveShadow = true;
scene.add(planee);
planee.position.set(0, -20, 0);


const light = new THREE.PointLight(0xffffff, 1000);
light.position.set(0, 15, 0);
light.castShadow = true;
scene.add(light);

const amb = new THREE.AmbientLight(0x404040, 5);
scene.add(amb);

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
  if (keystatus[0] == 1) {
    if (noclip == 1) {
    camera.position.addScaledVector(camdir, 1);
    } else {
      camera.translateZ(-1)
    }
  };
  if (keystatus[2] == 1) {
  camera.translateX(-1);
  };
  if (keystatus[4] == 1) {
    if (noclip == 1) {
      } else {
        camera.translateZ(1)
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

let t = 0;
function render() {
  mover();
  t += 0.01;
  cube.rotation.x += 0.02;
  cube.rotation.y += 0.02;
  cube.rotation.z += 0.02;

  requestAnimationFrame(render);

  // Get and print the rigid-body's position.
  renderer.render(scene, camera);
}
render();
