"use strict"
var ss = 295//255 + Math.random() * 100;
// console.log(ss);

const param = {
    seed: ss,
    segments: 20, //20
    levels: 0.01, //5
    vMultiplier: 2.36,
    twigScale: 0.01,
    initalBranchLength: 0.01,
    lengthFalloffFactor: 0.85,
    lengthFalloffPower: 0.99,
    clumpMax: 0.454,
    clumpMin: 0.404,
    branchFactor: 2.45,
    dropAmount: -0.1,
    growAmount: 0.235,
    sweepAmount: 0.01,
    maxRadius: 0.01,
    climbRate: 0.371,
    trunkKink: 0.093,
    treeSteps: 4,
    taperRate: 0.947,
    radiusFalloffRate: 0.73,
    twistRate: 3.02,
    trunkLength: 0.01,
};

var treeData;
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status == 200) {
        treeData = JSON.parse(xhr.responseText);
        // console.dir(treeData[0]);
    }
};
xhr.open("GET", "DBLoader.php?", true);
xhr.send();


document.getElementById('slider').oninput = function () {
    var t = this.value;
    // changeTree(t);
}

function changeTree(t, database, paths) {
    

    param.trunkLength = t < 40 ? 0.01 + t / 20 : 2.01 + (t - 40) / 300;
    // if (t <= 30)
    //     trunkMesh.scale.set(1, t / 30, 1);
    // else
    //     trunkMesh.scale.set(1, 1, 1);

    param.initalBranchLength = 0.01 + t / 100;
    // param.treeSteps = t < 75 ? 0.1 + t / 15 : 5.1;
    param.levels = 8 * t / 200;
    param.maxRadius = t < 40 ? t / 2000 + 0.01 : 0.03 + (t - 40) / 800;
    param.twigScale = t > 40 ? (t - 40) / 100 : 0.01;
    param.branchFactor = t > 60 ? t * 4 / 100 : 2.4;
    if (t > 30) scene.add(twigsMesh);
    param.radiusFalloffRate = t > 70 ? 0.73 + (t - 70) / 1000 : 0.73;
    tree = new Tree(param, database, paths);
    // var trunkGeo = newTreeGeometry(tree);
    // trunkMesh.geometry = trunkGeo;
    // var twigsGeo = newTreeGeometry(tree, true);
    // twigsMesh.geometry = twigsGeo;

    var trunkGeo = newTreeGeometry(tree);
    var trunkMaterial = new THREE.MeshLambertMaterial({
        color: originalColor,
        wireframe: false,
        map: new THREE.TextureLoader().load('assets/body.png'),
        vertexColors: THREE.FaceColors,
        flatShading: true
    });
    trunkMesh = new THREE.Mesh(trunkGeo, trunkMaterial);
    trunkMesh.name = "trunk";
    trunkMesh.geometry.colorsNeedUpdate = true;
    scene.add(trunkMesh); // Use your own scene
    trunkMesh.position.y -= 3;
    trunkMesh.scale.set(1, 10e-5, 1);
    if (t <= 30)
        trunkMesh.scale.set(1, t / 30, 1);
    else
        trunkMesh.scale.set(1, 1, 1);
    var twigsGeo = newTreeGeometry(tree, true);

    var twigMaterial = new THREE.MeshStandardMaterial({
        color: 0xF16950,
        roughness: 1.0,
        metalness: 0.0,
        map: new THREE.TextureLoader().load('assets/twig-1.png'),
        alphaTest: 0.9
    });
    twigsMesh = new THREE.Mesh(twigsGeo, twigMaterial);
    twigsMesh.position.y -= 3;
    scene.add(twigsMesh); // Use your own scene

}

document.getElementById('grow').onclick = function () {
    // this.disabled = true;
    // var i = 0;
    // var time = setInterval(() => {
    //     if (i == 112) {
    //         clearInterval(time);
    //         this.disabled = false;
    //     }
    //     document.getElementById('slider').value = i++;
    //     changeTree(i);
    // }, 100)
    // console.log(treeData);
    var pathArr = [];
    treeData.forEach(function(v, i){
        pathArr.push(v.branch_path);
    });
    // console.log("###", pathArr);
    console.log("sdfsdf");
    changeTree(100, treeData, pathArr);
    // traverseAll(tree.root);

}

const canvas = document.getElementById("canvas");

var spotLight;

const screenDimensions = {
    width: canvas.width,
    height: canvas.height
}

const scene = buildScene();
const renderer = buildRender(screenDimensions);
var camera = buildCamera(screenDimensions);
var camera_pivot = new THREE.Object3D();
camera_pivot.add(camera);
camera_pivot.rotation.y = -Math.PI / 4;

