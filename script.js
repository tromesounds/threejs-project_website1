import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';




//V2.3 HDR - Mobile Optimized

// ============================================
// MOBILE DETECTION
// ============================================
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

function getScreenInfo() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isLandscape = w > h;
    const isSmallPhone = w < 400 || (isLandscape && h < 400);
    const isMediumPhone = (w >= 400 && w < 768) || (isLandscape && h >= 400 && h < 768);
    const isTablet = (w >= 768 && w < 1024) || (isLandscape && h >= 768);
    const isMobile = isSmallPhone || isMediumPhone || isMobileDevice;
    
    return { w, h, isLandscape, isSmallPhone, isMediumPhone, isTablet, isMobile };
}

let screenInfo = getScreenInfo();

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    sections: [
        { id: 'dev', label: 'DEV' },
        { id: 'design', label: 'DESIGN' },
        { id: 'omega33', label: 'OMEGA33' },
        { id: 'wyzard33', label: 'WYZARD33' },
        { id: 'madidas33', label: 'MADIDAS33' }
    ],
    sectionColors: {
        dev: new THREE.Color(0x4a9eff),
        design: new THREE.Color(0x4a9eff),
        omega33: new THREE.Color(0x00ff44),
        wyzard33: new THREE.Color(0xaa44ff),
        madidas33: new THREE.Color(0xff4466)
    },
    currentColor: new THREE.Color(0x4a9eff),
    omega33Links: [
        { id: 'hexagon', label: 'HEXAGON', url: 'https://ditto.fm/hexagon-omega33', icon: 'Ã°Å¸Å½Âµ' },
        { id: 'cheeseburger', label: 'CHEESEBURGER', url: 'https://ditto.fm/cheese-burger', icon: 'Ã°Å¸Å½Âµ' },
        { id: 'beatport', label: 'BEATPORT', url: 'https://www.beatport.com/artist/omega33/1264268', icon: 'Ã°Å¸Å½Â§' },
        { id: 'spotify', label: 'SPOTIFY', url: 'https://open.spotify.com/artist/39EACtotv2HxMQmnPVnbHt', icon: 'Ã°Å¸Å½Â§' },
        { id: 'soundcloud', label: 'SOUNDCLOUD', url: 'https://soundcloud.com/omega33dj', icon: 'Ã¢ËœÂÃ¯Â¸Â', embed: true },
        { id: 'youtube', label: 'YOUTUBE', url: 'https://www.youtube.com/@Omega33dj', icon: 'Ã°Å¸â€œÂº' },
        { id: 'instagram', label: 'INSTAGRAM', url: 'https://www.instagram.com/omega33dj', icon: 'Ã°Å¸â€œÂ·' },
        { id: 'tiktok', label: 'TIKTOK', url: 'https://www.tiktok.com/@omega33dj', icon: 'Ã°Å¸Å½Â¬' }
    ],
    wyzard33Links: [
        { id: 'murder-bootleg', label: 'MURDER BOOTLEG', url: 'https://soundcloud.com/wyzard33/out-in-the-street-they-call-it-murder-wyzard33-bootleg-hitech-psytrance', icon: 'Ã°Å¸Å½Âµ' },
        { id: 'youtube-video', label: 'YOUTUBE', url: 'https://youtu.be/SPOAmzanUlM', icon: 'Ã°Å¸â€œÂº' },
        { id: 'instagram', label: 'INSTAGRAM', url: 'https://www.instagram.com/wyzard33/', icon: 'Ã°Å¸â€œÂ·' },
        { id: 'soundcloud', label: 'SOUNDCLOUD', url: 'https://soundcloud.com/wyzard33', icon: 'Ã¢ËœÂÃ¯Â¸Â' },
        { id: 'tiktok', label: 'TIKTOK', url: 'https://www.tiktok.com/@wyzard33', icon: 'Ã°Å¸Å½Â¬' },
        { id: 'facebook', label: 'FACEBOOK', url: 'https://www.facebook.com/wyzard33/', icon: 'Ã°Å¸â€œËœ' }
    ],
    madidas33Links: [
        { id: 'drop-da-baes', label: 'DROP DA BAES 404', url: 'https://soundcloud.com/madidas33/sets/drop-da-baes-404/s-mOumtSqUVxF', icon: 'Ã°Å¸Å½Âµ' },
        { id: 'soundcloud', label: 'SOUNDCLOUD', url: 'https://soundcloud.com/madidas33', icon: 'Ã¢ËœÂÃ¯Â¸Â' },
        { id: 'tiktok', label: 'TIKTOK', url: 'https://www.tiktok.com/@madidas33', icon: 'Ã°Å¸Å½Â¬' },
        { id: 'instagram', label: 'INSTAGRAM', url: 'https://instagram.com/madidas33', icon: 'Ã°Å¸â€œÂ·' }
    ]
};

// ============================================
// STATE MANAGEMENT
// ============================================
let currentSection = 'main'; // 'main' or section id like 'omega33'
let transitionProgress = 0; // 0 = main menu, 1 = section view
let targetTransition = 0;
let isTransitioning = false;

// ============================================
// SCENE SETUP
// ============================================
const scene = new THREE.Scene();
const sizes = { width: window.innerWidth, height: window.innerHeight };

const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0, 14);
scene.add(camera);

const canvas = document.querySelector('canvas.webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.7;

// ============================================
// POST-PROCESSING
// ============================================
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    0.15,
    0.4,
    0.85
);
// composer.addPass(bloomPass);
// composer.addPass(new OutputPass());

// ============================================
// MOUSE & TOUCH INTERACTION
// ============================================
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
const touch = { 
    isDragging: false, 
    startX: 0, 
    startY: 0, 
    deltaX: 0, 
    deltaY: 0,
    logoRotationX: 0,
    logoRotationY: 0
};
let touchTapTimeout = null;
let isTouchTap = false;

// Desktop mouse move - updates hover and logo tracking
function onMouseMove(event) {
    mouse.targetX = (event.clientX / sizes.width) * 2 - 1;
    mouse.targetY = -(event.clientY / sizes.height) * 2 + 1;
}

// Touch start - record start position
function onTouchStart(event) {
    if (event.touches.length === 1) {
        touch.isDragging = false;
        touch.startX = event.touches[0].clientX;
        touch.startY = event.touches[0].clientY;
        isTouchTap = true;
        
        // Set position for raycasting on tap
        mouse.targetX = (touch.startX / sizes.width) * 2 - 1;
        mouse.targetY = -(touch.startY / sizes.height) * 2 + 1;
    }
}

// Touch move - drag to rotate logo, don't trigger hover on buttons
function onTouchMove(event) {
    if (event.touches.length === 1) {
        const currentX = event.touches[0].clientX;
        const currentY = event.touches[0].clientY;
        const moveDistance = Math.sqrt(
            Math.pow(currentX - touch.startX, 2) + 
            Math.pow(currentY - touch.startY, 2)
        );
        
        // If moved more than 10px, it's a drag not a tap
        if (moveDistance > 10) {
            isTouchTap = false;
            touch.isDragging = true;
            
            // Calculate rotation delta
            touch.deltaX = (currentX - touch.startX) / sizes.width * 4;
            touch.deltaY = (currentY - touch.startY) / sizes.height * 4;
            
            // Update logo rotation targets
            touch.logoRotationY = touch.deltaX * 2;
            touch.logoRotationX = -touch.deltaY * 2;
        }
        
        // Don't update mouse position during drag - prevents button hover
        event.preventDefault();
    }
}

// Touch end - if it was a tap, handle click
function onTouchEnd(event) {
    if (isTouchTap) {
        // It was a tap - trigger click behavior
        handleTouchTap();
    }
    
    // Reset drag state
    touch.isDragging = false;
    touch.deltaX = 0;
    touch.deltaY = 0;
}

// Handle touch tap - find what was tapped and activate it
function handleTouchTap() {
    const now = Date.now();
    if (now - lastClickTime < 300) return;
    lastClickTime = now;
    
    // Update raycaster with tap position
    raycaster.setFromCamera(new THREE.Vector2(mouse.targetX, mouse.targetY), camera);
    
    if (currentSection === 'main') {
        // Check which button was tapped
        for (let i = 0; i < menuItems.length; i++) {
            const intersects = raycaster.intersectObject(menuItems[i].userData.fill);
            if (intersects.length > 0) {
                // Trigger tap animation
                menuItems[i].userData.tapAnimation = 1.0;
                
                // Delay action slightly for animation
                const section = menuItems[i].userData.section;
                setTimeout(() => {
                    if (section.id === 'omega33') {
                        transitionToSection('omega33');
                    } else if (section.id === 'wyzard33') {
                        transitionToSection('wyzard33');
                    } else if (section.id === 'madidas33') {
                        transitionToSection('madidas33');
                    } else if (section.id === 'dev') {
                        window.open('https://hypsosis.itch.io/', '_blank');
                    } else if (section.id === 'design') {
                        window.open('https://www.instagram.com/hypsosis', '_blank');
                    }
                }, 150);
                return;
            }
        }
    } else if (currentSection === 'omega33') {
        for (let i = 0; i < omega33Items.length; i++) {
            if (!omega33Items[i].visible) continue;
            const meshes = omega33Items[i].children.filter(c => c.type === 'Mesh');
            const intersects = raycaster.intersectObjects(meshes);
            if (intersects.length > 0) {
                omega33Items[i].userData.tapAnimation = 1.0;
                const item = omega33Items[i];
                setTimeout(() => {
                    if (item.userData.isBackButton) {
                        transitionToSection('main');
                    } else {
                        const linkData = item.userData.linkData;
                        if (linkData.embed && (linkData.id === 'soundcloud' || linkData.id.includes('soundcloud'))) {
                            showEmbedOverlay('soundcloud', linkData.url, 'omega33');
                        } else if (linkData.embed && (linkData.id === 'youtube' || linkData.id.includes('youtube'))) {
                            showEmbedOverlay('youtube', linkData.url, 'omega33');
                        } else {
                            window.open(linkData.url, '_blank');
                        }
                    }
                }, 150);
                return;
            }
        }
    } else if (currentSection === 'wyzard33') {
        for (let i = 0; i < wyzard33Items.length; i++) {
            if (!wyzard33Items[i].visible) continue;
            const meshes = wyzard33Items[i].children.filter(c => c.type === 'Mesh');
            const intersects = raycaster.intersectObjects(meshes);
            if (intersects.length > 0) {
                wyzard33Items[i].userData.tapAnimation = 1.0;
                const item = wyzard33Items[i];
                setTimeout(() => {
                    if (item.userData.isBackButton) {
                        transitionToSection('main');
                    } else {
                        const linkData = item.userData.linkData;
                        if (linkData.embed && (linkData.id === 'soundcloud' || linkData.id.includes('soundcloud') || linkData.id === 'murder-bootleg')) {
                            showEmbedOverlay('soundcloud', linkData.url, 'wyzard33');
                        } else if (linkData.embed && (linkData.id === 'youtube' || linkData.id.includes('youtube'))) {
                            showEmbedOverlay('youtube', linkData.url, 'wyzard33');
                        } else {
                            window.open(linkData.url, '_blank');
                        }
                    }
                }, 150);
                return;
            }
        }
    } else if (currentSection === 'madidas33') {
        for (let i = 0; i < madidas33Items.length; i++) {
            if (!madidas33Items[i].visible) continue;
            const meshes = madidas33Items[i].children.filter(c => c.type === 'Mesh');
            const intersects = raycaster.intersectObjects(meshes);
            if (intersects.length > 0) {
                madidas33Items[i].userData.tapAnimation = 1.0;
                const item = madidas33Items[i];
                setTimeout(() => {
                    if (item.userData.isBackButton) {
                        transitionToSection('main');
                    } else {
                        const linkData = item.userData.linkData;
                        if (linkData.embed && (linkData.id === 'soundcloud' || linkData.id.includes('soundcloud') || linkData.id === 'drop-da-baes')) {
                            showEmbedOverlay('soundcloud', linkData.url, 'madidas33');
                        } else if (linkData.embed && (linkData.id === 'youtube' || linkData.id.includes('youtube'))) {
                            showEmbedOverlay('youtube', linkData.url, 'madidas33');
                        } else {
                            window.open(linkData.url, '_blank');
                        }
                    }
                }, 150);
                return;
            }
        }
    }
}

