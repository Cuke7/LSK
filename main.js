// https://3dviewer.net/

import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let container, stats;
let camera, scene, renderer;
let controls, water, sun;

init();
animate();

function init() {

  container = document.getElementById('container');

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
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
    elevation: 3,
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

  stats = new Stats();
  container.appendChild(stats.dom);

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


    },
  );


  document.getElementById('debug').addEventListener("click", (event) => {
    window.alert(`addView("ID", {x:${Math.floor(controls.object.position.x)}, y:${Math.floor(controls.object.position.y)}, z:${Math.floor(controls.object.position.z)}}, {x:${Math.floor(controls.target.x)}, y:${Math.floor(controls.target.y)}, z:${Math.floor(controls.target.z)}}, "Nom à afficher");`)
  })

  addView("arriere", { x: -75, y: 5, z: 35 }, { x: -35, y: 12, z: 30 }, "Arrière");
  addView("babord", { x: 61, y: 28, z: -77 }, { x: 0, y: 10, z: 0 }, "Babord");
  addView("avant", { x: 111, y: 13, z: 2 }, { x: 0, y: 10, z: 0 }, "Avant");
  addView("retour", { x: 11, y: 110, z: 233 }, { x: 0, y: 10, z: 0 }, "Retour");


  function addView(id, position, target, nom) {
    const list = document.getElementById("list");
    const li = document.createElement("li");
    li.classList.add("hidden-child");
    li.id = id;
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

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

  requestAnimationFrame(animate);
  TWEEN.update()
  controls.update()
  render();
  stats.update();
  window.camera = camera
  window.controls = controls


}

function render() {

  water.material.uniforms['time'].value += 1.0 / 60.0;

  renderer.render(scene, camera);

}