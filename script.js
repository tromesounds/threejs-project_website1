import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Scene
const scene = new THREE.Scene();

// Add Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Sizes
const sizes = { width: window.innerWidth, height: window.innerHeight };

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0, 5);
scene.add(camera);

// Renderer
const canvas = document.querySelector('canvas.webgl');
if (!canvas) console.error('WebGL canvas not found!');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.setClearColor(0x87ceeb);

// Load HDR Background
const hdrLoader = new RGBELoader();
const hdrPath = '/kloofendal_48d_partly_cloudy_puresky_1k.hdr';
console.log('Attempting to load HDR:', hdrPath);
hdrLoader.load(hdrPath, (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
    console.log('HDR loaded successfully:', texture.image.src);
}, undefined, (error) => {
    console.error('HDR loading error:', error);
    scene.background = new THREE.Color(0x87ceeb);
});

// Spinning Background
let rotation = 0;
function spinBackground() {
    rotation += 0.001;
    scene.backgroundRotation.y = rotation;
}

// Function to create or update text geometry with responsive size
let textMesh, font;
function createTextGeometry() {
    const isMobile = window.innerWidth < 768;
    const textSize = isMobile ? 0.3 : 0.5;
    const textGeometry = new TextGeometry('hypsosis', {
        font: font,
        size: textSize,
        depth: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.03,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x000000
    });
    if (textMesh) {
        scene.remove(textMesh);
        textMesh.geometry.dispose();
    }
    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textGeometry.center();
    textMesh.position.set(0, 0, 0);
    scene.add(textMesh);
}

// Load Font for 3D Text
const fontLoader = new FontLoader();
const fontPath = '/fonts/Smooth_Circulars_Regular.json';
console.log('Attempting to load font:', fontPath);
fontLoader.load(fontPath, (loadedFont) => {
    font = loadedFont;
    createTextGeometry();
    console.log('Text loaded successfully');
}, undefined, (error) => {
    console.error('Font loading error:', error);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
});

// Mouse Tracking
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

// Click/Touch Handling with Raycaster (iOS compatible)
const raycaster = new THREE.Raycaster();

function handleInteraction(event) {
    event.preventDefault(); // Important for iOS
    
    // Handle both mouse and touch events
    const clientX = event.clientX || (event.changedTouches && event.changedTouches[0].clientX);
    const clientY = event.clientY || (event.changedTouches && event.changedTouches[0].clientY);
    
    mouse.x = (clientX / sizes.width) * 2 - 1;
    mouse.y = -(clientY / sizes.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    if (textMesh) {
        const intersects = raycaster.intersectObject(textMesh);
        if (intersects.length > 0) {
            console.log('Text clicked! Navigating to URL...');
            textMesh.material.color.set(0xADD8E6);
            setTimeout(() => {
                textMesh.material.color.set(0xffffff);
                window.location.href = 'https://soundcloud.com/omega33dj/hyper-reality';
            }, 200);
        }
    }
}

// Add multiple event listeners for cross-platform compatibility
window.addEventListener('click', handleInteraction);
window.addEventListener('touchend', handleInteraction);
window.addEventListener('touchstart', handleInteraction);

// Resize Handler
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    if (font) createTextGeometry();
});

// Animation Loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    spinBackground();
    if (textMesh) {
        const mouseWorld = new THREE.Vector3(mouse.x * 5, mouse.y * 5, 10);
        textMesh.lookAt(mouseWorld);
        time += 0.01;
        textMesh.position.x = Math.sin(time) * 0.5;
        textMesh.position.y = Math.cos(time) * 0.5;
        textMesh.position.z = Math.cos(time) * 0.5;
    }
    renderer.render(scene, camera);
}
animate();
