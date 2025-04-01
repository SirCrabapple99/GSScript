const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0xdddddd, 1);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
scene.add(camera);
camera.position.set(0, 0, 20);

const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const basicMaterial = new THREE.MeshBasicMaterial({ color: 0x0095dd });
const cube = new THREE.Mesh(boxGeometry, basicMaterial);
scene.add(cube);

const plane = new THREE.BoxGeometry(1000, 1, 1000);
const planemat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const planee = new THREE.Mesh(plane, planemat);
scene.add(planee);
planee.position.set(0, -20, 0);


const light = new THREE.PointLight(0xffffff);
light.position.set(0, 15, 0);
scene.add(light);

var keystatus = [0, "KeyW", 0, "KeyA", 0, "KeyS", 0, "KeyD", 0, "Space", 0, "KeyY", 0,];

function keyinput(e) {
  keystatus[keystatus.indexOf(e.code) - 1] = 1;
};

function keyupinput(e) {
  keystatus[keystatus.indexOf(e.code) - 1] = 0;
};

var camdir = new THREE.Vector3;

function cameramove(e) {
   camera.rotateX(-1 * e.movementY / 1000);
   camera.rotateY(-1 * e.movementX / 1000);
}

function mover() {
  if (keystatus[0] == 1) {
    camera.getWorldDirection(camdir);
    camera.position.addScaledVector(camdir, 1);
  };
  if (keystatus[2] == 1) {
    camera.position.x -= 1;
  };
  if (keystatus[4] == 1) {
    camera.getWorldDirection(camdir);
    camera.position.addScaledVector(camdir, -1);
  };
  if (keystatus[6] == 1) {
  camera.position.x += 1;
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
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
render();