// Desktop only - mouse events
window.addEventListener('mousemove', onMouseMove);

// Touch events - mobile/tablet
window.addEventListener('touchstart', onTouchStart, { passive: false });
window.addEventListener('touchmove', onTouchMove, { passive: false });
window.addEventListener('touchend', onTouchEnd);

// ============================================
// LIGHTING
// ============================================
scene.add(new THREE.AmbientLight(0xffffff, 0.25));
const mainLight = new THREE.PointLight(0x4a9eff, 1.2, 50);
mainLight.position.set(-8, 3, 12);
scene.add(mainLight);

// ============================================
// BACKGROUND - SKY TEXTURE
// ============================================
let bgRotation = 0;
let skyTexture = null;

new RGBELoader().load(import.meta.env.BASE_URL + './assets/kloofendal_48d_partly_cloudy_puresky_1k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    skyTexture = texture;
    scene.background = texture;
    scene.environment = texture;
}, undefined, () => {
    scene.background = new THREE.Color(0x0a1628);
});

// ============================================
// XORDEV SHADER BACKGROUND (for omega33)
// ============================================
const xorShaderGroup = new THREE.Group();
scene.add(xorShaderGroup);
xorShaderGroup.visible = false;

const xorShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(sizes.width, sizes.height) },
        opacity: { value: 0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            // Render in screen space - ignore camera transforms
            gl_Position = vec4(position.xy, 0.0, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform float opacity;
        varying vec2 vUv;
        
        void main() {
            vec2 FC = vUv * resolution;
            vec2 r = resolution;
            vec4 o = vec4(0.0);
            
            float t = time * 0.5;
            
            for(float i = 0.0, z = 0.0, d = 0.0; i < 60.0; i++) {
                // Normalized direction
                vec3 dir = normalize(vec3(FC.xy * 2.0 - r, r.y));
                
                // Round to create pixelated/crystalline structure
                vec3 p = round(z * dir / 0.1) * 0.1;
                p.z -= 9.0;
                
                // Iterative distortion
                for(d = 0.0; d < 9.0; d++) {
                    p += 0.2 * sin(p * d - t + z).yzx;
                }
                
                // Distance calculation
                d = length(cos(p) - 1.0) / 20.0;
                z += d;
                
                // Accumulate color - green tint for omega33
                o += vec4(z * 0.5, z, z * 0.3, 1.0) / (d * d + 0.001) * 0.00001;
            }
            
            // Apply tanh for tone mapping
            o = tanh(o * 0.8);
            
            // Add green tint
            o.g *= 1.3;
            o.r *= 0.7;
            
            gl_FragColor = vec4(o.rgb, opacity);
        }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false
});

// Use a fullscreen quad with NDC coordinates (-1 to 1)
const xorPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    xorShaderMaterial
);
xorPlane.frustumCulled = false;
xorShaderGroup.add(xorPlane);

// ============================================
// WYZARD33 SHADER BACKGROUND (purple crystalline)
// ============================================
const wyzardShaderGroup = new THREE.Group();
scene.add(wyzardShaderGroup);
wyzardShaderGroup.visible = false;

const wyzardShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(sizes.width, sizes.height) },
        opacity: { value: 0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform float opacity;
        varying vec2 vUv;
        
        void main() {
            vec2 FC = vUv * resolution;
            vec2 r = resolution;
            vec4 o = vec4(0.0);
            
            float t = time * 0.5;
            
            for(float i = 0.0, z = 0.0, d = 0.0; z + i < 70.0; i++) {
                // Absolute value creates mirror symmetry
                vec3 p = abs(z * normalize(vec3(FC.xy * 2.0 - r, r.y)));
                p.z += t * 5.0;
                p += sin(p + p);
                
                // Iterative distortion with cosine
                for(d = 0.0; d < 9.0; d++) {
                    p += 0.4 * cos(round(0.2 * d * p) + 0.2 * t).zxy;
                }
                
                // Distance calculation with sqrt
                d = 0.1 * sqrt(length(p.xyy * p.yxy));
                z += d;
                
                // Accumulate color - purple/blue tint for wyzard33
                o += vec4(z, 1.0, 9.0, 1.0) / (d + 0.001);
            }
            
            // Apply tanh for tone mapping
            o = tanh(o / 7000.0);
            
            // Add purple tint
            o.r *= 1.2;
            o.b *= 1.4;
            o.g *= 0.6;
            
            gl_FragColor = vec4(o.rgb, opacity);
        }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false
});

const wyzardPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    wyzardShaderMaterial
);
wyzardPlane.frustumCulled = false;
wyzardShaderGroup.add(wyzardPlane);

// ============================================
// MADIDAS33 SHADER BACKGROUND (red/pink)
// ============================================
const madidasShaderGroup = new THREE.Group();
scene.add(madidasShaderGroup);
madidasShaderGroup.visible = false;

const madidasShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(sizes.width, sizes.height) },
        opacity: { value: 0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform float opacity;
        varying vec2 vUv;
        
        void main() {
            vec2 FC = vUv * resolution;
            vec2 r = resolution;
            vec4 o = vec4(0.0);
            
            float t = time * 0.5;
            
            for(float i = 0.0, z = 0.0, d = 0.0; i < 60.0; i++) {
                vec3 p = z * normalize(vec3(FC.xy * 2.0 - r, r.y));
                p.z -= t;
                p = round(p / 0.1) * 0.1;
                
                for(d = 0.0; d < 9.0; d++) {
                    p += 0.2 * cos(p * d + z).zzx;
                }
                
                d = abs(abs(p.y) - 3.0) / 20.0;
                z += d;
                
                o += vec4(19.0, z, 1.0, 1.0) / (d * d + 0.0001);
            }
            
            o = tanh(o / 700000.0);
            
            // Red/pink tint
            o.r *= 1.4;
            o.g *= 0.5;
            o.b *= 0.7;
            
            gl_FragColor = vec4(o.rgb, opacity);
        }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false
});

const madidasPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    madidasShaderMaterial
);
madidasPlane.frustumCulled = false;
madidasShaderGroup.add(madidasPlane);

// ============================================
// FLOATING PARTICLES / FIREFLIES
// ============================================
const particleCount = 3;
const particleGroup = new THREE.Group();
scene.add(particleGroup);

