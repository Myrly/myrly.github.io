import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Get the canvas element and create renderer
const canvas = document.getElementById('threejs-canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000011, 1); // Dark space background

// Set up camera position
camera.position.set(-0.41, 4.99, 10.69);

// Add orbit controls for mouse interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movements
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enableRotate = true;
controls.enablePan = true;
controls.minDistance = 5; // Minimum zoom distance
controls.maxDistance = 200; // Maximum zoom distance
controls.maxPolarAngle = Math.PI; // Allow full vertical rotation

// Set the target and update controls
controls.target.set(0, 0, 0);
controls.update();

// Add galaxy
function createGalaxy() {
    const galaxyGroup = new THREE.Group();
    
    // Galaxy parameters
    const parameters = {
        count: 50000,
        size: 0.01,
        radius: 20,
        branches: 4,
        spin: 1,
        randomness: 0.2,
        randomnessPower: 3,
        insideColor: '#ff6030',
        outsideColor: '#1b3984'
    };
    
    // Create geometry and material
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    
    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);
    
    // Generate galaxy particles
    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        
        // Position
        const radius = Math.random() * parameters.radius;
        
        // Make center more dense by using power distribution
        const densityRadius = Math.pow(Math.random(), 0.3) * parameters.radius;
        const finalRadius = Math.min(radius, densityRadius);
        
        const spinAngle = finalRadius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
        
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * finalRadius;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * finalRadius;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * finalRadius;
        
        positions[i3] = Math.cos(branchAngle + spinAngle) * finalRadius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * finalRadius + randomZ;
        
        // Color
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, finalRadius / parameters.radius);
        
        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Material
    const material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });
    
    // Points
    const points = new THREE.Points(geometry, material);
    galaxyGroup.add(points);
    
    // Add some nebula clouds
    const cloudGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0x4444ff,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
    });
    
    for (let i = 0; i < 20; i++) {
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.x = (Math.random() - 0.5) * 40;
        cloud.position.y = (Math.random() - 0.5) * 10;
        cloud.position.z = (Math.random() - 0.5) * 40;
        cloud.scale.setScalar(Math.random() * 2 + 1);
        galaxyGroup.add(cloud);
    }
    
    return galaxyGroup;
}

const galaxy = createGalaxy();
// Incline the galaxy by rotating it slightly
galaxy.rotation.x = -0.3; // About 17 degrees
galaxy.rotation.z = 0.15;  // About 8.5 degrees
scene.add(galaxy);

// Add some ambient lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
scene.add(ambientLight);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update controls for smooth damping
    controls.update();
    
    // Rotate the galaxy around its own tilted axis (not the world Y-axis)
    // This makes the galaxy spin naturally like a real galaxy would
    galaxy.rotateOnAxis(new THREE.Vector3(0, 1, 0), 0.001);
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation
animate();

// Add button functionality to copy camera position
document.getElementById('copy-camera-btn').addEventListener('click', () => {
    const cameraInfo = {
        position: {
            x: Math.round(camera.position.x * 100) / 100,
            y: Math.round(camera.position.y * 100) / 100,
            z: Math.round(camera.position.z * 100) / 100
        },
        target: {
            x: Math.round(controls.target.x * 100) / 100,
            y: Math.round(controls.target.y * 100) / 100,
            z: Math.round(controls.target.z * 100) / 100
        },
        distance: Math.round(camera.position.distanceTo(controls.target) * 100) / 100
    };
    
    const cameraText = `Camera Position:
Position: (${cameraInfo.position.x}, ${cameraInfo.position.y}, ${cameraInfo.position.z})
Target: (${cameraInfo.target.x}, ${cameraInfo.target.y}, ${cameraInfo.target.z})
Distance: ${cameraInfo.distance}

Code to set this view:
camera.position.set(${cameraInfo.position.x}, ${cameraInfo.position.y}, ${cameraInfo.position.z});
controls.target.set(${cameraInfo.target.x}, ${cameraInfo.target.y}, ${cameraInfo.target.z});
controls.update();`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(cameraText).then(() => {
        // Show feedback
        const button = document.getElementById('copy-camera-btn');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = 'rgba(0, 255, 0, 0.3)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = 'rgba(255, 255, 255, 0.2)';
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
        alert('Failed to copy to clipboard. Check console for camera info.');
        console.log(cameraText);
    });
});

