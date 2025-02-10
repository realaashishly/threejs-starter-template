import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./style.css";
import * as THREE from "three";

// ===================================
// Scene, Camera, and Renderer Setup
// ===================================
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75, // Field of View
  window.innerWidth / window.innerHeight, // Aspect Ratio
  0.1, // Near Clipping Plane
  1000 // Far Clipping Plane
);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ========================
// Orbit Controls Setup
// ========================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
controls.update();

// ========================
// Lighting Setup
// ========================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-1, 2, 4);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

// ========================
// Texture Loader & Materials
// ========================
const textureLoader = new THREE.TextureLoader();
const topTexture = textureLoader.load('/cointop.png');
const bottomTexture = textureLoader.load('/coinbottom.png');

const createCoinMaterials = () => {
  const sideMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFD700, // Gold color for the side
    metalness: 0.8,
    roughness: 0.3,
    side: THREE.DoubleSide,
  });

  const topMaterial = new THREE.MeshStandardMaterial({
    map: topTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const bottomMaterial = new THREE.MeshStandardMaterial({
    map: bottomTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });

  // Adjust the bottom texture orientation so it appears correctly
  bottomMaterial.map.center.set(0.5, 0.5);
  bottomMaterial.map.rotation = Math.PI;

  return [sideMaterial, topMaterial, bottomMaterial];
};

// ========================
// Coins Setup
// ========================
const baseRadius = 3.2;
const coinCount = 10;
const angleStep = (2 * Math.PI) / coinCount;

const coinGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 64);
const coinMaterials = createCoinMaterials();
const coins = [];

const createCoin = (angle) => {
  const coin = new THREE.Mesh(coinGeometry, coinMaterials);
  coin.position.set(
    baseRadius * Math.cos(angle),
    0,
    baseRadius * Math.sin(angle)
  );
  coin.rotation.x = Math.PI / 2;
  coin.rotation.y = angle;
  return coin;
};

for (let i = 0; i < coinCount; i++) {
  const angle = i * angleStep;
  const coin = createCoin(angle);
  scene.add(coin);
  coins.push({ mesh: coin, angle });
}

// ========================
// Animation Loop
// ========================
let time = 0;

const animate = () => {
  requestAnimationFrame(animate);
  time += 0.02;

  const dynamicRadius = baseRadius - 0.5 * Math.sin(time);

  coins.forEach((coinObj) => {
    coinObj.angle += 0.01;
    const x = dynamicRadius * Math.cos(coinObj.angle);
    const z = dynamicRadius * Math.sin(coinObj.angle);
    coinObj.mesh.position.set(x, 0, z);

    coinObj.mesh.rotation.y += 0.02;
    coinObj.mesh.rotation.z += 0.02;
    // coinObj.mesh.rotation.x += 0.02;
  });

  controls.update();
  renderer.render(scene, camera);
};

animate();

// ========================
// Responsive Resize Handling
// ========================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