const particles = [];
for (let i = 0; i < particleCount; i++) {
    const geom = new THREE.PlaneGeometry(0.3, 0.3);
    const mat = new THREE.ShaderMaterial({
        uniforms: {
            opacity: { value: 0.015 + Math.random() * 0.015 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float opacity;
            varying vec2 vUv;
            void main() {
                float dist = length(vUv - 0.5) * 2.0;
                float alpha = smoothstep(1.0, 0.0, dist);
                alpha = pow(alpha, 0.5) * opacity;
                gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    const particle = new THREE.Mesh(geom, mat);
    
    particle.position.set(
        -3 + Math.random() * 6,
        -2 + Math.random() * 4,
        Math.random() * 2
    );
    
    particle.userData = {
        basePos: particle.position.clone(),
        speed: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        orbitRadius: 0.8 + Math.random() * 1.2,
        orbitSpeed: 0.2 + Math.random() * 0.4
    };
    
    particleGroup.add(particle);
    particles.push(particle);
}

// ============================================
// LENS FLARES
// ============================================
const flareGroup = new THREE.Group();
scene.add(flareGroup);

const mainFlareGeom = new THREE.CircleGeometry(0.8, 64);
const mainFlareMat = new THREE.ShaderMaterial({
    uniforms: {
        color: { value: new THREE.Color(0x88ccff) },
        opacity: { value: 0.3 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        varying vec2 vUv;
        void main() {
            float dist = length(vUv - 0.5) * 2.0;
            float alpha = smoothstep(1.0, 0.0, dist) * opacity;
            gl_FragColor = vec4(color, alpha);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
});
const mainFlare = new THREE.Mesh(mainFlareGeom, mainFlareMat);
mainFlare.position.set(-2.5, 0.5, 0.5);
flareGroup.add(mainFlare);

const flareRings = [];
// Removed flare rings that were positioned around the orb

const secondaryFlares = [];
for (let i = 0; i < 6; i++) {
    const size = 0.1 + Math.random() * 0.2;
    const geom = new THREE.CircleGeometry(size, 32);
    const mat = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color().setHSL(0.5 + Math.random() * 0.15, 0.6, 0.7) },
            opacity: { value: 0.03 + Math.random() * 0.04 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform float opacity;
            varying vec2 vUv;
            void main() {
                float dist = length(vUv - 0.5) * 2.0;
                float alpha = smoothstep(1.0, 0.3, dist) * opacity;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const flare = new THREE.Mesh(geom, mat);
    
    const t = (i + 1) / 7;
    flare.position.set(-2.5 + t * 5, 0.5 - t * 1.5, 0.3);
    flare.userData = { t, baseOpacity: mat.uniforms.opacity.value };
    flareGroup.add(flare);
    secondaryFlares.push(flare);
}

// ============================================
// AURORA RIBBONS
// ============================================
const auroraGroup = new THREE.Group();
scene.add(auroraGroup);
auroraGroup.position.z = -3;

const auroraMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x4a9eff) },
        color2: { value: new THREE.Color(0x88ffcc) },
        color3: { value: new THREE.Color(0xaa66ff) }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        
        void main() {
            vUv = uv;
            vPosition = position;
            
            vec3 pos = position;
            pos.y += sin(position.x * 0.5 + time * 0.5) * 0.3;
            pos.z += cos(position.x * 0.3 + time * 0.3) * 0.2;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            float t = vUv.x + sin(vUv.y * 3.0 + time * 0.5) * 0.2;
            t = mod(t + time * 0.1, 1.0);
            
            vec3 color;
            if (t < 0.33) {
                color = mix(color1, color2, t * 3.0);
            } else if (t < 0.66) {
                color = mix(color2, color3, (t - 0.33) * 3.0);
            } else {
                color = mix(color3, color1, (t - 0.66) * 3.0);
            }
            
            float fadeY = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.65, vUv.y);
            float fadeX = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
            float alpha = fadeX * fadeY;
            
            alpha *= 0.08 + sin(vUv.x * 8.0 + time) * 0.03;
            
            float shimmer = sin(vUv.x * 30.0 + vUv.y * 20.0 + time * 3.0) * 0.5 + 0.5;
            shimmer = pow(shimmer, 6.0) * 0.1;
            
            gl_FragColor = vec4(color + shimmer, alpha);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
});

const auroraRibbons = [];
for (let i = 0; i < 3; i++) {
    const ribbonGeom = new THREE.PlaneGeometry(14, 2, 60, 12);
    const ribbon = new THREE.Mesh(ribbonGeom, auroraMaterial.clone());
    ribbon.position.set(0, 2.5 + i * 1.0, -2 - i * 0.5);
    ribbon.rotation.x = -0.2 + i * 0.08;
    ribbon.userData.phaseOffset = i * 0.5;
    auroraGroup.add(ribbon);
    auroraRibbons.push(ribbon);
}

// ============================================
// 3D HYPSOSIS TEXT WITH METALLIC MATERIAL
// ============================================
const logoGroup = new THREE.Group();
scene.add(logoGroup);
logoGroup.position.set(-2, 0, 0);

// Placeholder variables - will be set when font loads
let logoTextMesh = null;
let logoMaterial = null;

// Create metallic material for the text - chrome/silver look
logoMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 1.0,
    roughness: 0.1,
    envMapIntensity: 2.0
});

// We'll create the text mesh after the font loads (see FontLoader section below)

// ============================================
// MAIN MENU - CURVED MENU WITH IRIDESCENT BUTTONS
// ============================================
const menuGroup = new THREE.Group();
scene.add(menuGroup);

const menuItems = [];
let hoveredIndex = -1;
let selectedIndex = -1;

const arcConfig = {
    radius: 3.2,
    startAngle: Math.PI * 0.22,
    endAngle: Math.PI * -0.22
};

function createIridescentMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            opacity: { value: 0.06 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float opacity;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
                vec2 p = vUv * 2.0;
                
                float flow = sin(p.x * 1.5 + p.y * 1.0 + time * 0.4) * 0.5;
                flow += sin(p.x * 0.8 - p.y * 1.2 + time * 0.25) * 0.3;
                
                float hue = flow * 0.4 + 0.5 + time * 0.03;
                
                float h = mod(hue, 1.0) * 6.0;
                float c = 0.4;
                float x = c * (1.0 - abs(mod(h, 2.0) - 1.0));
                vec3 rgb;
                if (h < 1.0) rgb = vec3(c, x, 0.0);
                else if (h < 2.0) rgb = vec3(x, c, 0.0);
                else if (h < 3.0) rgb = vec3(0.0, c, x);
                else if (h < 4.0) rgb = vec3(0.0, x, c);
                else if (h < 5.0) rgb = vec3(x, 0.0, c);
                else rgb = vec3(c, 0.0, x);
                
                vec3 color = mix(vec3(1.0), rgb + 0.5, 0.3);
                
                gl_FragColor = vec4(color, opacity);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });
}

function createButton(section, index, total, font) {
    const group = new THREE.Group();
    group.userData.section = section;
    group.userData.index = index;
    
    // Don't set position here - updateMenuLayout will handle it
    // Just initialize basePosition, it will be set properly by updateMenuLayout
    group.userData.basePosition = new THREE.Vector3(0, 0, 0);
    group.userData.baseY = 0;
    group.userData.angle = 0;
    
    const width = 3.2;
    const height = 0.6;
    const cornerRadius = 0.08;
    
    const shape = new THREE.Shape();
    shape.moveTo(-width/2 + cornerRadius, -height/2);
    shape.lineTo(width/2 - cornerRadius, -height/2);
    shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + cornerRadius);
    shape.lineTo(width/2, height/2 - cornerRadius);
    shape.quadraticCurveTo(width/2, height/2, width/2 - cornerRadius, height/2);
    shape.lineTo(-width/2 + cornerRadius, height/2);
    shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - cornerRadius);
    shape.lineTo(-width/2, -height/2 + cornerRadius);
    shape.quadraticCurveTo(-width/2, -height/2, -width/2 + cornerRadius, -height/2);
    
    const backingMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.15
    });
    const backing = new THREE.Mesh(new THREE.ShapeGeometry(shape), backingMat);
    backing.position.z = -0.002;
    group.add(backing);
    
    const iridescentMat = createIridescentMaterial();
    const fill = new THREE.Mesh(new THREE.ShapeGeometry(shape), iridescentMat);
    group.add(fill);
    
    const fillMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.03
    });
    const fillOverlay = new THREE.Mesh(new THREE.ShapeGeometry(shape), fillMat);
    fillOverlay.position.z = 0.001;
    group.add(fillOverlay);
    
    const borderPoints = shape.getPoints(40);
    const borderMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5
    });
    const border = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(borderPoints.map(p => new THREE.Vector3(p.x, p.y, 0.002))),
        borderMat
    );
    group.add(border);
    
    const highlightMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4
    });
    const highlight = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-width/2 + 0.15, height/2 - 0.04, 0.003),
            new THREE.Vector3(width/2 - 0.15, height/2 - 0.04, 0.003)
        ]),
        highlightMat
    );
    group.add(highlight);
    
    const glowShape = new THREE.Shape();
    const gw = width + 0.25, gh = height + 0.2, gr = 0.12;
    glowShape.moveTo(-gw/2 + gr, -gh/2);
    glowShape.lineTo(gw/2 - gr, -gh/2);
    glowShape.quadraticCurveTo(gw/2, -gh/2, gw/2, -gh/2 + gr);
    glowShape.lineTo(gw/2, gh/2 - gr);
    glowShape.quadraticCurveTo(gw/2, gh/2, gw/2 - gr, gh/2);
    glowShape.lineTo(-gw/2 + gr, gh/2);
    glowShape.quadraticCurveTo(-gw/2, gh/2, -gw/2, gh/2 - gr);
    glowShape.lineTo(-gw/2, -gh/2 + gr);
    glowShape.quadraticCurveTo(-gw/2, -gh/2, -gw/2 + gr, -gh/2);
    
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const glow = new THREE.Mesh(new THREE.ShapeGeometry(glowShape), glowMat);
    glow.position.z = -0.005;
    group.add(glow);
    
    // Connector disc
    const discGroup = new THREE.Group();
    discGroup.position.set(-width/2 - 0.55, 0, 0);
    
    const discRing = new THREE.Mesh(
        new THREE.RingGeometry(0.16, 0.22, 32),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    );
    discGroup.add(discRing);
    
    const discInner = new THREE.Mesh(
        new THREE.CircleGeometry(0.12, 32),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })
    );
    discInner.position.z = 0.001;
    discGroup.add(discInner);
    
    const discDot = new THREE.Mesh(
        new THREE.CircleGeometry(0.04, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
    );
    discDot.position.z = 0.002;
    discGroup.add(discDot);
    
    const discGlowMesh = new THREE.Mesh(
        new THREE.CircleGeometry(0.32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending })
    );
    discGlowMesh.position.z = -0.001;
    discGroup.add(discGlowMesh);
    
    group.add(discGroup);
    
    const connector = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-width/2 - 0.3, 0, 0),
            new THREE.Vector3(-width/2 + 0.05, 0, 0)
        ]),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 })
    );
    group.add(connector);
    
    // Text
    if (font) {
        const textGeom = new TextGeometry(section.label, {
            font: font,
            size: 0.16,
            depth: 0.003,
            curveSegments: 12,
            bevelEnabled: false
        });
        textGeom.computeBoundingBox();
        const bbox = textGeom.boundingBox;
        const textHeight = bbox.max.y - bbox.min.y;
        
        const yAdjustments = [0, 0.03, 0.03, 0.03, 0];
        const yAdj = yAdjustments[index] || 0;
        const textY = -textHeight / 2 - bbox.min.y - yAdj;
        const textX = -width / 2 + 0.2;
        
        const shadowGeom = textGeom.clone();
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.6
        });
        const shadow = new THREE.Mesh(shadowGeom, shadowMat);
        shadow.position.set(textX + 0.01, textY - 0.01, 0.002);
        group.add(shadow);
        
        const textMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1.0
        });
        const text = new THREE.Mesh(textGeom, textMat);
        text.position.set(textX, textY, 0.004);
        group.add(text);
        group.userData.textMat = textMat;
        group.userData.shadowMat = shadowMat;
    }
    
    group.userData = {
        ...group.userData,
        backing, backingMat,
        fill, iridescentMat,
        fillOverlay, fillMat,
        border, borderMat,
        highlight, highlightMat,
        glow, glowMat,
        discGroup, discRing, discInner, discDot, discGlowMesh,
        connector,
        width, height,
        hoverProgress: 0
    };
    
    // Position will be set by updateMenuLayout after creation
    group.position.set(0, 0, 0);
    
    return group;
}

// ============================================
// OMEGA33 SECTION - GREEN TRANSPARENT WINDOWS
// ============================================
const omega33Group = new THREE.Group();
scene.add(omega33Group);
omega33Group.visible = false;

const omega33Items = [];
let omega33Font = null;

