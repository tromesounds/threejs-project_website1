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
let hoveredPane = null;
let originalPositions = []; // Store original positions for hover animation
let bounceText = null; // Text bouncing inside first pane
let bounceText2 = null; // Text bouncing inside second pane
let bounceText3 = null; // Text bouncing inside third pane
let bounceText4 = null; // Text bouncing inside fourth pane
let bounceVelocity = { x: 0.02, y: 0.015 }; // Bounce speed for first text
let bounceVelocity2 = { x: -0.025, y: 0.018 }; // Bounce speed for second text
let bounceVelocity3 = { x: 0.018, y: -0.022 }; // Bounce speed for third text
let bounceVelocity4 = { x: -0.015, y: -0.025 }; // Bounce speed for fourth text

// Create noise texture for static effect
function createNoiseTexture() {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    
    for (let i = 0; i < size * size * 4; i += 4) {
        const noise = Math.random();
        data[i] = noise * 255;     // R
        data[i + 1] = noise * 255; // G
        data[i + 2] = noise * 255; // B
        data[i + 3] = 100;         // A (transparency)
    }
    
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// Create Glass Panes with ripple effect
function createGlassPanes() {
    const aspect = 16 / 9;
    const paneWidth = 2.5;
    const paneHeight = paneWidth / aspect;
    const paneDepth = 0.1; // Add depth to make them 3D
    const spacing = 0.3;
    const totalHeight = (paneHeight * 4) + (spacing * 3);
    const startY = totalHeight / 2 - paneHeight / 2;

    // Create noise texture for static effect
    const noiseTexture = createNoiseTexture();

    // Create glass material with iridescent effect and noise
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, // Slight white tint for glass
        transmission: 0.1, // Less transparent, more opaque
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
        iridescence: 3.0, // Iridescent effect
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400],
        // Add noise texture as normal map for ripple effect
        normalMap: noiseTexture,
        normalScale: new THREE.Vector2(5.9, 5.9), // Control ripple intensity
    });

    for (let i = 0; i < 4; i++) {
        // Use BoxGeometry for 3D depth instead of PlaneGeometry
        const geometry = new THREE.BoxGeometry(paneWidth, paneHeight, paneDepth);
        const pane = new THREE.Mesh(geometry, glassMaterial);
        
        // Position panes
        pane.position.x = 10; // Start off-screen to the right
        pane.position.y = startY - (i * (paneHeight + spacing));
        pane.position.z = 0;
        
        // Store original position for hover effects
        const originalY = startY - (i * (paneHeight + spacing));
        originalPositions.push({ x: 0, y: originalY, z: 0 });
        
        // Add hover properties and material reference for animation
        pane.userData = { 
            index: i, 
            originalScale: 1, 
            targetScale: 1,
            originalY: originalY,
            noiseTexture: noiseTexture,
            material: glassMaterial
        };
        
        glassPanes.push(pane);
        scene.add(pane);
    }
    
    // Create bouncing text for all panes after all panes are created
    setTimeout(() => {
        createBounceText();
        createBounceText2();
        createBounceText3();
        createBounceText4();
    }, 1000); // Wait for panes to slide in
}

// Update noise texture for animated ripple effect
function updateRippleEffect() {
    if (glassPanes.length === 0) return;
    
    glassPanes.forEach(pane => {
        const texture = pane.userData.noiseTexture;
        if (texture) {
            // Animate the texture offset for flowing ripple effect
            texture.offset.x += 0.001;
            texture.offset.y += 0.0005;
            
            // Occasionally regenerate noise for TV static effect
            if (Math.random() < 0.05) { // 5% chance per frame
                const size = 256;
                const data = texture.image.data;
                
                // Update random portions of the texture
                for (let i = 0; i < 1000; i++) { // Update 1000 random pixels
                    const pixelIndex = Math.floor(Math.random() * size * size) * 4;
                    const noise = Math.random();
                    data[pixelIndex] = noise * 255;     // R
                    data[pixelIndex + 1] = noise * 255; // G
                    data[pixelIndex + 2] = noise * 255; // B
                }
                
                texture.needsUpdate = true;
            }
        }
    });
}

