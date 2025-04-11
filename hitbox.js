//base things
//cannon
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

//three
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
/*renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;*/
document.getElementById("renderdiv").appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
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

function intorad(x) {
    return (x * (Math.PI / 180));
};

//event listeners
document.addEventListener("keydown", keyinput);
document.addEventListener("keyup", keyupinput);
document.addEventListener("pointermove", mousemovement);
document.addEventListener("mousedown", three_raycast);

//input
var keystatus = [0, "w", 0, "a", 0, "s", 0, "d", 0, " ", 0, "y", 0, "e", 0, "v", 0, "Shift"];

function keyinput(e) {
    keystatus[keystatus.indexOf(e.key) - 1] = 1;
};

function keyupinput(e) {
    keystatus[keystatus.indexOf(e.key) - 1] = 0;
};

let camdir = new THREE.Vector3(0, 0, 0)

function mover() {
    camera.getWorldDirection(camdir);
    if (keystatus[0] == 1) {
        camera.rotation.x += camdir.x;
        camera.position.z += camdir.z;
    }
    if (keystatus[2] == 1) {
        camera.position.x += camdir.z;
        camera.position.z += camdir.x * -1;
    };
    if (keystatus[4] == 1) {
        camera.position.x -= camdir.x;
        camera.position.z -= camdir.z;
    }
    if (keystatus[6] == 1) {
        camera.position.x += camdir.z * -1;
        camera.position.z += camdir.x;
    };
    if (keystatus[8] == 1) {
        camera.position.y += 1;
    };
    if (keystatus[10] == 1) {
        camera.position.y -= 1;
    };
};
//scene things
//materials
const modelmat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
});
const boxmat = new THREE.MeshPhysicalMaterial({
    color: 0x808080,
    transparent: true,
    opacity: 0.5
});
const whitemat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff
});

//scene objects
//plane
const planea1 = new CANNON.Box(v3(500, 2, 500));
const planea = new CANNON.Body({
    mass: 0,
    collisionFilterGroup: 2,
    collisionFilterMask: -1
});
planea.addShape(planea1);
planea.position.set(0, -10, 0);
world.addBody(planea);
const planeb1 = new THREE.BoxGeometry(1000, 4, 1000);
const planeb = new THREE.Mesh(planeb1, whitemat);
scene.add(planeb);

//arrow hider
const gone1 = new THREE.BoxGeometry(5, 5, 5);
const gone = new THREE.Mesh(gone1, whitemat);
scene.add(gone);
gone.position.set(0, 500, 0);

//cube test
const cubeb1 = new THREE.BoxGeometry(10, 10, 10);
const cubeb = new THREE.Mesh(cubeb1, boxmat);
scene.add(cubeb);
cubeb.position.set(10, 0, 12)

//lights
const sun = new THREE.HemisphereLight(0x404040);
sun.intensity = 5;
scene.add(sun);

//scene interactions
//model loader
const loader = new THREE.OBJLoader();

function returnobj(x) {
    return ('data:@file/octet-stream;base64,' + btoa(x));
};

let objlist = [];
let arrows = [];
let modelloaded = [];
let item;

function addObject(object, amount, positions) {
    for (let i = 0; i < amount; i++) {
        if (object != 0) {
            loader.load(returnobj(object), function(item1) {
                item = item1.children[0]
                scene.add(item);
                item.name = 'obj' + objlist.length;
                item.scale.set(5, 5, 5);
                item.position.set(positions[i][0], positions[i][1], positions[i][2]);
                objlist[objlist.length] = item;
                item.material = modelmat;
            });
        }
    }
}
addObject(monkey_obj, 1, [
    [0, 0, 0]
]);

//object moving
//directional arrows
let dir = [];
let origin;
let hex;
let length;
for (var i = 0; i < 3; i++) {
    if (i == 0) {
        dir[i] = new THREE.Vector3(1, 0, 0);
        hex = 0xff0000;
    } else if (i == 1) {
        dir[i] = new THREE.Vector3(0, 1, 0);
        hex = 0x0000ff;
    } else {
        dir[i] = new THREE.Vector3(0, 0, 1);
        hex = 0x00ff00;
    };
    dir[i].normalize();
    origin = new THREE.Vector3(0, 0, 0);
    length = 10;
    let arrowHelper = new THREE.ArrowHelper(dir[i], origin, length, hex);
    scene.add(arrowHelper);
    arrows[i] = arrowHelper;
};

function arrowset(object) {
    for (var i = 0; i < 3; i++) {
        arrows[i].position.copy(object.position)
    }
    arrows[1].quaternion.set(object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w);
    arrows[0].quaternion.multiplyQuaternions(arrows[1].quaternion, new THREE.Quaternion(1, 0, 0, 1).normalize());
    arrows[2].quaternion.multiplyQuaternions(arrows[1].quaternion, new THREE.Quaternion(0, 0, 1, 1).normalize());
};
//object picking
let selected;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function mousemovement(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
};
let hit;
let hit2;
let intersects;

function three_raycast() {
    if (hit2) {
        hit2.object.material.wireframe = false;
    }
    raycaster.setFromCamera(pointer, camera);
    intersects = raycaster.intersectObjects(scene.children);
    if (intersects[0]) {
        hit = intersects[0];
    } else {
        hit.object.material.wireframe = false;
        hit = scene.children[gone];
    }
    if (hit.object != arrows[0] && hit.object != arrows[1] && hit.object != arrows[2] && hit == intersects[0]) {
        hit2 = hit;
    }
    // hitbase = hit.object.material.color;
    for (let i = 0; i < intersects.length; i++) {
        hit.object.material.wireframe = true;
    };
};
//object moving


//render loop
function poscopy(a, b) {
    a.position.copy(b.position);
    a.quaternion.copy(b.quaternion);
};

function positionsetter() {
    poscopy(planeb, planea);
    if (hit2 && hit != scene.children[gone]) {
        arrowset(hit2.object);
    } else {
        arrowset(gone)
    }
};

function render() {
    delta = Math.min(clock.getDelta(), 0.1);
    world.step(delta);
    positionsetter();
    mover();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};
render();
