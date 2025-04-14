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

function q4(x, y, z, w) {
    return (new CANNON.Quaternion(x, y, z, w));
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
var keystatus = [0, "w", 0, "a", 0, "s", 0, "d", 0, " ", 0, "y", 0, "e", 0, "v", 0, "Shift", 0, "ArrowUp", 0, "ArrowDown", 0, "ArrowLeft", 0, "ArrowRight", 0, "i", 0, "k", 0, "j", 0, "l", 0, "u", 0, "o", 0, "t", 0, "g", 0, "f", 0, "h"];

let localr = -1

function keyinput(e) {
    keystatus[keystatus.indexOf(e.key) - 1] = 1;
    if (keystatus[12] == 1) {
        localr *= -1;
    };
};

function keyupinput(e) {
    keystatus[keystatus.indexOf(e.key) - 1] = 0;
};

let camdir = new THREE.Vector3(0, 0, 0)

let translateZ

function mover() {
    camera.getWorldDirection(camdir);
    camdir.x /= 3;
    camdir.y /= 3;
    camdir.z /= 3;
    if (keystatus[0] == 1) {
        camera.position.x += camdir.x;
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
        camera.position.y += 0.15;
    };
    if (keystatus[10] == 1) {
        camera.position.y -= 0.15;
    };
    if (keystatus[18] == 1 && hit2) {
        if (localr == 1) {
            hit2.object.translateZ(0.05);
        } else {
            hit2.object.position.z -= 0.05;
        }
    };
    if (keystatus[20] == 1 && hit2) {
        if (localr == 1) {
            hit2.object.translateZ(-0.05);
        } else {
            hit2.object.position.z += 0.05;
        }
    };
    if (keystatus[22] == 1 && hit2) {
        if (localr == 1) {
            hit2.object.translateX(-0.05);
        } else {
            hit2.object.position.x -= 0.05;
        }
    };
    if (keystatus[24] == 1 && hit2) {
        if (localr == 1) {
            hit2.object.translateX(0.05);
        } else {
            hit2.object.position.x += 0.05;
        }
    };
    if (keystatus[26] == 1 && hit2) {
        if (localr == 1) {
            hit2.object.rotateX(0.05);
        } else {
            hit2.object.rotation.x -= 0.05;
        }
    };
    if (keystatus[28] == 1 && hit2) {
        if (localr == 1) {
            hit2.object.rotateX(-0.05);
        } else {
            hit2.object.rotation.x += 0.05;
        }
    };
    if (keystatus[30] == 1 && hit2) {
        if (localr == 1) {
            hit2.object.rotateZ(-0.05);
        } else {
            hit2.object.rotation.z += 0.05;
        }
    };
    if (keystatus[32] == 1 && hit2) {
        if (localr == 1) {
            hit2.object.rotateZ(0.05);
        } else {
            hit2.object.rotation.z -= 0.05;
        }
    };
    if (keystatus[34] == 1 && hit2) {
        if (localr == 1) {
            hit2.object.translateY(-0.05);
        } else {
            hit2.object.position.y -= 0.05;
        }
    };
    if (keystatus[36] == 1 && hit2) {
        if (localr == 1) {
            hit2.object.translateY(0.05);
        } else {
            hit2.object.position.y += 0.05;
        }
    };
    if (keystatus[38] == 1) {
        camera.rotateX(0.01);
    };
    if (keystatus[40] == 1) {
        camera.rotateX(-0.01);
    };
    if (keystatus[42] == 1) {
        camera.rotation.y += 0.01;
    };
    if (keystatus[44] == 1) {
        camera.rotation.y -= 0.01;
    };
    if (keystatus[14] == 1 && hit2) {
        hit2.object.position.x = 0;
        hit2.object.position.y = 0;
        hit2.object.position.z = 0;
        hit2.object.rotation.x = 0;
        hit2.object.rotation.y = 0;
        hit2.object.rotation.z = 0;
    };
};
//scene things
//materials
const modelmat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
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

//lights
const sun = new THREE.HemisphereLight(0x404040);
sun.intensity = 5;
scene.add(sun);

//scene interactions
//3d model loader
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

//object selecting
//directional arrows
let dir = [];
let origin;
let hex;
let length;
/* for (var i = 0; i < 3; i++) {
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
}; */

/*function arrowset(object) {
    for (var i = 0; i < 3; i++) {
        arrows[i].position.copy(object.position)
    }
    arrows[1].quaternion.set(object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w);
    arrows[0].quaternion.multiplyQuaternions(arrows[1].quaternion, new THREE.Quaternion(1, 0, 0, 1).normalize());
    arrows[2].quaternion.multiplyQuaternions(arrows[1].quaternion, new THREE.Quaternion(0, 0, 1, 1).normalize());
};*/

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
    raycaster.setFromCamera(pointer, camera);
    intersects = raycaster.intersectObjects(scene.children);
    if (hit2) {
        hit2.object.material.wireframe = false;
    }
    if (intersects[0]) {
        hit = intersects[0];
    } else {
        hit.object.material.wireframe = false;
        hit = scene.children[gone];
    }
    hit2 = hit;
    // hitbase = hit.object.material.color;
    for (let i = 0; i < intersects.length; i++) {
        hit.object.material.wireframe = true;
    };
};

