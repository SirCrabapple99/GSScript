const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0xdddddd, 1);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 0.1, 10000);
camera.position.z = 50;
scene.add(camera);

const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const basicMaterial = new THREE.MeshBasicMaterial({ color: 0x0095dd });
const cube = new THREE.Mesh(boxGeometry, basicMaterial);
cube.position.x = -25;
cube.rotation.set(0.4, 0.2, 0);
scene.add(cube);

const torusGeometry = new THREE.TorusGeometry(7, 1, 16, 32);
const phongMaterial = new THREE.MeshPhongMaterial({ color: 0xff9500 });
const torus = new THREE.Mesh(torusGeometry, phongMaterial);
torus.rotation.set(0.5, 0.5, 0);
scene.add(torus);

const strangeGeometry = new THREE.DodecahedronGeometry(7);
const lambertMaterial = new THREE.MeshLambertMaterial({ color: 0xeaeff2 });
const dodecahedron = new THREE.Mesh(strangeGeometry, lambertMaterial);
dodecahedron.position.x = 25;
scene.add(dodecahedron);

const light = new THREE.PointLight(0xffffff);
light.position.set(-10, 15, 50);
scene.add(light);

let t = 0;
function render() {
  t += 0.01;
  requestAnimationFrame(render);
  cube.rotation.y += 0.01;
  torus.scale.y = Math.abs(Math.sin(t));
  dodecahedron.position.y = -7 * Math.sin(t * 2);
  renderer.render(scene, camera);
}
render();