function createOmega33LinkWindow(linkData, index, total, font, isBackButton = false) {
    const group = new THREE.Group();
    group.userData.linkData = linkData;
    group.userData.index = index;
    group.userData.isBackButton = isBackButton;
    
    // Uniform size for all buttons
    const width = 3.0;
    const height = 0.6;
    
    // Single column layout - all buttons stacked vertically
    const spacing = 0.15;
    const x = 0;
    const y = 2.8 - index * (height + spacing);
    
    group.userData.basePosition = new THREE.Vector3(x, y, 0);
    group.userData.baseY = y;
    
    // Window shape
    const shape = new THREE.Shape();
    const cr = 0.05;
    shape.moveTo(-width/2 + cr, -height/2);
    shape.lineTo(width/2 - cr, -height/2);
    shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + cr);
    shape.lineTo(width/2, height/2 - cr);
    shape.quadraticCurveTo(width/2, height/2, width/2 - cr, height/2);
    shape.lineTo(-width/2 + cr, height/2);
    shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - cr);
    shape.lineTo(-width/2, -height/2 + cr);
    shape.quadraticCurveTo(-width/2, -height/2, -width/2 + cr, -height/2);
    
    // Green window fill - use simple MeshBasicMaterial instead of shader
    const windowMat = new THREE.MeshBasicMaterial({
        color: 0x00ff44,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const windowMesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), windowMat);
    windowMesh.renderOrder = 1;
    group.add(windowMesh);
    
    // Neon border
    const borderPoints = shape.getPoints(30);
    const borderMat = new THREE.LineBasicMaterial({
        color: 0x00ff44,
        transparent: true,
        opacity: 0.8
    });
    const border = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(borderPoints.map(p => new THREE.Vector3(p.x, p.y, 0.002))),
        borderMat
    );
    border.renderOrder = 2;
    group.add(border);
    
    // Text label - BLACK fill for visibility against shader
    if (font) {
        const label = isBackButton ? '< HYPSOSIS' : linkData.label;
        const textGeom = new TextGeometry(label, {
            font: font,
            size: 0.14,
            depth: 0.001,
            curveSegments: 6,
            bevelEnabled: false
        });
        // Center the geometry - this properly centers text regardless of characters
        textGeom.center();
        
        // Main text fill - BLACK so it contrasts with green shader
        const textMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 1.0
        });
        const text = new THREE.Mesh(textGeom, textMat);
        // Slight downward offset to visually center (font baseline adjustment)
        text.position.set(0, -0.02, 0.003);
        text.renderOrder = 3;
        group.add(text);
        
        group.userData.textMat = textMat;
    }
    
    // Store for animation
    group.userData.windowMat = windowMat;
    group.userData.borderMat = borderMat;
    group.userData.width = width;
    group.userData.height = height;
    group.userData.hoverProgress = 0;
    
    group.position.set(x, y, 0);
    group.visible = false; // Start hidden, transition will show
    
    return group;
}
// Back button is now integrated into omega33Items list
let omega33BackButton = null; // Keep reference for compatibility

// ============================================
// WYZARD33 SECTION - PURPLE TRANSPARENT WINDOWS
// ============================================
const wyzard33Group = new THREE.Group();
scene.add(wyzard33Group);
wyzard33Group.visible = false;

const wyzard33Items = [];
let wyzard33BackButton = null;

function createWyzard33LinkWindow(linkData, index, total, font, isBackButton = false) {
    const group = new THREE.Group();
    group.userData.linkData = linkData;
    group.userData.index = index;
    group.userData.isBackButton = isBackButton;
    
    // Uniform size for all buttons
    const width = 3.0;
    const height = 0.6;
    
    // Single column layout - all buttons stacked vertically
    const spacing = 0.15;
    const x = 0;
    const y = 2.8 - index * (height + spacing);
    
    group.userData.basePosition = new THREE.Vector3(x, y, 0);
    group.userData.baseY = y;
    
    // Window shape
    const shape = new THREE.Shape();
    const cr = 0.05;
    shape.moveTo(-width/2 + cr, -height/2);
    shape.lineTo(width/2 - cr, -height/2);
    shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + cr);
    shape.lineTo(width/2, height/2 - cr);
    shape.quadraticCurveTo(width/2, height/2, width/2 - cr, height/2);
    shape.lineTo(-width/2 + cr, height/2);
    shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - cr);
    shape.lineTo(-width/2, -height/2 + cr);
    shape.quadraticCurveTo(-width/2, -height/2, -width/2 + cr, -height/2);
    
    // Purple window fill
    const windowMat = new THREE.MeshBasicMaterial({
        color: 0xaa44ff,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const windowMesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), windowMat);
    windowMesh.renderOrder = 1;
    group.add(windowMesh);
    
    // Neon border - purple
    const borderPoints = shape.getPoints(30);
    const borderMat = new THREE.LineBasicMaterial({
        color: 0xaa44ff,
        transparent: true,
        opacity: 0.8
    });
    const border = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(borderPoints.map(p => new THREE.Vector3(p.x, p.y, 0.002))),
        borderMat
    );
    border.renderOrder = 2;
    group.add(border);
    
    // Text label
    if (font) {
        const label = isBackButton ? '< HYPSOSIS' : linkData.label;
        const textGeom = new TextGeometry(label, {
            font: font,
            size: 0.14,
            depth: 0.001,
            curveSegments: 6,
            bevelEnabled: false
        });
        // Center the geometry - this properly centers text regardless of characters
        textGeom.center();
        
        const textMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1.0
        });
        const text = new THREE.Mesh(textGeom, textMat);
        text.position.set(0, 0, 0.003);
        text.renderOrder = 3;
        group.add(text);
        
        group.userData.textMat = textMat;
    }
    
    // Store for animation
    group.userData.windowMat = windowMat;
    group.userData.borderMat = borderMat;
    group.userData.width = width;
    group.userData.height = height;
    group.userData.hoverProgress = 0;
    
    group.position.set(x, y, 0);
    group.visible = false;
    
    return group;
}

// ============================================
// MADIDAS33 SECTION - RED/PINK TRANSPARENT WINDOWS
// ============================================
const madidas33Group = new THREE.Group();
scene.add(madidas33Group);
madidas33Group.visible = false;

const madidas33Items = [];
let madidas33BackButton = null;

function createMadidas33LinkWindow(linkData, index, total, font, isBackButton = false) {
    const group = new THREE.Group();
    group.userData.linkData = linkData;
    group.userData.index = index;
    group.userData.isBackButton = isBackButton;
    
    const width = 3.0;
    const height = 0.6;
    
    const spacing = 0.15;
    const x = 0;
    const y = 2.8 - index * (height + spacing);
    
    group.userData.basePosition = new THREE.Vector3(x, y, 0);
    group.userData.baseY = y;
    
    // Window shape
    const shape = new THREE.Shape();
    const cr = 0.05;
    shape.moveTo(-width/2 + cr, -height/2);
    shape.lineTo(width/2 - cr, -height/2);
    shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + cr);
    shape.lineTo(width/2, height/2 - cr);
    shape.quadraticCurveTo(width/2, height/2, width/2 - cr, height/2);
    shape.lineTo(-width/2 + cr, height/2);
    shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - cr);
    shape.lineTo(-width/2, -height/2 + cr);
    shape.quadraticCurveTo(-width/2, -height/2, -width/2 + cr, -height/2);
    
    // Red/pink window fill
    const windowMat = new THREE.MeshBasicMaterial({
        color: 0xff4466,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const windowMesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), windowMat);
    windowMesh.renderOrder = 1;
    group.add(windowMesh);
    
    // Neon border - red/pink
    const borderPoints = shape.getPoints(30);
    const borderMat = new THREE.LineBasicMaterial({
        color: 0xff4466,
        transparent: true,
        opacity: 0.8
    });
    const border = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(borderPoints.map(p => new THREE.Vector3(p.x, p.y, 0.002))),
        borderMat
    );
    border.renderOrder = 2;
    group.add(border);
    
    // Text label
    if (font) {
        const label = isBackButton ? '< HYPSOSIS' : linkData.label;
        const textGeom = new TextGeometry(label, {
            font: font,
            size: 0.14,
            depth: 0.001,
            curveSegments: 6,
            bevelEnabled: false
        });
        // Center the geometry - this properly centers text regardless of characters
        textGeom.center();
        
        const textMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1.0
        });
        const text = new THREE.Mesh(textGeom, textMat);
        text.position.set(0, 0, 0.003);
        text.renderOrder = 3;
        group.add(text);
        
        group.userData.textMat = textMat;
    }
    
    // Store for animation
    group.userData.windowMat = windowMat;
    group.userData.borderMat = borderMat;
    group.userData.width = width;
    group.userData.height = height;
    group.userData.hoverProgress = 0;
    
    group.position.set(x, y, 0);
    group.visible = false;
    
    return group;
}

// ============================================
// LOAD FONT AND CREATE ELEMENTS
// ============================================
new FontLoader().load(import.meta.env.BASE_URL + './assets/fonts/Smooth_Circulars_Regular.json', (font) => {
    omega33Font = font;
    
    // Create main menu
    const total = CONFIG.sections.length;
    CONFIG.sections.forEach((section, index) => {
        const button = createButton(section, index, total, font);
        menuGroup.add(button);
        menuItems.push(button);
    });
    
    // Create omega33 link windows (including back button at the end)
    const allOmega33Items = [...CONFIG.omega33Links, { id: 'back', label: '< BACK', isBack: true }];
    allOmega33Items.forEach((link, index) => {
        const isBack = link.isBack || false;
        const window = createOmega33LinkWindow(link, index, allOmega33Items.length, font, isBack);
        omega33Group.add(window);
        omega33Items.push(window);
        
        if (isBack) {
            omega33BackButton = window;
        }
    });
    
    // Create wyzard33 link windows (including back button at the end)
    const allWyzard33Items = [...CONFIG.wyzard33Links, { id: 'back', label: '< BACK', isBack: true }];
    allWyzard33Items.forEach((link, index) => {
        const isBack = link.isBack || false;
        const window = createWyzard33LinkWindow(link, index, allWyzard33Items.length, font, isBack);
        wyzard33Group.add(window);
        wyzard33Items.push(window);
        
        if (isBack) {
            wyzard33BackButton = window;
        }
    });
    
    // Create madidas33 link windows (including back button at the end)
    const allMadidas33Items = [...CONFIG.madidas33Links, { id: 'back', label: '< BACK', isBack: true }];
    allMadidas33Items.forEach((link, index) => {
        const isBack = link.isBack || false;
        const window = createMadidas33LinkWindow(link, index, allMadidas33Items.length, font, isBack);
        madidas33Group.add(window);
        madidas33Items.push(window);
        
        if (isBack) {
            madidas33BackButton = window;
        }
    });
    
    // Create 3D HYPSOSIS logo text - smaller size to not overlap menu
    const logoTextGeom = new TextGeometry('HYPSOSIS', {
        font: font,
        size: 0.5,
        depth: 0.15,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 5
    });
    logoTextGeom.computeBoundingBox();
    logoTextGeom.center();
    
    // Apply environment map for reflections if available
    if (skyTexture) {
        logoMaterial.envMap = skyTexture;
    }
    
    logoTextMesh = new THREE.Mesh(logoTextGeom, logoMaterial);
    logoGroup.add(logoTextMesh);
    
    // Now that buttons exist, call handleResize to position them correctly
    handleResize();
});

// ============================================
// HTML OVERLAY FOR EMBEDS
// ============================================
function createEmbedOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'embed-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const container = document.createElement('div');
    container.id = 'embed-container';
    container.style.cssText = `
        width: 80%;
        max-width: 800px;
        height: 80%;
        max-height: 600px;
        background: rgba(0, 50, 0, 0.8);
        border: 2px solid #00ff44;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 0 30px rgba(0, 255, 68, 0.3);
        position: relative;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = 'Ã¢Å“â€¢';
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        color: #00ff44;
        font-size: 24px;
        cursor: pointer;
    `;
    closeBtn.onclick = hideEmbedOverlay;
    
    const content = document.createElement('div');
    content.id = 'embed-content';
    content.style.cssText = `
        width: 100%;
        height: calc(100% - 40px);
        margin-top: 30px;
    `;
    
    container.appendChild(closeBtn);
    container.appendChild(content);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    return overlay;
}

