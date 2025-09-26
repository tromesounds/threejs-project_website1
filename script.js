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

// Glass Panes Variables
let glassPanes = [];
let isTransitioning = false;

// Create Glass Panes
function createGlassPanes() {
    const aspect = 16 / 9;
    const paneWidth = 2.5;
    const paneHeight = paneWidth / aspect;
    const paneDepth = 0.1; // Add depth to make them 3D
    const spacing = 0.3;
    const totalHeight = (paneHeight * 4) + (spacing * 3);
    const startY = totalHeight / 2 - paneHeight / 2;

    // Create glass material with iridescent effect
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe6f3ff, // Slight blue tint for glass
        transmission: 0.6, // Less transparent, more opaque
        opacity: 0.4, // More visible
        roughness: 0.05,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02, // More glossy
        transparent: true,
        side: THREE.DoubleSide,
        ior: 1.5, // Index of refraction for glass
        thickness: paneDepth,
        envMapIntensity: 1.5, // Enhanced reflections for glossy effect
        iridescence: 1.0, // Iridescent effect
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400]
    });

    for (let i = 0; i < 4; i++) {
        // Use BoxGeometry for 3D depth instead of PlaneGeometry
        const geometry = new THREE.BoxGeometry(paneWidth, paneHeight, paneDepth);
        const pane = new THREE.Mesh(geometry, glassMaterial);
        
        // Position panes
        pane.position.x = 10; // Start off-screen to the right
        pane.position.y = startY - (i * (paneHeight + spacing));
        pane.position.z = 0;
        
        glassPanes.push(pane);
        scene.add(pane);
    }
}

// Animate Glass Panes In
function animateGlassPanesIn() {
    glassPanes.forEach((pane, index) => {
        // Stagger the animation slightly for each pane
        const delay = index * 100;
        
        setTimeout(() => {
            const startX = pane.position.x;
            const targetX = 0;
            const duration = 1000; // 1 second
            const startTime = Date.now();
            
            function animatePane() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                
                pane.position.x = startX + (targetX - startX) * easeOutCubic;
                
                if (progress < 1) {
                    requestAnimationFrame(animatePane);
                }
            }
            
            animatePane();
        }, delay);
    });
}

// Function to create or update text geometry with responsive size
let textMesh, font;
function createTextGeometry() {
    const isPortrait = window.innerHeight > window.innerWidth;
    const isMobile = window.innerWidth < 768 && isPortrait;
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
    createGlassPanes(); // Create glass panes when font loads
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
    if (isTransitioning) return; // Prevent multiple clicks during transition
    
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
            console.log('Text clicked! Starting transition...');
            isTransitioning = true;
            
            // Change text color briefly
            //textMesh.material.color.set(0xADD8E6);
            
            // Dissolve text instead of moving it
            const duration = 150; // 1.5 seconds for dissolve
            const startTime = Date.now();
            const originalOpacity = textMesh.material.opacity || 1;
            
            // Make material transparent to enable opacity changes
            textMesh.material.transparent = true;
            
            function dissolveText() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Fade out opacity
                textMesh.material.opacity = originalOpacity * (1 - progress);
                
                // Add slight scale down effect
                const scale = 1 - (progress * 0.5);
                textMesh.scale.set(scale, scale, scale);
                
                if (progress < 1) {
                    requestAnimationFrame(dissolveText);
                } else {
                    // Hide text when animation completes
                    textMesh.visible = false;
                }
            }
            
            dissolveText();
            
            // Start glass panes animation after a short delay
            setTimeout(() => {
                animateGlassPanesIn();
            }, 300);
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
    if (textMesh && textMesh.visible && !isTransitioning) {
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
