//hitbox creator js
//base things
//cannon
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

//three
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true });
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0x000000, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById("renderdiv").appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
scene.add(camera);
camera.position.set(0, 0, 20);
camera.rotation.order = "YXZ";

const clock = new THREE.Clock();
let delta;

function reeesize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  };
  
window.addEventListener('resize', reeesize, false);
//important functions
function v3(x, y, z) {
    return (new CANNON.Vec3(x, y, z));
};

//event listeners

//materials
const orangemat = new THREE.MeshPhysicalMaterial({color: 0xff4f00});
const purplemat = new THREE.MeshPhysicalMaterial({color: 0xa020f0});
const redmat = new THREE.MeshPhysicalMaterial({color: 0xaff0000});
const orangematshiny = new THREE.MeshPhysicalMaterial({color: 0xff4f00, roughness: 0.25, metalness: 0.75});
const purplematshiny = new THREE.MeshPhysicalMaterial({color: 0xa020f0, roughness: 0.25, metalness: 0.75});
const redmatshiny = new THREE.MeshPhysicalMaterial({color: 0xff0000, roughness: 0.25, metalness: 0.75});

//scene objects
const planeb1 = new THREE.BoxGeometry(5, 5, 5);
const planeb = new THREE.Mesh(planeb1, purplemat);
scene.add(planeb)

//lights
const amb = new THREE.AmbientLight(0x404040, 5);
scene.add(amb);
//render loop
let t = 0
function render() {
delta = Math.min(clock.getDelta(), 0.1);
t += delta
renderer.render(scene, camera)
};
render();