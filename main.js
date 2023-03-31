// https://3dviewer.net/

import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';


import TWEEN from "tween.js"

let container;
let camera, scene, renderer;
let controls, water, sun;

// var dracoLoader = new DRACOLoader();
// dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');

window.addEventListener('load', function () {
  init();
  animate();
})



function init() {

  container = document.getElementById('container');

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(document.getElementById("container").clientWidth, document.getElementById("container").clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(30, 30, 100);


  sun = new THREE.Vector3();

  // Water
  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('ressources/waternormals.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    }
  );

  water.rotation.x = - Math.PI / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms['turbidity'].value = 10;
  skyUniforms['rayleigh'].value = 2;
  skyUniforms['mieCoefficient'].value = 0.005;
  skyUniforms['mieDirectionalG'].value = 0.8;

  const parameters = {
    elevation: 4,
    azimuth: 180
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  let renderTarget;

  function updateSun() {

    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    if (renderTarget !== undefined) renderTarget.dispose();

    renderTarget = pmremGenerator.fromScene(sky);

    scene.environment = renderTarget.texture;

  }

  updateSun();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495 * 4;
  controls.target.set(0, 10, 0);
  controls.minDistance = 0;
  controls.maxDistance = 2000.0;
  controls.update();


  window.addEventListener('resize', onWindowResize);


  const loader = new GLTFLoader();

  loader.load(
    // resource URL
    'ressources/model.glb',
    // called when the resource is loaded
    function (gltf) {

      let object = gltf.scene

      object.rotation.x = Math.PI / 2 * 3
      object.scale.x = 0.005
      object.scale.y = 0.005
      object.scale.z = 0.005
      object.position.x = -40;

      scene.add(object);

      document.getElementById("chargement").hidden = true;
    },
    function (xhr) {
      // document.getElementById("chargement").innerHTML = `Chargement... (${xhr.loaded}/${xhr.total})`
      document.getElementById("chargement").innerHTML = `Chargement...`
    },
  );


  document.getElementById('debug').addEventListener("click", (event) => {
    window.alert(`addView({x:${Math.floor(controls.object.position.x)}, y:${Math.floor(controls.object.position.y)}, z:${Math.floor(controls.object.position.z)}}, {x:${Math.floor(controls.target.x)}, y:${Math.floor(controls.target.y)}, z:${Math.floor(controls.target.z)}}, "Nom à afficher");`)
  })

  // addView("arriere", { x: -75, y: 5, z: 35 }, { x: -35, y: 12, z: 30 }, "Arrière");
  // addView("babord", { x: 61, y: 28, z: -77 }, { x: 0, y: 10, z: 0 }, "Babord");
  // addView("avant", { x: 111, y: 13, z: 2 }, { x: 0, y: 10, z: 0 }, "Avant");
  // addView("retour", { x: 11, y: 110, z: 233 }, { x: 0, y: 10, z: 0 }, "Retour");

  addView({ x: -28, y: 20, z: 4 }, { x: -2, y: 8, z: -3 }, "Poste de pilotage");
  addView({ x: 0, y: 17, z: 6 }, { x: 9, y: 9, z: 4 }, "Kitebox");
  addView({ x: -1, y: 17, z: -7 }, { x: -7, y: 11, z: 0 }, "Platine de traction");
  addView({ x: 37, y: 54, z: 1 }, { x: 27, y: 0, z: 1 }, "Panneaux solaires");
  addView({ x: -17, y: 40, z: -33 }, { x: -8, y: 28, z: 8 }, "Mat de lancement");
  addView({ x: -25, y: 17, z: -3 }, { x: -8, y: 28, z: 8 }, "Sea kite");
  addView({ x: -255, y: 232, z: -257 }, { x: 0, y: 10, z: 0 }, "Vue aérienne");


  function addView(position, target, nom) {
    const list = document.getElementById("views");
    const li = document.createElement("div");
    li.classList.add(["hover:text-red-600"])
    li.innerHTML = nom;
    list.appendChild(li)
    li.addEventListener("click", () => {
      new TWEEN.Tween(controls.object.position).to(position,
        2000).easing(TWEEN.Easing.Cubic.Out)
        .start()
      new TWEEN.Tween(controls.target).to(target,
        2000).easing(TWEEN.Easing.Cubic.Out)
        .start()
    });
  }

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(document.getElementById("container").clientWidth, document.getElementById("container").clientHeight);
}

function animate() {

  requestAnimationFrame(animate);
  TWEEN.update()
  controls.update()
  render();
  // window.camera = camera
  // window.controls = controls
}

function render() {

  water.material.uniforms['time'].value += 1.0 / 60.0;

  renderer.render(scene, camera);

}