const controls = buildControls();
const sceneObjects = createSceneObjects(scene);
var mouse_down = false;
var drag = 0;
bindEventListeners();
render();

var trunkMesh, twigsMesh, tree;
var originalColor = 0xdddddd;



function buildScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#fff");
    return scene;
}

function buildControls() {
    const orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
    // orbitControl.enabled = false;
    return orbitControl;
}

// load gltf
function loadModel(url) {

    const loader = new THREE.GLTFLoader();

    loader.load(url, function (gltf) {

        var model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);
        model.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material.map) n.material.map.anisotropy = 16;
            }
        });

        scene.add(model);
        // return model;
        // mixer = new THREE.AnimationMixer(model);
        // mixer.clipAction(gltf.animations[0]).play();

    }, undefined, function (e) {
        console.error(e);
    });
}

function buildRender({ width, height }) {
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
    renderer.setPixelRatio(DPR);
    renderer.setSize(width, height);
    renderer.setClearColor(0xEEEEEE, 1.0);
    // renderer.shadowMap.enabled = true;
    // renderer.gammaInput = true;
    // renderer.gammaOutput = true;

    return renderer;
}

function buildCamera({ width, height }) {
    const aspectRatio = width / height;
    const fieldOfView = 45;
    const nearPlane = 0.1;
    const farPlane = 1000;
    var camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    // position and point the camera to the center of the scene
    camera.position.set(-8, 0, 0);
    return camera;
}

function resizeCanvas() {
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    onWindowResize();
}