// Create Bouncing Text inside the first glass pane
function createBounceText() {
    if (!font || glassPanes.length === 0) return;
    
    const textGeometry = new TextGeometry('hypsosis', {
        font: font,
        size: 0.15,
        depth: 0.05,
        curveSegments: 8,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 3
    });
    
    const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xe6f3ff,
        metalness: 0.6,
        roughness: 0.3,
        emissive: 0x001122
    });
    
    bounceText = new THREE.Mesh(textGeometry, textMaterial);
    textGeometry.center();
    
    // Position text inside the first glass pane
    const firstPane = glassPanes[0];
    bounceText.position.copy(firstPane.position);
    bounceText.position.z = 0.1; // Slightly in front of the pane
    
    scene.add(bounceText);
}

// Create Bouncing Text inside the second glass pane
function createBounceText2() {
    if (!font || glassPanes.length < 2) return;
    
    const textGeometry = new TextGeometry('omega33', {
        font: font,
        size: 0.12,
        depth: 0.05,
        curveSegments: 8,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 3
    });
    
    const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xe6f3ff,
        metalness: 0.6,
        roughness: 0.3,
        emissive: 0x001122
    });
    
    bounceText2 = new THREE.Mesh(textGeometry, textMaterial);
    textGeometry.center();
    
    // Position text inside the second glass pane
    const secondPane = glassPanes[1];
    bounceText2.position.copy(secondPane.position);
    bounceText2.position.z = 0.1; // Slightly in front of the pane
    
    scene.add(bounceText2);
}

// Create Bouncing Text inside the third glass pane
function createBounceText3() {
    if (!font || glassPanes.length < 3) return;
    
    const textGeometry = new TextGeometry('wyzard33', {
        font: font,
        size: 0.11,
        depth: 0.05,
        curveSegments: 8,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 3
    });
    
    const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xe6f3ff,
        metalness: 0.6,
        roughness: 0.3,
        emissive: 0x001122
    });
    
    bounceText3 = new THREE.Mesh(textGeometry, textMaterial);
    textGeometry.center();
    
    // Position text inside the third glass pane
    const thirdPane = glassPanes[2];
    bounceText3.position.copy(thirdPane.position);
    bounceText3.position.z = 0.1; // Slightly in front of the pane
    
    scene.add(bounceText3);
}

// Create Bouncing Text inside the fourth glass pane
function createBounceText4() {
    if (!font || glassPanes.length < 4) return;
    
    const textGeometry = new TextGeometry('madidas33', {
        font: font,
        size: 0.10,
        depth: 0.05,
        curveSegments: 8,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 3
    });
    
    const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xe6f3ff,
        metalness: 0.6,
        roughness: 0.3,
        emissive: 0x001122
    });
    
    bounceText4 = new THREE.Mesh(textGeometry, textMaterial);
    textGeometry.center();
    
    // Position text inside the fourth glass pane
    const fourthPane = glassPanes[3];
    bounceText4.position.copy(fourthPane.position);
    bounceText4.position.z = 0.1; // Slightly in front of the pane
    
    scene.add(bounceText4);
}

// Update bouncing text animation
function updateBounceText() {
    if (!bounceText || glassPanes.length === 0) return;
    
    const firstPane = glassPanes[0];
    const paneWidth = 2.5;
    const paneHeight = paneWidth / (16/9);
    
    // Calculate boundaries (accounting for text size)
    const textBounds = 0.3; // Approximate text width/height
    const maxX = firstPane.position.x + (paneWidth / 3) - textBounds;
    const minX = firstPane.position.x - (paneWidth / 3) + textBounds;
    const maxY = firstPane.position.y + (paneHeight / 2) - textBounds;
    const minY = firstPane.position.y - (paneHeight / 2) + textBounds;
    
    // Update position
    bounceText.position.x += bounceVelocity.x;
    bounceText.position.y += bounceVelocity.y;
    
    // Bounce off boundaries
    if (bounceText.position.x >= maxX || bounceText.position.x <= minX) {
        bounceVelocity.x *= -0.3;
        bounceText.position.x = Math.max(minX, Math.min(maxX, bounceText.position.x));
    }
    
    if (bounceText.position.y >= maxY || bounceText.position.y <= minY) {
        bounceVelocity.y *= -0.3;
        bounceText.position.y = Math.max(minY, Math.min(maxY, bounceText.position.y));
    }
}