//the important part
//buttons
function addbox() {
    let boxtype = window.prompt("type of hitbox (box/sphere)");
    if ((new RegExp(/box/i)).test(boxtype)) {
        let boxprompt = JSON.parse('[' + window.prompt("box size: x, y, z") + ']');
        let posprompt1 = JSON.parse('[' + window.prompt("position: x, y, z") + ']');
        let pos1 = new THREE.Vector3(posprompt1[0], posprompt1[1], posprompt1[2]);
        newhitbox(new THREE.BoxGeometry(boxprompt[0], boxprompt[1], boxprompt[2]), pos1, [boxprompt[0], boxprompt[1], boxprompt[2]]);
    } else if ((new RegExp(/sphere/i)).test(boxtype)) {
        let sphereprompt = JSON.parse(window.prompt("sphere radius: r"));
        let posprompt2 = JSON.parse('[' + window.prompt("position: x, y, z") + ']');
        let pos2 = new THREE.Vector3(posprompt2[0], posprompt2[1], posprompt2[2]);
        newhitbox(new THREE.SphereGeometry(sphereprompt, 32, 16), pos2, sphereprompt);
    } else {
        alert("not a valid hitbox type");
        return;
    }
}

//hitbox creator
let hitboxnum = [];
let hitboxmesh;
let functionfunction;
let exportvalues = [];

function newhitbox(shape1, position, size) {
    let boxmat = new THREE.MeshPhysicalMaterial({
        color: 0x808080,
        transparent: true,
        opacity: 0.5
    });
    let hitboxmesh = new THREE.Mesh(shape1, boxmat);
    scene.add(hitboxmesh);
    hitboxnum[hitboxnum.length] = hitboxmesh;
    hitboxmesh.position.copy(position);
    exportvalues[exportvalues.length] = hitboxmesh;
    exportvalues[exportvalues.length] = size;
}

//final output creation
let cannondata = [];
let exportdata1 = [];
const tempbox = 'box' + Math.round(Math.random() * 10000000);
exportdata[0] = ['let ' + tempbox + ' = new CANNON.Body({mass: 5, collisionFilterGroup: 1, collisionFilterMask: -1}); '];
function newcannon(box, position, size) {
    if (box.geometry.constructor == THREE.BoxGeometry) {
        const tempbox2 = 'shape' + Math.round(Math.random() * 10000000);
        cannondata[cannondata.length] = ['const ' + tempbox2 + ' = new CANNON.Box(v3(' + size[0] / 2, size[1] / 2, size[2] / 2 + ')); ' + tempbox + '.addShape(' + tempbox2 + ', v3('+box.position.x, box.position.y, box.position.z+'), q4('+box.quaternion.x, box.quaternion.y, box.quaternion.z, box.quaternion.w+')); '];
    } else if (box.geometry.constructor == THREE.SphereGeometry) {
        const tempbox2 = 'shape' + Math.round(Math.random() * 10000000);
        cannondata[cannondata.length] = ['const ' + tempbox2 + ' = new CANNON.Sphere(' + size / 2 + '); ' + tempbox + '.addShape(' + tempbox2 + ', v3('+box.position.x, box.position.y, box.position.z+'), q4('+box.quaternion.x, box.quaternion.y, box.quaternion.z, box.quaternion.w+')); '];
    }
}

function exportdata() {
    exportdata1[0] = ['let ' + tempbox + ' = new CANNON.Body({mass: 5, collisionFilterGroup: 1, collisionFilterMask: -1}); ']
    for (var i = 0; i < hitboxnum.length; i++) {
        newcannon(exportvalues[i * 2], 0, exportvalues[i * 2 + 1]);
        exportdata1[0] = [exportdata1[0] + cannondata[cannondata.length - 1]];
    }
    exportdata1[0] = [exportdata1[0] + 'world.addBody('+tempbox+');'];
    navigator.clipboard.writeText(exportdata1[0]);
}

//render loop
function poscopy(a, b) {
    a.position.copy(b.position);
    a.quaternion.copy(b.quaternion);
};

function positionsetter() {
    poscopy(planeb, planea);
    if (hitboxmesh && box12) {
        poscopy(hitboxmesh, box12);
    }
    /* if (hit2 && hit != scene.children[gone]) {
         arrowset(hit2.object);
     } else {
         arrowset(gone)
     }*/
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