const embedOverlay = createEmbedOverlay();

function showEmbedOverlay(type, url, section = 'omega33') {
    const content = document.getElementById('embed-content');
    const container = document.getElementById('embed-container');
    
    // Set colors based on section
    let color, bgColor, shadowColor;
    if (section === 'wyzard33') {
        color = '#aa44ff';
        bgColor = 'rgba(50, 0, 80, 0.8)';
        shadowColor = 'rgba(170, 68, 255, 0.3)';
    } else if (section === 'madidas33') {
        color = '#ff4466';
        bgColor = 'rgba(80, 0, 30, 0.8)';
        shadowColor = 'rgba(255, 68, 102, 0.3)';
    } else {
        color = '#00ff44';
        bgColor = 'rgba(0, 50, 0, 0.8)';
        shadowColor = 'rgba(0, 255, 68, 0.3)';
    }
    
    container.style.background = bgColor;
    container.style.borderColor = color;
    container.style.boxShadow = `0 0 30px ${shadowColor}`;
    
    // Update close button color
    const closeBtn = container.querySelector('button');
    if (closeBtn) closeBtn.style.color = color;
    
    if (type === 'soundcloud') {
        let embedColor;
        if (section === 'wyzard33') embedColor = '%23aa44ff';
        else if (section === 'madidas33') embedColor = '%23ff4466';
        else embedColor = '%2300ff44';
        
        content.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                scrolling="no" 
                frameborder="no" 
                allow="autoplay"
                src="https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=${embedColor}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true"
            ></iframe>
        `;
    } else if (type === 'youtube') {
        // Extract video ID from YouTube URL
        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/watch')) {
            videoId = url.split('v=')[1]?.split('&')[0] || '';
        } else if (url.includes('youtube.com/@')) {
            // Channel URL - show link
            content.innerHTML = `
                <div style="color: ${color}; text-align: center; padding: 20px;">
                    <h2>${section.toUpperCase()} YouTube</h2>
                    <p>Visit channel for videos:</p>
                    <a href="${url}" target="_blank" style="color: ${color}; font-size: 18px;">${url}</a>
                </div>
            `;
            embedOverlay.style.display = 'flex';
            return;
        }
        
        if (videoId) {
            content.innerHTML = `
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=0" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                ></iframe>
            `;
        } else {
            content.innerHTML = `
                <div style="color: ${color}; text-align: center; padding: 20px;">
                    <h2>${section.toUpperCase()} YouTube</h2>
                    <p>Visit for video:</p>
                    <a href="${url}" target="_blank" style="color: ${color}; font-size: 18px;">${url}</a>
                </div>
            `;
        }
    }
    
    embedOverlay.style.display = 'flex';
}

function hideEmbedOverlay() {
    embedOverlay.style.display = 'none';
    document.getElementById('embed-content').innerHTML = '';
}

// ============================================
// INTERACTION
// ============================================
const raycaster = new THREE.Raycaster();
let omega33HoveredIndex = -1;
let wyzard33HoveredIndex = -1;
let madidas33HoveredIndex = -1;

function checkHover() {
    // Only check hover on desktop - touch devices use tap instead
    if (isTouch && !window.matchMedia('(pointer: fine)').matches) return;
    
    raycaster.setFromCamera(new THREE.Vector2(mouse.targetX, mouse.targetY), camera);
    
    if (currentSection === 'main') {
        let newHovered = -1;
        for (let i = 0; i < menuItems.length; i++) {
            const intersects = raycaster.intersectObject(menuItems[i].userData.fill);
            if (intersects.length > 0) {
                newHovered = i;
                break;
            }
        }
        
        if (newHovered !== hoveredIndex) {
            hoveredIndex = newHovered;
            document.body.style.cursor = hoveredIndex >= 0 ? 'pointer' : 'default';
        }
    } else if (currentSection === 'omega33') {
        let newHovered = -1;
        for (let i = 0; i < omega33Items.length; i++) {
            if (!omega33Items[i].visible) continue;
            const meshes = omega33Items[i].children.filter(c => c.type === 'Mesh');
            const intersects = raycaster.intersectObjects(meshes);
            if (intersects.length > 0) {
                newHovered = i;
                break;
            }
        }
        omega33HoveredIndex = newHovered;
        
        document.body.style.cursor = omega33HoveredIndex >= 0 ? 'pointer' : 'default';
    } else if (currentSection === 'wyzard33') {
        let newHovered = -1;
        for (let i = 0; i < wyzard33Items.length; i++) {
            if (!wyzard33Items[i].visible) continue;
            const meshes = wyzard33Items[i].children.filter(c => c.type === 'Mesh');
            const intersects = raycaster.intersectObjects(meshes);
            if (intersects.length > 0) {
                newHovered = i;
                break;
            }
        }
        wyzard33HoveredIndex = newHovered;
        
        document.body.style.cursor = wyzard33HoveredIndex >= 0 ? 'pointer' : 'default';
    } else if (currentSection === 'madidas33') {
        let newHovered = -1;
        for (let i = 0; i < madidas33Items.length; i++) {
            if (!madidas33Items[i].visible) continue;
            const meshes = madidas33Items[i].children.filter(c => c.type === 'Mesh');
            const intersects = raycaster.intersectObjects(meshes);
            if (intersects.length > 0) {
                newHovered = i;
                break;
            }
        }
        madidas33HoveredIndex = newHovered;
        
        document.body.style.cursor = madidas33HoveredIndex >= 0 ? 'pointer' : 'default';
    }
}

function handleClick() {
    // Use a simple cooldown instead of blocking during entire transition
    const now = Date.now();
    if (now - lastClickTime < 300) return; // 300ms cooldown between clicks
    lastClickTime = now;
    
    if (currentSection === 'main' && hoveredIndex >= 0) {
        const section = menuItems[hoveredIndex].userData.section;
        
        if (section.id === 'omega33') {
            transitionToSection('omega33');
        } else if (section.id === 'wyzard33') {
            transitionToSection('wyzard33');
        } else if (section.id === 'madidas33') {
            transitionToSection('madidas33');
        } else if (section.id === 'dev') {
            window.open('https://hypsosis.itch.io/', '_blank');
        } else if (section.id === 'design') {
            window.open('https://www.instagram.com/hypsosis', '_blank');
        }
    } else if (currentSection === 'omega33' && omega33HoveredIndex >= 0) {
        const item = omega33Items[omega33HoveredIndex];
        
        if (item.userData.isBackButton) {
            transitionToSection('main');
        } else {
            const linkData = item.userData.linkData;
            
            if (linkData.embed && (linkData.id === 'soundcloud' || linkData.id.includes('soundcloud'))) {
                showEmbedOverlay('soundcloud', linkData.url, 'omega33');
            } else if (linkData.embed && (linkData.id === 'youtube' || linkData.id.includes('youtube'))) {
                showEmbedOverlay('youtube', linkData.url, 'omega33');
            } else {
                window.open(linkData.url, '_blank');
            }
        }
    } else if (currentSection === 'wyzard33' && wyzard33HoveredIndex >= 0) {
        const item = wyzard33Items[wyzard33HoveredIndex];
        
        if (item.userData.isBackButton) {
            transitionToSection('main');
        } else {
            const linkData = item.userData.linkData;
            
            if (linkData.embed && (linkData.id === 'soundcloud' || linkData.id.includes('soundcloud') || linkData.id === 'murder-bootleg')) {
                showEmbedOverlay('soundcloud', linkData.url, 'wyzard33');
            } else if (linkData.embed && (linkData.id === 'youtube' || linkData.id.includes('youtube'))) {
                showEmbedOverlay('youtube', linkData.url, 'wyzard33');
            } else {
                window.open(linkData.url, '_blank');
            }
        }
    } else if (currentSection === 'madidas33' && madidas33HoveredIndex >= 0) {
        const item = madidas33Items[madidas33HoveredIndex];
        
        if (item.userData.isBackButton) {
            transitionToSection('main');
        } else {
            const linkData = item.userData.linkData;
            
            if (linkData.embed && (linkData.id === 'soundcloud' || linkData.id.includes('soundcloud') || linkData.id === 'drop-da-baes')) {
                showEmbedOverlay('soundcloud', linkData.url, 'madidas33');
            } else if (linkData.embed && (linkData.id === 'youtube' || linkData.id.includes('youtube'))) {
                showEmbedOverlay('youtube', linkData.url, 'madidas33');
            } else {
                window.open(linkData.url, '_blank');
            }
        }
    }
}

let lastClickTime = 0;

// Desktop click only - touch is handled by onTouchEnd/handleTouchTap
window.addEventListener('click', (event) => {
    // Skip if this was triggered by touch
    if (event.sourceCapabilities?.firesTouchEvents) return;
    handleClick();
});

// ============================================
// SECTION TRANSITIONS
// ============================================
function transitionToSection(sectionId) {
    // Prevent transition to same section
    if (sectionId === currentSection) return;
    
    // Prevent rapid toggling
    if (isTransitioning && Math.abs(transitionProgress - targetTransition) > 0.3) return;
    
    isTransitioning = true;
    
    // Hide all section groups first
    omega33Group.visible = false;
    wyzard33Group.visible = false;
    madidas33Group.visible = false;
    xorShaderGroup.visible = false;
    wyzardShaderGroup.visible = false;
    madidasShaderGroup.visible = false;
    
    if (sectionId === 'omega33') {
        currentSection = 'omega33';
        targetTransition = 1;
        
        omega33Group.visible = true;
        xorShaderGroup.visible = true;
        
        omega33Items.forEach(item => {
            item.visible = false;
            item.scale.setScalar(1);
        });
        
        window.history.pushState({}, '', '#omega33');
        
        const green = CONFIG.sectionColors.omega33;
        mainLight.color.copy(green);
        
    } else if (sectionId === 'wyzard33') {
        currentSection = 'wyzard33';
        targetTransition = 1;
        
        wyzard33Group.visible = true;
        wyzardShaderGroup.visible = true;
        
        wyzard33Items.forEach(item => {
            item.visible = false;
            item.scale.setScalar(1);
        });
        
        window.history.pushState({}, '', '#wyzard33');
        
        const purple = CONFIG.sectionColors.wyzard33;
        mainLight.color.copy(purple);
        
    } else if (sectionId === 'madidas33') {
        currentSection = 'madidas33';
        targetTransition = 1;
        
        madidas33Group.visible = true;
        madidasShaderGroup.visible = true;
        
        madidas33Items.forEach(item => {
            item.visible = false;
            item.scale.setScalar(1);
        });
        
        window.history.pushState({}, '', '#madidas33');
        
        const red = CONFIG.sectionColors.madidas33;
        mainLight.color.copy(red);
        
    } else if (sectionId === 'main') {
        currentSection = 'main';
        targetTransition = 0;
        
        window.history.pushState({}, '', '/');
        
        const blue = CONFIG.sectionColors.dev;
        mainLight.color.copy(blue);
        
        if (skyTexture) {
            scene.background = skyTexture;
        }
        
        logoGroup.visible = true;
        menuGroup.visible = true;
    }
}

// ============================================
// ANIMATION
// ============================================
function lerp(a, b, t) { return a + (b - a) * t; }

function updateTransition(time) {
    // Smooth transition - faster speed
    transitionProgress = lerp(transitionProgress, targetTransition, 0.08);
    
    // Check if transition complete - use larger threshold for faster completion
    if (Math.abs(transitionProgress - targetTransition) < 0.01) {
        transitionProgress = targetTransition;
        isTransitioning = false;
        
        if (targetTransition === 0) {
            omega33Group.visible = false;
            wyzard33Group.visible = false;
            madidas33Group.visible = false;
            xorShaderGroup.visible = false;
            wyzardShaderGroup.visible = false;
            madidasShaderGroup.visible = false;
            // Restore sky background
            if (skyTexture) {
                scene.background = skyTexture;
            }
            // Restore menu text opacity
            menuGroup.children.forEach(button => {
                button.traverse(child => {
                    if (child.material && child.userData && child.userData.originalOpacity !== undefined) {
                        child.material.opacity = child.userData.originalOpacity;
                    }
                });
            });
        } else if (targetTransition === 1) {
            scene.background = new THREE.Color(0x000000);
        }
    }
    
    // Camera zoom effect
    const baseZ = 14;
    const zoomedZ = 10;
    camera.position.z = lerp(baseZ, zoomedZ, transitionProgress);
    
    // Main menu - store original opacity and fade
    if (transitionProgress > 0 && transitionProgress < 1) {
        menuGroup.children.forEach(button => {
            button.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                    if (child.userData.originalOpacity === undefined) {
                        child.userData.originalOpacity = child.material.opacity;
                    }
                    child.material.opacity = child.userData.originalOpacity * (1 - transitionProgress);
                }
            });
        });
    }
    menuGroup.position.z = -transitionProgress * 10;
    menuGroup.visible = transitionProgress < 0.95;
    
    // Completely hide logo when in a section
    logoGroup.visible = transitionProgress < 0.8;
    if (transitionProgress < 0.8) {
        const logoScale = lerp(1, 0.2, transitionProgress / 0.8);
        logoGroup.scale.setScalar(logoScale);
    }
    
    // Update shader opacities based on current section
    if (currentSection === 'omega33') {
        xorShaderMaterial.uniforms.opacity.value = transitionProgress;
        xorShaderMaterial.uniforms.time.value = time;
        wyzardShaderMaterial.uniforms.opacity.value = 0;
        madidasShaderMaterial.uniforms.opacity.value = 0;
    } else if (currentSection === 'wyzard33') {
        wyzardShaderMaterial.uniforms.opacity.value = transitionProgress;
        wyzardShaderMaterial.uniforms.time.value = time;
        xorShaderMaterial.uniforms.opacity.value = 0;
        madidasShaderMaterial.uniforms.opacity.value = 0;
    } else if (currentSection === 'madidas33') {
        madidasShaderMaterial.uniforms.opacity.value = transitionProgress;
        madidasShaderMaterial.uniforms.time.value = time;
        xorShaderMaterial.uniforms.opacity.value = 0;
        wyzardShaderMaterial.uniforms.opacity.value = 0;
    } else {
        xorShaderMaterial.uniforms.opacity.value = 0;
        wyzardShaderMaterial.uniforms.opacity.value = 0;
        madidasShaderMaterial.uniforms.opacity.value = 0;
    }
    
    // Fade sky background to black during transition
    // Keep exposure higher so text colors stay vibrant
    if (transitionProgress > 0) {
        renderer.toneMappingExposure = lerp(0.7, 0.5, transitionProgress);
    }
    
    // Omega33 items animation
    if (currentSection === 'omega33') {
        omega33Items.forEach((item, i) => {
            const delay = i * 0.05;
            const itemProgress = Math.max(0, Math.min(1, (transitionProgress - 0.3 - delay) * 3));
            
            item.visible = itemProgress > 0.01;
            
            if (isTransitioning) {
                const scale = lerp(0.5, 1, itemProgress);
                item.scale.setScalar(scale);
                
                item.position.x = item.userData.basePosition.x;
                item.position.y = item.userData.basePosition.y + (1 - itemProgress) * 0.5;
                item.position.z = 0;
                
                if (item.userData.windowMat) {
                    item.userData.windowMat.opacity = 0.15 * itemProgress;
                }
                if (item.userData.borderMat) {
                    item.userData.borderMat.opacity = 0.8 * itemProgress;
                }
            }
        });
    }
    
    // Wyzard33 items animation
    if (currentSection === 'wyzard33') {
        wyzard33Items.forEach((item, i) => {
            const delay = i * 0.05;
            const itemProgress = Math.max(0, Math.min(1, (transitionProgress - 0.3 - delay) * 3));
            
            item.visible = itemProgress > 0.01;
            
            if (isTransitioning) {
                const scale = lerp(0.5, 1, itemProgress);
                item.scale.setScalar(scale);
                
                item.position.x = item.userData.basePosition.x;
                item.position.y = item.userData.basePosition.y + (1 - itemProgress) * 0.5;
                item.position.z = 0;
                
                if (item.userData.windowMat) {
                    item.userData.windowMat.opacity = 0.15 * itemProgress;
                }
                if (item.userData.borderMat) {
                    item.userData.borderMat.opacity = 0.8 * itemProgress;
                }
                // Keep text WHITE during transition
                if (item.userData.textMat) {
                    item.userData.textMat.color.setRGB(1, 1, 1);
                    item.userData.textMat.opacity = 1.0;
                }
            }
        });
    }
    
    // Madidas33 items animation
    if (currentSection === 'madidas33') {
        madidas33Items.forEach((item, i) => {
            const delay = i * 0.05;
            const itemProgress = Math.max(0, Math.min(1, (transitionProgress - 0.3 - delay) * 3));
            
            item.visible = itemProgress > 0.01;
            
            if (isTransitioning) {
                const scale = lerp(0.5, 1, itemProgress);
                item.scale.setScalar(scale);
                
                item.position.x = item.userData.basePosition.x;
                item.position.y = item.userData.basePosition.y + (1 - itemProgress) * 0.5;
                item.position.z = 0;
                
                if (item.userData.windowMat) {
                    item.userData.windowMat.opacity = 0.15 * itemProgress;
                }
                if (item.userData.borderMat) {
                    item.userData.borderMat.opacity = 0.8 * itemProgress;
                }
                // Keep text WHITE during transition
                if (item.userData.textMat) {
                    item.userData.textMat.color.setRGB(1, 1, 1);
                    item.userData.textMat.opacity = 1.0;
                }
            }
        });
    }
    
    // Flares/aurora fade
    flareGroup.visible = transitionProgress < 0.3;
    auroraGroup.visible = transitionProgress < 0.3;
    particleGroup.visible = transitionProgress < 0.3;
}

function updateMenu(time) {
    if (currentSection !== 'main') return;
    
    const spacing = 0.4;
    
    menuItems.forEach((button, index) => {
        const data = button.userData;
        const isHovered = index === hoveredIndex;
        const isSelected = index === selectedIndex;
        
        // Handle tap animation (for touch devices)
        if (data.tapAnimation !== undefined && data.tapAnimation > 0) {
            data.tapAnimation = lerp(data.tapAnimation, 0, 0.15);
            if (data.tapAnimation < 0.01) data.tapAnimation = 0;
        }
        const tapIntensity = data.tapAnimation || 0;
        
        const targetHover = isHovered ? 1 : 0;
        data.hoverProgress = lerp(data.hoverProgress, targetHover, 0.15);
        
        // Combine hover and tap for intensity
        const intensity = Math.max(data.hoverProgress, tapIntensity, isSelected ? 0.4 : 0);
        
        // Scale includes both hover and tap
        const scale = 1 + Math.max(data.hoverProgress, tapIntensity) * 0.18;
        button.scale.setScalar(scale);
        
        let yOffset = 0;
        if (hoveredIndex !== -1 && index !== hoveredIndex) {
            const hoveredProgress = menuItems[hoveredIndex].userData.hoverProgress;
            if (index < hoveredIndex) {
                yOffset = spacing * hoveredProgress;
            } else {
                yOffset = -spacing * hoveredProgress;
            }
        }
        
        const basePos = data.basePosition;
        button.position.x = basePos.x;
        button.position.y = lerp(button.position.y, basePos.y + yOffset, 0.12);
        button.position.z = 0;
        
        if (data.iridescentMat) {
            data.iridescentMat.uniforms.time.value = time;
            data.iridescentMat.uniforms.opacity.value = 0.04 + intensity * 0.08;
        }
        
        data.fillMat.opacity = 0.03 + intensity * 0.06;
        data.backingMat.opacity = 0.15 + intensity * 0.1;
        data.borderMat.opacity = 0.3 + intensity * 0.3;
        data.highlightMat.opacity = 0.25 + intensity * 0.3;
        data.glowMat.opacity = intensity * 0.15;
        data.connector.material.opacity = 0.15 + intensity * 0.35;
        
        data.discRing.material.opacity = 0.6 + intensity * 0.35;
        data.discInner.material.opacity = 0.2 + intensity * 0.3;
        data.discGlowMesh.material.opacity = 0.08 + intensity * 0.25;
        data.discGroup.rotation.z += isHovered ? 0.04 : 0.004;
        
        const discScale = 1 + Math.max(data.hoverProgress, tapIntensity) * 0.25;
        data.discGroup.scale.setScalar(discScale);
        
        // Restore text opacity when back in main
        if (data.textMat) {
            data.textMat.opacity = 1.0;
        }
        if (data.shadowMat) {
            data.shadowMat.opacity = 0.6;
        }
    });
}

function updateOmega33(time) {
    if (currentSection !== 'omega33') return;
    // Allow hover effects when transition is mostly complete (>0.8) instead of waiting for 100%
    if (isTransitioning && transitionProgress < 0.8) return;
    
    const spacing = 0.35; // How much to push other buttons
    
    omega33Items.forEach((item, index) => {
        const data = item.userData;
        const isHovered = index === omega33HoveredIndex;
        
        // Handle tap animation (for touch devices)
        if (data.tapAnimation !== undefined && data.tapAnimation > 0) {
            data.tapAnimation = lerp(data.tapAnimation, 0, 0.15);
            if (data.tapAnimation < 0.01) data.tapAnimation = 0;
        }
        const tapIntensity = data.tapAnimation || 0;
        
        const targetHover = isHovered ? 1 : 0;
        data.hoverProgress = lerp(data.hoverProgress || 0, targetHover, 0.15);
        
        const intensity = Math.max(data.hoverProgress, tapIntensity);
        
        // Scale on hover/tap (like main menu)
        const scale = 1 + intensity * 0.15;
        item.scale.setScalar(scale);
        
        // Push other buttons away (like main menu)
        let yOffset = 0;
        if (omega33HoveredIndex !== -1 && index !== omega33HoveredIndex) {
            const hoveredProgress = omega33Items[omega33HoveredIndex].userData.hoverProgress || 0;
            if (index < omega33HoveredIndex) {
                yOffset = spacing * hoveredProgress;
            } else {
                yOffset = -spacing * hoveredProgress;
            }
        }
        
        // Update position with offset
        const basePos = data.basePosition;
        item.position.x = basePos.x;
        item.position.y = lerp(item.position.y, basePos.y + yOffset, 0.12);
        item.position.z = 0;
        
        // Update materials based on hover/tap
        // Button fill: transparent -> more opaque green on hover
        if (data.windowMat) {
            data.windowMat.opacity = 0.05 + intensity * 0.35;
        }
        
        // Border: stays bright green
        if (data.borderMat) {
            data.borderMat.opacity = 0.6 + intensity * 0.4;
        }
        
        // Text fill: always BLACK for visibility
        if (data.textMat) {
            data.textMat.color.setRGB(0, 0, 0);
            data.textMat.opacity = 1.0;
        }
    });
}

function updateWyzard33(time) {
    if (currentSection !== 'wyzard33') return;
    if (isTransitioning && transitionProgress < 0.8) return;
    
    const spacing = 0.35;
    
    wyzard33Items.forEach((item, index) => {
        const data = item.userData;
        const isHovered = index === wyzard33HoveredIndex;
        
        // Handle tap animation (for touch devices)
        if (data.tapAnimation !== undefined && data.tapAnimation > 0) {
            data.tapAnimation = lerp(data.tapAnimation, 0, 0.15);
            if (data.tapAnimation < 0.01) data.tapAnimation = 0;
        }
        const tapIntensity = data.tapAnimation || 0;
        
        const targetHover = isHovered ? 1 : 0;
        data.hoverProgress = lerp(data.hoverProgress || 0, targetHover, 0.15);
        
        const intensity = Math.max(data.hoverProgress, tapIntensity);
        
        // Scale on hover/tap
        const scale = 1 + intensity * 0.15;
        item.scale.setScalar(scale);
        
        // Push other buttons away
        let yOffset = 0;
        if (wyzard33HoveredIndex !== -1 && index !== wyzard33HoveredIndex) {
            const hoveredProgress = wyzard33Items[wyzard33HoveredIndex].userData.hoverProgress || 0;
            if (index < wyzard33HoveredIndex) {
                yOffset = spacing * hoveredProgress;
            } else {
                yOffset = -spacing * hoveredProgress;
            }
        }
        
        // Update position with offset
        const basePos = data.basePosition;
        item.position.x = basePos.x;
        item.position.y = lerp(item.position.y, basePos.y + yOffset, 0.12);
        item.position.z = 0;
        
        // Update materials based on hover/tap
        // Button fill: transparent -> more opaque purple on hover
        if (data.windowMat) {
            data.windowMat.opacity = 0.05 + intensity * 0.35;
        }
        
        // Border: stays bright purple
        if (data.borderMat) {
            data.borderMat.opacity = 0.6 + intensity * 0.4;
        }
        
        // Text: always WHITE for visibility
        if (data.textMat) {
            data.textMat.color.setRGB(1, 1, 1);
            data.textMat.opacity = 1.0;
        }
    });
}

function updateMadidas33(time) {
    if (currentSection !== 'madidas33') return;
    if (isTransitioning && transitionProgress < 0.8) return;
    
    const spacing = 0.35;
    
    madidas33Items.forEach((item, index) => {
        const data = item.userData;
        const isHovered = index === madidas33HoveredIndex;
        
        // Handle tap animation (for touch devices)
        if (data.tapAnimation !== undefined && data.tapAnimation > 0) {
            data.tapAnimation = lerp(data.tapAnimation, 0, 0.15);
            if (data.tapAnimation < 0.01) data.tapAnimation = 0;
        }
        const tapIntensity = data.tapAnimation || 0;
        
        const targetHover = isHovered ? 1 : 0;
        data.hoverProgress = lerp(data.hoverProgress || 0, targetHover, 0.15);
        
        const intensity = Math.max(data.hoverProgress, tapIntensity);
        
        // Scale on hover/tap
        const scale = 1 + intensity * 0.15;
        item.scale.setScalar(scale);
        
        // Push other buttons away
        let yOffset = 0;
        if (madidas33HoveredIndex !== -1 && index !== madidas33HoveredIndex) {
            const hoveredProgress = madidas33Items[madidas33HoveredIndex].userData.hoverProgress || 0;
            if (index < madidas33HoveredIndex) {
                yOffset = spacing * hoveredProgress;
            } else {
                yOffset = -spacing * hoveredProgress;
            }
        }
        
        // Update position with offset
        const basePos = data.basePosition;
        item.position.x = basePos.x;
        item.position.y = lerp(item.position.y, basePos.y + yOffset, 0.12);
        item.position.z = 0;
        
        // Update materials based on hover/tap
        // Button fill: transparent -> more opaque red on hover
        if (data.windowMat) {
            data.windowMat.opacity = 0.05 + intensity * 0.35;
        }
        
        // Border: stays bright red
        if (data.borderMat) {
            data.borderMat.opacity = 0.6 + intensity * 0.4;
        }
        
        // Text: always WHITE for visibility
        if (data.textMat) {
            data.textMat.color.setRGB(1, 1, 1);
            data.textMat.opacity = 1.0;
        }
    });
}

function updateLogo(time) {
    // Get base positions (set by handleResize for mobile layout)
    const baseX = logoGroup.userData.baseX !== undefined ? logoGroup.userData.baseX : -2;
    const baseY = logoGroup.userData.baseY !== undefined ? logoGroup.userData.baseY : 0;
    
    // Gentle floating motion around base position
    logoGroup.position.x = lerp(logoGroup.position.x, baseX + Math.sin(time * 0.25) * 0.1, 0.02);
    logoGroup.position.y = lerp(logoGroup.position.y, baseY + Math.sin(time * 0.35) * 0.15, 0.02);
    logoGroup.position.z = Math.sin(time * 0.2) * 0.1;
    
    // Rotation control - different for desktop vs touch
    if (touch.isDragging) {
        // Touch drag - use accumulated rotation from drag
        logoGroup.rotation.y = lerp(logoGroup.rotation.y, touch.logoRotationY, 0.15);
        logoGroup.rotation.x = lerp(logoGroup.rotation.x, touch.logoRotationX, 0.15);
    } else if (isTouch && !window.matchMedia('(pointer: fine)').matches) {
        // Touch device but not dragging - slowly return to neutral with gentle idle motion
        const idleRotY = Math.sin(time * 0.3) * 0.1;
        const idleRotX = Math.sin(time * 0.2) * 0.05;
        logoGroup.rotation.y = lerp(logoGroup.rotation.y, idleRotY, 0.02);
        logoGroup.rotation.x = lerp(logoGroup.rotation.x, idleRotX, 0.02);
        
        // Decay the stored touch rotation
        touch.logoRotationY = lerp(touch.logoRotationY, 0, 0.02);
        touch.logoRotationX = lerp(touch.logoRotationX, 0, 0.02);
    } else {
        // Desktop - follow mouse
        const targetRotY = mouse.x * 0.5;
        const targetRotX = -mouse.y * 0.3;
        logoGroup.rotation.y = lerp(logoGroup.rotation.y, targetRotY, 0.08);
        logoGroup.rotation.x = lerp(logoGroup.rotation.x, targetRotX, 0.08);
    }
    
    // Subtle additional animation on the mesh itself
    if (logoTextMesh) {
        logoTextMesh.rotation.z = Math.sin(time * 0.4) * 0.02;
    }
}

function updateParticles(time) {
    particles.forEach(p => {
        const d = p.userData;
        p.position.x = d.basePos.x + Math.sin(time * d.orbitSpeed + d.phase) * d.orbitRadius;
        p.position.y = d.basePos.y + Math.cos(time * d.orbitSpeed * 0.7 + d.phase) * d.orbitRadius * 0.6;
        p.position.z = d.basePos.z + Math.sin(time * d.orbitSpeed * 0.5 + d.phase * 2) * 0.5;
        
        p.lookAt(camera.position);
        
        const pulse = 0.8 + Math.sin(time * d.speed + d.phase) * 0.2;
        p.material.uniforms.opacity.value = (0.015 + Math.random() * 0.005) * pulse;
    });
}

function updateFlares(time) {
    const pulse = 0.8 + Math.sin(time * 1.5) * 0.2;
    mainFlare.scale.setScalar(pulse);
    mainFlareMat.uniforms.opacity.value = 0.08 * pulse;
    
    secondaryFlares.forEach(f => {
        const flicker = 0.7 + Math.sin(time * 2 + f.userData.t * 10) * 0.3;
        f.material.uniforms.opacity.value = f.userData.baseOpacity * flicker;
        f.rotation.z = time * 0.1;
    });
}

function updateAurora(time) {
    auroraRibbons.forEach((ribbon, i) => {
        ribbon.material.uniforms.time.value = time + ribbon.userData.phaseOffset;
        ribbon.position.x = Math.sin(time * 0.1 + i) * 0.5;
    });
}

function updateParallax() {
    mouse.x = lerp(mouse.x, mouse.targetX, 0.05);
    mouse.y = lerp(mouse.y, mouse.targetY, 0.05);
    
    if (currentSection === 'main') {
        camera.position.x = mouse.x * 0.25;
        camera.position.y = mouse.y * 0.15;
    }
    camera.lookAt(0, 0, 0);
}

function updateBackground() {
    bgRotation += 0.00015;
    if (scene.backgroundRotation) {
        scene.backgroundRotation.y = bgRotation;
    }
}

// ============================================
// RESIZE
// ============================================

// Helper to get section button layout based on screen
function getSectionLayout(itemCount) {
    const { isLandscape, isSmallPhone, isMediumPhone, isMobile } = screenInfo;
    
    let spacing, height;
    
    if (isSmallPhone && !isLandscape) {
        // Small phone portrait - compact spacing
        spacing = 0.10;
        height = 0.55;
    } else if (isSmallPhone && isLandscape) {
        // Small phone landscape - very compact
        spacing = 0.08;
        height = 0.45;
    } else if (isMediumPhone && !isLandscape) {
        // Medium phone portrait
        spacing = 0.12;
        height = 0.58;
    } else if (isMediumPhone && isLandscape) {
        // Medium phone landscape
        spacing = 0.10;
        height = 0.50;
    } else if (isMobile) {
        // Tablet
        spacing = 0.14;
        height = 0.60;
    } else {
        // Desktop
        spacing = 0.15;
        height = 0.6;
    }
    
    // Calculate total height of all buttons
    const totalHeight = itemCount * height + (itemCount - 1) * spacing;
    
    // Calculate startY to center the buttons vertically (center = 0)
    const startY = totalHeight / 2 - height / 2;
    
    return { startY, spacing, height };
}

function updateOmega33Layout() {
    const layout = getSectionLayout(omega33Items.length);
    
    omega33Items.forEach((item, index) => {
        const x = 0;
        const y = layout.startY - index * (layout.height + layout.spacing);
        
        item.userData.basePosition.set(x, y, 0);
        item.userData.baseY = y;
        
        if (currentSection === 'omega33' && !isTransitioning) {
            item.position.x = x;
            item.position.y = y;
        }
    });
}

function updateWyzard33Layout() {
    const layout = getSectionLayout(wyzard33Items.length);
    
    wyzard33Items.forEach((item, index) => {
        const x = 0;
        const y = layout.startY - index * (layout.height + layout.spacing);
        
        item.userData.basePosition.set(x, y, 0);
        item.userData.baseY = y;
        
        if (currentSection === 'wyzard33' && !isTransitioning) {
            item.position.x = x;
            item.position.y = y;
        }
    });
}

function updateMadidas33Layout() {
    const layout = getSectionLayout(madidas33Items.length);
    
    madidas33Items.forEach((item, index) => {
        const x = 0;
        const y = layout.startY - index * (layout.height + layout.spacing);
        
        item.userData.basePosition.set(x, y, 0);
        item.userData.baseY = y;
        
        if (currentSection === 'madidas33' && !isTransitioning) {
            item.position.x = x;
            item.position.y = y;
        }
    });
}

function handleResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    
    // Update screen info
    screenInfo = getScreenInfo();
    
    camera.aspect = sizes.width / sizes.height;
    
    renderer.setSize(sizes.width, sizes.height);
    composer.setSize(sizes.width, sizes.height);
    
    xorShaderMaterial.uniforms.resolution.value.set(sizes.width, sizes.height);
    wyzardShaderMaterial.uniforms.resolution.value.set(sizes.width, sizes.height);
    madidasShaderMaterial.uniforms.resolution.value.set(sizes.width, sizes.height);
    
    const { isLandscape, isSmallPhone, isMediumPhone, isTablet, isMobile } = screenInfo;
    const aspectRatio = sizes.width / sizes.height;
    
    // Calculate responsive values based on screen size and orientation
    let fov, cameraZ, logoScale, menuScale, sectionScale, logoX, logoY, menuX, menuY;
    
    if (isMobile && !isLandscape) {
        // PORTRAIT MODE - Dynamic scaling based on actual width
        // Tested for: S8+ (360px), S20 Ultra (412px), Z Fold (344px), Pixel 7 (412px)
        
        fov = 50;
        
        // Calculate scale factor - normalize around 380px as baseline
        const baseWidth = 380;
        const widthRatio = sizes.width / baseWidth;
        
        // Camera distance - bring MUCH closer for bigger appearance
        cameraZ = 9;
        
        // Logo scale - bigger
        logoScale = 0.9;
        
        // Menu scale: LARGER for all mobile portrait
        menuScale = 1.1;
        
        sectionScale = 1.0;
        logoX = 0;
        logoY = 3.0;
        menuX = 0;
        menuY = -0.8;
        
    } else if (isSmallPhone && isLandscape) {
        // Small phone landscape - EVEN LARGER
        fov = 35;
        cameraZ = 6;
        logoScale = 1.2;
        menuScale = 1.3;
        sectionScale = 1.1;
        logoX = -2.0;
        logoY = 0;
        menuX = 0.5;
        menuY = 0;
    } else if (isMediumPhone && isLandscape) {
        // Medium phone landscape - EVEN LARGER
        fov = 35;
        cameraZ = 6.5;
        logoScale = 1.25;
        menuScale = 1.35;
        sectionScale = 1.15;
        logoX = -2.0;
        logoY = 0;
        menuX = 0.4;
        menuY = 0;
    } else if (isTablet) {
        if (isLandscape) {
            // Tablet landscape - side by side
            fov = 50;
            cameraZ = 14;
            logoScale = 0.9;
            menuScale = 0.95;
            sectionScale = 0.95;
            logoX = -2;
            logoY = 0;
            menuX = 0;
            menuY = 0;
        } else {
            // Tablet portrait - logo above
            fov = 50;
            cameraZ = 13;
            logoScale = 0.85;
            menuScale = 0.95;
            sectionScale = 0.95;
            logoX = 0;
            logoY = 3.4;
            menuX = 0;
            menuY = -0.5;
        }
    } else {
        // Desktop - original side by side layout
        fov = 50;
        cameraZ = 14;
        logoScale = 1;
        menuScale = 1;
        sectionScale = 1;
        logoX = -2;
        logoY = 0;
        menuX = 0;
        menuY = 0;
    }
    
    camera.fov = fov;
    camera.position.z = cameraZ;
    camera.updateProjectionMatrix();
    
    // Update logo position and scale
    logoGroup.scale.setScalar(logoScale);
    logoGroup.userData.baseX = logoX;
    logoGroup.userData.baseY = logoY;
    
    // Update menu position and scale
    menuGroup.scale.setScalar(menuScale);
    menuGroup.position.x = menuX;
    menuGroup.position.y = menuY;
    
    // Update section groups
    omega33Group.scale.setScalar(sectionScale);
    wyzard33Group.scale.setScalar(sectionScale);
    madidas33Group.scale.setScalar(sectionScale);
    
    particleGroup.scale.setScalar(Math.min(1, menuScale));
    flareGroup.scale.setScalar(Math.min(1, menuScale));
    
    // Update section layouts
    updateOmega33Layout();
    updateWyzard33Layout();
    updateMadidas33Layout();
    
    // Update menu button positions for mobile
    updateMenuLayout();
}

// Update menu layout for responsive positioning
function updateMenuLayout() {
    if (menuItems.length === 0) return;
    
    const { isLandscape, isSmallPhone, isMediumPhone, isTablet, isMobile } = screenInfo;
    const total = menuItems.length;
    
    // Arc config - use original proven values
    let radius, startAngle, endAngle, xOffset;
    
    if (isMobile && !isLandscape) {
        // PORTRAIT MODE - use original arc angles that worked
        radius = 3.2;
        startAngle = Math.PI * 0.22;
        endAngle = Math.PI * -0.22;
        
        // X offset to shift left for centering
        // Narrower screens (like S8+ 360px) need MORE left shift
        const baseWidth = 380;
        const widthRatio = sizes.width / baseWidth;
        // More aggressive left shift, especially for narrow screens
        const rawOffset = -2.1 + (widthRatio - 1) * 0.3;
        xOffset = Math.max(-2.3, Math.min(-1.9, rawOffset));
    } else if (isTablet && !isLandscape) {
        // Tablet portrait
        radius = 3.2;
        startAngle = Math.PI * 0.22;
        endAngle = Math.PI * -0.22;
        xOffset = -0.5;
    } else if (isMobile && isLandscape) {
        // Mobile landscape
        radius = 3.0;
        startAngle = Math.PI * 0.20;
        endAngle = Math.PI * -0.20;
        xOffset = 0;
    } else {
        // Desktop/tablet landscape - original config
        radius = 3.2;
        startAngle = Math.PI * 0.22;
        endAngle = Math.PI * -0.22;
        xOffset = 0;
    }
    
    menuItems.forEach((button, index) => {
        const angleSpan = startAngle - endAngle;
        const angle = startAngle - (index / (total - 1)) * angleSpan;
        const x = Math.cos(angle) * radius + xOffset;
        const y = Math.sin(angle) * radius;
        
        button.userData.basePosition.set(x, y, 0);
        button.userData.baseY = y;
        button.userData.angle = angle;
        
        button.position.x = x;
        button.position.y = y;
    });
}

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100);
});
handleResize();

// ============================================
// MAIN LOOP
// ============================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    updateBackground();
    updateParallax();
    updateTransition(time);
    updateLogo(time);
    updateParticles(time);
    updateFlares(time);
    updateAurora(time);
    checkHover();
    updateMenu(time);
    updateOmega33(time);
    updateWyzard33(time);
    updateMadidas33(time);
    
    composer.render();
}

animate();

// ============================================
// CLEAN URL + HASH ROUTING (GitHub Pages compatible)
// ============================================

const CLEAN_TO_HASH = {
  '/omega33':   '#omega33',
  '/wyzard33':  '#wyzard33',
  '/madidas33': '#madidas33'
};

// Go to a section with CLEAN URL in address bar
function goToSection(section) {
  const cleanPath = '/' + section;           // e.g. "/madidas33"
  const hash = '#' + section;                // e.g. "#madidas33"

  // Show clean URL in browser
  history.pushState(null, '', cleanPath);
  
  // Force the hash so your existing logic works
  window.location.hash = hash;
}

// Replace your old button click handlers with these (or call goToSection directly)
document.querySelector('#omega33-btn')?.addEventListener('click', () => goToSection('omega33'));
document.querySelector('#wyzard33-btn')?.addEventListener('click', () => goToSection('wyzard33'));
document.querySelector('#madidas33-btn')?.addEventListener('click', () => goToSection('madidas33'));

// Handle direct clean URL access (e.g. user pasted /madidas33)
(function handleDirectCleanUrl() {
  const path = window.location.pathname.toLowerCase();
  const targetHash = CLEAN_TO_HASH[path];

  if (targetHash) {
    // Keep clean URL visible, but force the hash
    history.replaceState(null, '', path);
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  }
})();

// Run route check on EVERY page load (direct clean URL, refresh, etc.)
function runRouteCheck() {
  const hash = window.location.hash.slice(1);

  if (hash === 'omega33' && currentSection !== 'omega33') {
    setTimeout(() => transitionToSection('omega33'), 500);
  } else if (hash === 'wyzard33' && currentSection !== 'wyzard33') {
    setTimeout(() => transitionToSection('wyzard33'), 500);
  } else if (hash === 'madidas33' && currentSection !== 'madidas33') {
    setTimeout(() => transitionToSection('madidas33'), 500);
  } else if (!hash && currentSection !== 'main') {
    transitionToSection('main');
  } else {
    const idx = CONFIG.sections.findIndex(s => s.id === hash);
    if (idx >= 0) {
      selectedIndex = idx;
      const color = CONFIG.sectionColors[hash];
      if (color) {
        CONFIG.currentColor.copy(color);
        mainLight.color.copy(color);
      }
    }
  }
}

// Run immediately + on every load/refresh
runRouteCheck();
window.addEventListener('DOMContentLoaded', runRouteCheck);
window.addEventListener('load', runRouteCheck);

// Keep listening for normal navigation too
window.addEventListener('hashchange', runRouteCheck);

console.log('Hypsosis Hub v10 - Mobile responsive: centered layout for portrait, proper scaling for all screen sizes');