// Update second bouncing text animation
function updateBounceText2() {
    if (!bounceText2 || glassPanes.length < 2) return;
    
    const secondPane = glassPanes[1];
    const paneWidth = 2.5;
    const paneHeight = paneWidth / (16/9);
    
    // Calculate boundaries (accounting for text size)
    const textBounds = 0.3; // Approximate text width/height
    const maxX = secondPane.position.x + (paneWidth / 3) - textBounds;
    const minX = secondPane.position.x - (paneWidth / 3) + textBounds;
    const maxY = secondPane.position.y + (paneHeight / 2) - textBounds;
    const minY = secondPane.position.y - (paneHeight / 2) + textBounds;
    
    // Update position
    bounceText2.position.x += bounceVelocity2.x;
    bounceText2.position.y += bounceVelocity2.y;
    
    // Bounce off boundaries
    if (bounceText2.position.x >= maxX || bounceText2.position.x <= minX) {
        bounceVelocity2.x *= -0.3;
        bounceText2.position.x = Math.max(minX, Math.min(maxX, bounceText2.position.x));
    }
    
    if (bounceText2.position.y >= maxY || bounceText2.position.y <= minY) {
        bounceVelocity2.y *= -0.3;
        bounceText2.position.y = Math.max(minY, Math.min(maxY, bounceText2.position.y));
    }
}

// Update third bouncing text animation
function updateBounceText3() {
    if (!bounceText3 || glassPanes.length < 3) return;
    
    const thirdPane = glassPanes[2];
    const paneWidth = 2.5;
    const paneHeight = paneWidth / (16/9);
    
    // Calculate boundaries (accounting for text size)
    const textBounds = 0.3; // Approximate text width/height
    const maxX = thirdPane.position.x + (paneWidth / 3) - textBounds;
    const minX = thirdPane.position.x - (paneWidth / 3) + textBounds;
    const maxY = thirdPane.position.y + (paneHeight / 2) - textBounds;
    const minY = thirdPane.position.y - (paneHeight / 2) + textBounds;
    
    // Update position
    bounceText3.position.x += bounceVelocity3.x;
    bounceText3.position.y += bounceVelocity3.y;
    
    // Bounce off boundaries
    if (bounceText3.position.x >= maxX || bounceText3.position.x <= minX) {
        bounceVelocity3.x *= -0.3;
        bounceText3.position.x = Math.max(minX, Math.min(maxX, bounceText3.position.x));
    }
    
    if (bounceText3.position.y >= maxY || bounceText3.position.y <= minY) {
        bounceVelocity3.y *= -0.3;
        bounceText3.position.y = Math.max(minY, Math.min(maxY, bounceText3.position.y));
    }
}

// Update fourth bouncing text animation
function updateBounceText4() {
    if (!bounceText4 || glassPanes.length < 4) return;
    
    const fourthPane = glassPanes[3];
    const paneWidth = 2.5;
    const paneHeight = paneWidth / (16/9);
    
    // Calculate boundaries (accounting for text size)
    const textBounds = 0.3; // Approximate text width/height
    const maxX = fourthPane.position.x + (paneWidth / 3) - textBounds;
    const minX = fourthPane.position.x - (paneWidth / 3) + textBounds;
    const maxY = fourthPane.position.y + (paneHeight / 2) - textBounds;
    const minY = fourthPane.position.y - (paneHeight / 2) + textBounds;
    
    // Update position
    bounceText4.position.x += bounceVelocity4.x;
    bounceText4.position.y += bounceVelocity4.y;
    
    // Bounce off boundaries
    if (bounceText4.position.x >= maxX || bounceText4.position.x <= minX) {
        bounceVelocity4.x *= -0.3;
        bounceText4.position.x = Math.max(minX, Math.min(maxX, bounceText4.position.x));
    }
    
    if (bounceText4.position.y >= maxY || bounceText4.position.y <= minY) {
        bounceVelocity4.y *= -0.3;
        bounceText4.position.y = Math.max(minY, Math.min(maxY, bounceText4.position.y));
    }
}

