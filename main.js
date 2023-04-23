import './style.css';
import * as THREE from 'three';
import { DirectionalLight } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
//camera.position.set(18, 3, 0) 


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.shadowMap.enabled = true;

//const controls = new OrbitControls(camera, renderer.domElement)

scene.background = new THREE.Color(0.2, 0.2, 0.2);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionLight.castShadow = true;
directionLight.shadow.mapSize.width = 2048;
directionLight.shadow.mapSize.height = 2048;

const shadowDistance = 20;
directionLight.shadow.camera.near = 0.1;
directionLight.shadow.camera.far = 0.1;
directionLight.shadow.camera.left = -shadowDistance;
directionLight.shadow.camera.right = shadowDistance;
directionLight.shadow.camera.top = shadowDistance;
directionLight.shadow.camera.bottom = -shadowDistance;
directionLight.shadow.bias = -0.001;
scene.add(directionLight);



new GLTFLoader().load('/models/showroom.glb', (gltf) => {
  //console.log(gltf);
  scene.add(gltf.scene);

  gltf.scene.traverse((child) => {
    //console.log('name', child.name)
    child.receiveShadow = true;
    child.castShadow = true;

    if (child.name == 'Pillar') {
      const video = document.createElement('video');
      video.src = '/videos/video1.mp4';
      video.muted = true;
      video.autoplay = 'autoplay';
      video.loop = true;
      video.play();
      const videoTexture = new THREE.VideoTexture(video);
      const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
      child.material = videoMaterial;
    }
    if (child.name == 'Display') {
      const video = document.createElement('video');
      video.src = '/videos/video2.mp4';
      video.muted = true;
      video.autoplay = 'autoplay';
      video.loop = true;
      video.play();
      const videoTexture = new THREE.VideoTexture(video);
      const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
      child.material = videoMaterial;
    }
    if (child.name == 'Screen') {
      const video = document.createElement('video');
      video.src = '/videos/video3.mp4';
      video.muted = true;
      video.autoplay = 'autoplay';
      video.loop = true;
      video.play();
      const videoTexture = new THREE.VideoTexture(video);
      const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
      child.material = videoMaterial;
    }
  })
});

let visitorMesh;
let visitorMixer;
let actionWalk;
let actionIdle;
new GLTFLoader().load('/models/visitor.glb', (gltf) => {
  visitorMesh = gltf.scene;
  scene.add(visitorMesh);

  gltf.scene.traverse(child => {
    child.receiveShadow = true;
    child.castShadow = true;
  })

  // visitor position
  visitorMesh.position.set(13, 0.18, 0);
  // visitor direction
  visitorMesh.rotateY(-Math.PI / 2);
  // camera walk with visitor
  visitorMesh.add(camera);

  camera.position.set(0, 2, -2);
  camera.lookAt(new THREE.Vector3(0, 0, 1));

  // add a point light to visitor
  const pointLight = new THREE.PointLight(0xffffff, 0.5);
  scene.add(pointLight);

  // pointLight walk with visitor
  visitorMesh.add(pointLight);
  // pointLight position
  pointLight.position.set(0, 2, -2);

  visitorMixer = new THREE.AnimationMixer(gltf.scene);

  const clipIdle = THREE.AnimationUtils.subclip(gltf.animations[0], 'idle', 0, 251);
  actionIdle = visitorMixer.clipAction(clipIdle);

  //console.log(gltf.animations)
  actionIdle.play();

  const clipWalk = THREE.AnimationUtils.subclip(gltf.animations[0], 'walk', 252, 282);
  actionWalk = visitorMixer.clipAction(clipWalk);
  //actionWalk.play();

  
  
});

const visitorHalfHeight = new THREE.Vector3(0, 0.5, 0);
let isWalk=false;

window.addEventListener('keydown', (e) => {
  if (e.key === 'w') {
    const curPos = visitorMesh.position.clone();
    visitorMesh.translateZ(1);
    const frontPos = visitorMesh.position.clone();
    visitorMesh.translateZ(-1);

    const frontVector3 = frontPos.sub(curPos).normalize();
    const raycasterFront = new THREE.Raycaster(visitorMesh.position.clone().add(visitorHalfHeight), frontVector3);
    const collisionResultsFrontObjs = raycasterFront.intersectObjects(scene.children);
    //console.log(collisionResultsFrontObjs)

    if (collisionResultsFrontObjs && collisionResultsFrontObjs[0] && collisionResultsFrontObjs[0].distance > 1) {
      visitorMesh.translateZ(0.1)
    }
    if (!isWalk) {
      crossVisitor(actionIdle, actionWalk);
      isWalk = true
    }  
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'w') {
    crossVisitor(actionWalk, actionIdle);
    isWalk = false;
  }
})

let prePos;
window.addEventListener('mousemove', (e) => {
  if (prePos && visitorMesh) {
    visitorMesh.rotateY(-(e.clientX - prePos) * 0.01);
  }
  prePos = e.clientX;
});

// idel change to walk
function crossVisitor(curAction, newAction) {
  curAction.fadeOut(0.3);
  newAction.reset();
  newAction.setEffectiveWeight(1);
  newAction.play();
  newAction.fadeIn(0.3);
};

// const sizes = {
//     width: window.innerWidth,
//     height: window.innerHeight
// }

// window.addEventListener('resize', () =>
//   {
//     // Update sizes
//     sizes.width = window.innerWidth
//     sizes.height = window.innerHeight

//     // Update camera
//     camera.aspect = sizes.width / sizes.height
//     camera.updateProjectionMatrix()

//     // Update renderer
//     renderer.setSize(sizes.width, sizes.height)
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// })

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  //controls.update();

  if (visitorMixer) {
    visitorMixer.update(0.015);
  }
}
animate()
