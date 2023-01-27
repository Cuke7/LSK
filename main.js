import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

import { Rhino3dmLoader } from 'three/addons/loaders/3DMLoader.js';


let container, stats;
let camera, scene, renderer;
let controls, water, sun, mesh;

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

  //

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(30, 30, 100);

  //

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

  //

  const geometry = new THREE.BoxGeometry(30, 30, 30);
  const material = new THREE.MeshStandardMaterial({ roughness: 0 });

  mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);

  //

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495 * 4;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 2000.0;
  controls.update();

  //

  stats = new Stats();
  container.appendChild(stats.dom);

  // GUI

  // const gui = new GUI();

  const location1 = {
    myFunction: function () {
      var lookAtTween = new TWEEN.Tween(controls.object.position).to({ x: 36, y: 21, z: -75 },
        2000).easing(TWEEN.Easing.Cubic.Out)
        .start()

    },
  };

  const reset = {
    myFunction: function () {
      var lookAtTween = new TWEEN.Tween(controls.object.position).to({ x: 30, y: 30, z: 100 }).easing(TWEEN.Easing.Cubic.Out)
        .start()

    },
  };

  // const folderButtons = gui.addFolder('Camera transitions')
  // folderButtons.open();
  // folderButtons.add(location1, 'myFunction'); // Button
  // folderButtons.add(reset, 'myFunction'); // Button
  // folderButtons.open();


  // const folderSky = gui.addFolder('Sky');
  // folderSky.add(parameters, 'elevation', 0, 90, 0.1).onChange(updateSun);
  // folderSky.add(parameters, 'azimuth', - 180, 180, 0.1).onChange(updateSun);
  // folderSky.open();

  // const waterUniforms = water.material.uniforms;

  // const folderWater = gui.addFolder('Water');
  // folderWater.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
  // folderWater.add(waterUniforms.size, 'value', 0.1, 10, 0.1).name('size');
  // folderWater.open();

  //

  window.addEventListener('resize', onWindowResize);

  // RHINO
  const loader = new Rhino3dmLoader();
  loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@7.11.1/');

  loader.load(
    // resource URL
    'ressources/model2.3dm',
    // called when the resource is loaded
    function (object) {
      console.log("LOADED")
      object.rotation.x = Math.PI / 2 * 3
      object.scale.x = 0.005
      object.scale.y = 0.005
      object.scale.z = 0.005
      window.boat = object
      object.position.z = 35;
      object.position.x = -40;
      scene.add(object)
    },
    // called as loading progresses
    function (xhr) {

      console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    },
    // called when loading has errors
    function (error) {

      console.log('An error happened');

    }
  );
  document.getElementById("arriere").addEventListener("click", () => {
    var lookAtTween = new TWEEN.Tween(controls.object.position).to({ x: -75, y: 5, z: 35 },
      2000).easing(TWEEN.Easing.Cubic.Out)
      .start()
    var lookAtTween2 = new TWEEN.Tween(controls.target).to({ x: -35, y: 12, z: 30 },
      2000).easing(TWEEN.Easing.Cubic.Out)
      .start()
  });
  document.getElementById("babord").addEventListener("click", () => {
    var lookAtTween = new TWEEN.Tween(controls.object.position).to({ x: 61, y: 28, z: -77 },
      2000).easing(TWEEN.Easing.Cubic.Out)
      .start()
    var lookAtTween2 = new TWEEN.Tween(controls.target).to({ x: 0, y: 10, z: 0 },
      2000).easing(TWEEN.Easing.Cubic.Out)
      .start()

  });
  document.getElementById("avant").addEventListener("click", () => {
    var lookAtTween = new TWEEN.Tween(controls.object.position).to({ x: 111, y: 13, z: 2 },
      2000).easing(TWEEN.Easing.Cubic.Out)
      .start()
    var lookAtTween2 = new TWEEN.Tween(controls.target).to({ x: 0, y: 10, z: 0 },
      2000).easing(TWEEN.Easing.Cubic.Out)
      .start()
  });
  document.getElementById("retour").addEventListener("click", () => {
    var lookAtTween = new TWEEN.Tween(controls.object.position).to({ x: 11, y: 110, z: 233 }, 2000).easing(TWEEN.Easing.Cubic.Out)
      .start()
    var lookAtTween2 = new TWEEN.Tween(controls.target).to({ x: 0, y: 10, z: 0 },
      2000).easing(TWEEN.Easing.Cubic.Out)
      .start()
  });

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

  const time = performance.now() * 0.001;

  // mesh.position.y = Math.sin(time) * 20 + 5;
  // mesh.rotation.x = time * 0.5;
  // mesh.rotation.z = time * 0.51;

  water.material.uniforms['time'].value += 1.0 / 60.0;

  renderer.render(scene, camera);

}