// Animate Glass Panes In
function animateGlassPanesIn() {
    glassPanes.forEach((pane, index) => {
        // Stagger delay: each pane starts after the previous one finishes
        const delay = index * 500; // 500ms delay between each pane start
        
        setTimeout(() => {
            const startX = pane.position.x;
            const targetX = 0;
            const duration = 800; // Slightly faster individual animation
            const startTime = Date.now();
            
            function animatePane() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Smoother easing function
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                
                pane.position.x = startX + (targetX - startX) * easeOutQuart;
                
                if (progress < 1) {
                    requestAnimationFrame(animatePane);
                }
            }
            
            animatePane();
        }, delay);
    });
}

// Animate Glass Panes for hover effects
function animateGlassPanes() {
    glassPanes.forEach((pane, index) => {
        const userData = pane.userData;
        const isHovered = pane === hoveredPane;
        
        // Animate scale
        const scaleSpeed = 0.1;
        userData.originalScale += (userData.targetScale - userData.originalScale) * scaleSpeed;
        pane.scale.set(userData.originalScale, userData.originalScale, userData.originalScale);
        
        // Calculate position adjustments to make room for expanded pane
        let targetY = userData.originalY;
        
        if (hoveredPane && hoveredPane !== pane) {
            const hoveredIndex = hoveredPane.userData.index;
            const paneSpacing = 0.3;
            const expandedExtraHeight = (1.2 - 1) * (2.5 / (16/9)) / 2; // Half of extra height
            
            if (index < hoveredIndex) {
                // Panes above the hovered pane move up
                targetY = userData.originalY + expandedExtraHeight + paneSpacing * 0.3;
            } else if (index > hoveredIndex) {
                // Panes below the hovered pane move down
                targetY = userData.originalY - expandedExtraHeight - paneSpacing * 0.3;
            }
        }
        
        // Animate position
        const posSpeed = 0.1;
        pane.position.y += (targetY - pane.position.y) * posSpeed;
    });
}

// Handle Glass Pane Hover Effects
function updateGlassPaneHover() {
    if (glassPanes.length === 0) return;
    
    // Cast ray to check for glass pane intersections
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(glassPanes);
    
    const newHoveredPane = intersects.length > 0 ? intersects[0].object : null;
    
    // If hover state changed
    if (newHoveredPane !== hoveredPane) {
        // Reset previous hovered pane
        if (hoveredPane) {
            hoveredPane.userData.targetScale = 1;
        }
        
        // Set new hovered pane
        hoveredPane = newHoveredPane;
        if (hoveredPane) {
            hoveredPane.userData.targetScale = 1.2; // 20% larger
        }
    }
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
    
    // Update glass pane hover effects
    updateGlassPaneHover();
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
            textMesh.material.color.set(0xADD8E6);
            
            // Dissolve text instead of moving it
            const duration = 500; // 0.5 seconds for dissolve
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
                const scale = 1 - (progress * 0.2);
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
    
    // Only recreate text if we haven't transitioned yet
    if (font && !isTransitioning && (!textMesh || textMesh.visible)) {
        createTextGeometry();
    }
});

// Animation Loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    spinBackground();
    
    // Animate glass pane hover effects
    if (glassPanes.length > 0) {
        animateGlassPanes();
    }
    
    // Update ripple effect on glass panes
    updateRippleEffect();
    
    // Update bouncing text
    updateBounceText();
    updateBounceText2();
    updateBounceText3();
    updateBounceText4();
    
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