function onWindowResize() {
    const { width, height } = canvas;

    screenDimensions.width = width;
    screenDimensions.height = height;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function bindEventListeners() {
    window.onresize = resizeCanvas;
    resizeCanvas();
    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mousemove", onMouseMove, false);
}

function onMouseDown(event) {
    mouse_down = true;
    drag = 0;
}

function onMouseUp(event) {
    if (drag < 3) {
        var intersects = getIntersections(event);
        if (intersects.length > 0) {


            let len = intersects.length;
            let index = 0;
            let face = null;
            while (index < len) {
                if (intersects[index].object.name == "trunk") {
                    face = intersects[index].face;
                    break;
                }
                index++;
            }
            if (face) {
                let arr = [face.a, face.b, face.c];
                // var maxVert = Math.max(...arr);
                findBranch(arr, tree);
            }

        }

    }
    mouse_down = false;
}

function onMouseMove(event) {
    if (mouse_down)
        drag++;
}

function getIntersections(event) {
    var vector = new THREE.Vector2();

    vector.set(
        ((event.clientX - canvas.offsetLeft) / canvas.clientWidth) * 2 - 1, -((event.clientY - canvas.offsetTop) / canvas.clientHeight) * 2 + 1
    );
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(vector, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
    return intersects;
}

function findBranch(intersectVerts, binTree) {
    var branch = traverse_tree(intersectVerts, binTree.root);

    if (branch) {
        // console.log(branch);
        $.notify({
            title: "Selected Branch Path:",
            message: branch.path
        });
        labelVertices(branch);
    }
}

function labelVertices(branch) {
    cleanHighlights();
    if (branch.ring0) {
        if (branch.parent) {
            highlight(branch);
        }
        else if (branch.root) {
            highlightRoot(branch);
        }
    }
    else if (branch.end) {
        highlight(branch);
    }
}

function highlight(branch) {
    let faces = trunkMesh.geometry.faces;
    if (branch.index == 0) {
        for (var i = 0; i < branch.parent.faces1.length; i++) {
            faces[branch.parent.faces1[i]].color.setHex(0xff0000);
        }
    }
    else {
        for (var i = 0; i < branch.parent.faces2.length; i++) {
            faces[branch.parent.faces2[i]].color.setHex(0xff0000);
        }
    }
    trunkMesh.geometry.colorsNeedUpdate = true;
}

function highlightRoot(branch) {
    let faces = trunkMesh.geometry.faces;
    for (var i = 0; i < branch.parent.faces0.length; i++) {
        faces[branch.faces0[i]].color.setHex(0xff0000);
    }
    trunkMesh.geometry.colorsNeedUpdate = true;
}

function highlightRoot(branch) {
    let faces = trunkMesh.geometry.faces;
    for (var i = 0; i < branch.faces0.length; i++) {
        faces[branch.faces0[i]].color.setHex(0xff0000);
    }
    trunkMesh.geometry.colorsNeedUpdate = true;
}

function cleanHighlights() {

    let faces = trunkMesh.geometry.faces;
    for (var i = 0; i < faces.length; i++) {
        faces[i].color.set(originalColor);
    }
}

function traverse_tree(intersectVerts, root) {
    if (evaluate_current(intersectVerts, root)) {
        return root;
    }
    if (root.child0 && root.child1) {
        if (root.child0.ring0 && root.child1.ring0) {
            if (Math.max(...intersectVerts) >= Math.min(...root.child1.ring0))
                return traverse_tree(intersectVerts, root.child1);
            else
                return traverse_tree(intersectVerts, root.child0);
        }
        if (intersectVerts.includes(root.child0.end)) {
            return traverse_tree(intersectVerts, root.child0);
        }
        if (intersectVerts.includes(root.child1.end)) {
            return traverse_tree(intersectVerts, root.child1);
        }
    }
}

function traverseAll(root){
    // console.log(root.path, ":", root.length, ":", root.radius);
    if(root.end){
        return;
    }
    else if(root.child0 && root.child1){
        traverseAll(root.child0);
        traverseAll(root.child1);
    }
}

function evaluate_current(intersectVerts, root) {
    if (root.end) {
        if (intersectVerts.includes(root.end))
            return true;
    } else {
        var num = 0;
        for (var i = 0; i < intersectVerts.length; i++) {
            if (root.parent) {
                if (root.index == 0) {
                    if (root.ring0.includes(intersectVerts[i]) || root.parent.ring1.includes(intersectVerts[i]))
                        num++;
                }
                else {
                    if (root.ring0.includes(intersectVerts[i]) || root.parent.ring2.includes(intersectVerts[i]))
                        num++;
                }
            }
            else {
                if (root.ring0.includes(intersectVerts[i]) || root.root.includes(intersectVerts[i]))
                    num++;
            }
        }
        if (num == 3)
            return true;
    }
    return false;
}

render();

// render the scene
function render() {
    camera_pivot.rotation.y += 30e-6;
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(render);
}

function createSceneObjects(scene) {
    // show axes in the screen
    const axes = new THREE.AxesHelper(20);
    // scene.add(axes);
    scene.add(camera_pivot);

    // var sky = new THREE.Mesh(
    //     new THREE.SphereBufferGeometry(500, 60, 40).scale(-1, 1, 1),
    //     new THREE.MeshBasicMaterial({
    //         map: new THREE.TextureLoader().load('assets/sky.jpg')
    //     })
    // );
    // sky.position.set(0, 50, 0);
    // scene.add(sky);
    buildLight();

    // tree = new Tree(param, scene);

    // var trunkGeo = newTreeGeometry(tree);
    // var trunkMaterial = new THREE.MeshLambertMaterial({
    //     color: originalColor,
    //     wireframe: false,
    //     map: new THREE.TextureLoader().load('assets/body.png'),
    //     vertexColors: THREE.FaceColors,
    //     flatShading: true
    // });
    // trunkMesh = new THREE.Mesh(trunkGeo, trunkMaterial);
    // trunkMesh.name = "trunk";
    // trunkMesh.geometry.colorsNeedUpdate = true;
    // scene.add(trunkMesh); // Use your own scene
    // trunkMesh.position.y -= 3;
    // trunkMesh.scale.set(1, 10e-5, 1);

    // var twigsGeo = newTreeGeometry(tree, true);

    // var twigMaterial = new THREE.MeshStandardMaterial({
    //     color: 0xF16950,
    //     roughness: 1.0,
    //     metalness: 0.0,
    //     map: new THREE.TextureLoader().load('assets/twig-1.png'),
    //     alphaTest: 0.9
    // });
    // twigsMesh = new THREE.Mesh(twigsGeo, twigMaterial);
    // twigsMesh.position.y -= 3;
    // scene.add(twigsMesh); // Use your own scene


}

function buildLight() {
    var ambientLight = new THREE.HemisphereLight(0xffffff);
    ambientLight.intensity = 0.6;
    scene.add(ambientLight);

    // add spotlight for the shadows
    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 1;
    spotLight.position.z += 20;
    spotLight.castShadow = true;
    scene.add(spotLight);
    var a = spotLight.clone();
    a.position.z = - spotLight.position.z;
    scene.add(a)
}

// Helper function to transform the vertices and faces
function newTreeGeometry(tree, isTwigs) {
    var output = new THREE.Geometry();

    tree[isTwigs ? 'vertsTwig' : 'verts'].forEach(function (v) {
        output.vertices.push(new THREE.Vector3(v[0], v[1], v[2]));
    });

    var uv = isTwigs ? tree.uvsTwig : tree.UV;
    tree[isTwigs ? 'facesTwig' : 'faces'].forEach(function (f) {
        output.faces.push(new THREE.Face3(f[0], f[1], f[2]));
        output.faceVertexUvs[0].push(f.map(function (v) {
            return new THREE.Vector2(uv[v][0], uv[v][1]);
        }));
    });

    output.computeFaceNormals();
    output.computeVertexNormals(true);

    return output;
}




