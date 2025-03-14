import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Add static cache at the top of the file, before the Portal class
const previewCache = new Map();

// Portal CSS styles
const portalStyles = `
/* Portal-specific styles */
#gameOverlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
}

#gameOverlay.active {
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-container {
    position: relative;
    width: 95%;
    height: 95%;
    max-width: 1800px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-header {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: rgba(0, 255, 119, 0.1);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(0, 255, 119, 0.2);
    transition: transform 0.3s ease;
}

.modal-header.hidden {
    transform: translateY(100%);
}

.show-nav-button {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 255, 119, 0.9);
    border: none;
    width: 40px;
    height: 24px;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-header.hidden .show-nav-button,
.modal-header:hover .show-nav-button {
    opacity: 1;
}

.show-nav-button::after {
    content: "▲";
    color: black;
    font-size: 12px;
}

.modal-header.hidden .show-nav-button::after {
    content: "▼";
}

.portal-breadcrumb {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 16px;
    color: #00b357;
    flex: 1;
    overflow-x: auto;
    white-space: nowrap;
    padding: 0 12px;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.portal-breadcrumb::-webkit-scrollbar {
    display: none;
}

.portal-breadcrumb-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: rgba(0, 255, 119, 0.1);
    border-radius: 8px;
    transition: background 0.2s ease;
}

.portal-breadcrumb-item:hover {
    background: rgba(0, 255, 119, 0.2);
}

.portal-breadcrumb-item:not(:last-child)::after {
    content: "→";
    color: #00b357;
    font-size: 18px;
}

.portal-url {
    font-family: ui-monospace, 'SF Mono', monospace;
    font-size: 14px;
    color: #00b357;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
}

#portalNavBar {
    display: flex;
    gap: 12px;
}

.portal-nav-button {
    background: rgba(0, 255, 119, 0.9);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.portal-nav-button:hover {
    transform: scale(1.1);
    background: rgba(0, 255, 119, 1);
}

.portal-logo {
    width: 20px;
    height: 20px;
    object-fit: contain;
    filter: brightness(0);
}

#gameFrame {
    flex: 1;
    width: 100%;
    border: none;
    background: white;
}

/* Mobile-friendly adjustments */
@media (max-width: 768px) {
    .modal-container {
        width: 100%;
        height: 100%;
        border-radius: 0;
    }
    
    .modal-header {
        padding: 16px 12px;
    }
    
    .portal-nav-button {
        width: 48px;
        height: 48px;
    }
    
    .portal-logo {
        width: 24px;
        height: 24px;
    }

    .portal-url {
        max-width: 200px;
        font-size: 16px;
    }

    .portal-breadcrumb {
        font-size: 18px;
    }

    .portal-breadcrumb-item {
        padding: 10px 16px;
    }
}

#dimNotification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 136, 255, 0.9);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
    z-index: 1000;
    display: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 90%;
}

#dimNotification button {
    background-color: white;
    color: #0088ff;
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    margin-top: 10px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s;
}

#dimNotification button:hover {
    background-color: #f0f0f0;
}
`;

// Portal HTML elements
const portalHTML = `
<div id="gameOverlay">
    <div class="modal-container">
        <div class="modal-header">
            <button class="show-nav-button"></button>
            <div class="portal-breadcrumb"></div>
            <nav id="portalNavBar">
                <button id="closeOverlay" class="portal-nav-button">
                    <img src="assets/back.png" alt="Back Icon" class="portal-logo">
                </button>
                <button id="openNewTab" class="portal-nav-button">
                    <img src="assets/newtab.png" alt="New Tab Icon" class="portal-logo">
                </button>
            </nav>
        </div>
        <iframe id="gameFrame" allowfullscreen></iframe>
    </div>
</div>

<div id="dimNotification">
    <div id="dimMessage"></div>
    <button id="dimCloseBtn">Close</button>
</div>`;

// Portal class
class Portal {
    constructor(position, rotation, title, url, color = 0x00ff77, sizeMultiplier = 1.0, scene, showPreview = false) {
        this.url = url;
        this.position = position;
        this.rotation = rotation;
        this.lastTriggerTime = 0;  // Add cooldown tracking
        this.triggerCooldown = 1000; // 1 second cooldown
        this.color = color;
        this.sizeMultiplier = sizeMultiplier;
        this.scene = scene;

        // Only create preview if showPreview is true
        if (showPreview) {
            // Create preview plane with circular shape
            const previewGeometry = new THREE.CircleGeometry(1.7 * sizeMultiplier, 32);
            const previewMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.5,  // Reduced base opacity
                side: THREE.DoubleSide,
                alphaTest: 0.5,
                depthWrite: false  // Prevent z-fighting
            });
            this.previewPlane = new THREE.Mesh(previewGeometry, previewMaterial);
            this.previewPlane.position.copy(position);
            this.previewPlane.rotation.copy(rotation);
            this.previewPlane.position.z += 0.05; // Closer to the portal
            scene.add(this.previewPlane);

            // Load preview image
            const loader = new THREE.TextureLoader();
            const previewUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
            
            // Check cache first
            if (previewCache.has(url)) {
                previewMaterial.map = previewCache.get(url);
                previewMaterial.needsUpdate = true;
            } else {
                loader.load(
                    previewUrl,
                    (texture) => {
                        // Create a canvas to modify the texture
                        const canvas = document.createElement('canvas');
                        canvas.width = texture.image.width;
                        canvas.height = texture.image.height;
                        const ctx = canvas.getContext('2d');

                        // Draw the image
                        ctx.drawImage(texture.image, 0, 0, canvas.width, canvas.height);

                        // Create circular mask
                        ctx.globalCompositeOperation = 'destination-in';
                        ctx.beginPath();
                        ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2, 0, Math.PI * 2);
                        ctx.fill();

                        // Create new texture from masked canvas
                        const maskedTexture = new THREE.CanvasTexture(canvas);
                        
                        // Store in cache
                        previewCache.set(url, maskedTexture);
                        
                        previewMaterial.map = maskedTexture;
                        previewMaterial.needsUpdate = true;
                    },
                    undefined,
                    (error) => {
                        console.error('Error loading preview:', error);
                        // On error, show a placeholder
                        const canvas = document.createElement('canvas');
                        const size = 512;
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext('2d');
                        
                        // Create circular background
                        ctx.beginPath();
                        ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
                        ctx.fillStyle = '#ffffff';
                        ctx.fill();
                        
                        // Add text
                        ctx.fillStyle = '#000000';
                        ctx.font = '24px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('Preview not available', size/2, size/2);
                        
                        const texture = new THREE.CanvasTexture(canvas);
                        
                        // Cache the error texture too
                        previewCache.set(url, texture);
                        
                        previewMaterial.map = texture;
                        previewMaterial.needsUpdate = true;
                    }
                );
            }
        }

        // Create portal spiral effect
        const spiralGeometry = new THREE.TorusGeometry(2 * sizeMultiplier, 0.3 * sizeMultiplier, 16, 100);
        const spiralMaterial = new THREE.MeshStandardMaterial({ 
            color: this.color,
            emissive: this.color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        this.spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
        this.spiral.position.copy(position);
        this.spiral.rotation.copy(rotation);
        scene.add(this.spiral);

        // Create portal inner effect (swirling texture)
        const portalGeometry = new THREE.CircleGeometry(1.7 * sizeMultiplier, 32);
        this.portalMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });

        // Create swirl texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Create gradient
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        
        // Convert hex color to RGB components for gradient
        const r = (this.color >> 16) & 255;
        const g = (this.color >> 8) & 255;
        const b = this.color & 255;
        
        gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
        gradient.addColorStop(0.5, `rgb(${Math.floor(r*0.7)}, ${Math.floor(g*0.7)}, ${Math.floor(b*0.7)})`);
        gradient.addColorStop(1, `rgb(${Math.floor(r*0.4)}, ${Math.floor(g*0.4)}, ${Math.floor(b*0.4)})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        // Create spiral pattern
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        for(let i = 0; i < 360; i += 30) {
            ctx.beginPath();
            ctx.arc(256, 256, i, 0, Math.PI * 2);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.portalMaterial.map = texture;

        this.portal = new THREE.Mesh(portalGeometry, this.portalMaterial);
        this.portal.position.copy(position);
        this.portal.rotation.copy(rotation);
        scene.add(this.portal);

        // Add electric particles
        this.particles = [];
        for(let i = 0; i < 20; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.03 * sizeMultiplier, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            this.resetParticle(particle);
            scene.add(particle);
            this.particles.push(particle);
        }

        // Add title
        this.addTitle(title);
    }

    resetParticle(particle) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.7 + Math.random() * 0.5;
        particle.position.x = this.position.x + Math.cos(angle) * radius;
        particle.position.y = this.position.y + Math.sin(angle) * radius;
        particle.position.z = this.position.z;
        particle.userData.speed = 0.02 + Math.random() * 0.03;
        particle.userData.angle = angle;
    }

    updateParticles() {
        this.particles.forEach(particle => {
            particle.userData.angle += particle.userData.speed;
            if(particle.userData.angle > Math.PI * 2) {
                this.resetParticle(particle);
            }
            const radius = 1.7 + Math.random() * 0.5;
            particle.position.x = this.position.x + Math.cos(particle.userData.angle) * radius;
            particle.position.y = this.position.y + Math.sin(particle.userData.angle) * radius;
        });
    }

    addTitle(text) {
        const loader = new FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            const geometry = new TextGeometry(text, {
                font: font,
                size: 0.3,
                height: 0.05
            });
            geometry.computeBoundingBox();
            const textMaterial = new THREE.MeshStandardMaterial({ 
                color: this.color,
                emissive: this.color,
                emissiveIntensity: 0.5
            });
            const textMesh = new THREE.Mesh(geometry, textMaterial);
            
            // Center the text above the portal
            const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
            textMesh.position.copy(this.position);
            textMesh.position.y += 2.5;
            textMesh.position.x -= textWidth / 2;
            textMesh.rotation.y = this.rotation.y;
            
            this.scene.add(textMesh);
        });
    }

    checkCollision(position, isOverlayActive, lastOverlayCloseTime, OVERLAY_COOLDOWN) {
        // Skip collision check if overlay is active
        if (isOverlayActive) return;

        // Check if we're still in cooldown period
        if (Date.now() - lastOverlayCloseTime < OVERLAY_COOLDOWN) return;

        const distance = position.distanceTo(this.portal.position);
        // Increase collision threshold for more sensitivity
        const COLLISION_THRESHOLD = 3.0; // Increased from 1.5 to 3.0
        
        // Add visual indicator when close to portal
        if (distance < COLLISION_THRESHOLD * 1.5) {
            // Make portal pulse faster and more intensely when player is close
            const pulseSpeed = 0.01 + (1 - distance / (COLLISION_THRESHOLD * 1.5)) * 0.05;
            const pulseIntensity = 0.3 + (1 - distance / (COLLISION_THRESHOLD * 1.5)) * 0.5;
            
            // Apply enhanced pulse effect
            const pulse = Math.sin(Date.now() * pulseSpeed) * pulseIntensity + 0.8;
            this.portalMaterial.opacity = 0.6 * pulse;
            this.spiral.material.opacity = 0.8 * pulse;
            this.spiral.material.emissiveIntensity = 0.7 * pulse;
            
            // Scale the portal slightly based on proximity
            const scale = 1 + (1 - distance / (COLLISION_THRESHOLD * 1.5)) * 0.2;
            this.spiral.scale.set(scale, scale, scale);
        } else {
            // Reset scale when far away
            this.spiral.scale.set(1, 1, 1);
        }

        const currentTime = Date.now();
        // Reduce cooldown time for more frequent checks
        if (distance < COLLISION_THRESHOLD && 
            currentTime - this.lastTriggerTime > 500) { // Reduced from 1000ms to 500ms
            
            // Get direction from Rick to portal
            const toPortal = new THREE.Vector3();
            toPortal.subVectors(this.portal.position, position).normalize();
            
            // Get portal's forward direction
            const portalNormal = new THREE.Vector3(0, 0, -1);
            portalNormal.applyEuler(this.rotation);
            
            const dot = toPortal.dot(portalNormal);
            
            // Make the dot product check less strict (0.3 instead of 0.5)
            if (dot > 0.3) {
                this.lastTriggerTime = currentTime;
                
                // Add visual feedback when portal is triggered
                this.spiral.material.emissiveIntensity = 1.0;
                
                // Add a small delay to ensure the collision is intentional
                setTimeout(() => {
                    if (position.distanceTo(this.portal.position) < COLLISION_THRESHOLD) {
                        let targetUrl = this.url;
                        const separator = targetUrl.includes('?') ? '&' : '?';
                        targetUrl += `${separator}dim_source=${encodeURIComponent(window.location.hostname)}`;
                        
                        activatePortal(targetUrl);
                    }
                }, 100);
            }
        }
    }

    update() {
        // Rotate spiral
        this.spiral.rotation.z += 0.01;
        
        // Rotate portal texture
        if(this.portalMaterial.map) {
            this.portalMaterial.map.rotation += 0.01;
            this.portalMaterial.map.needsUpdate = true;
        }

        // Update particles
        this.updateParticles();

        // Pulse effects
        const pulse = Math.sin(Date.now() * 0.003) * 0.2 + 0.8;
        this.portalMaterial.opacity = 0.6 * pulse;
        this.spiral.material.opacity = 0.8 * pulse;
        this.spiral.material.emissiveIntensity = 0.5 * pulse;
        
        // Static preview opacity - no pulse
        if (this.previewPlane) {
            this.previewPlane.material.opacity = 0.5;  // Keep constant opacity
        }
    }
}

// Function to create a return portal
function createReturnPortal(sourceUrl, scene, portals, returnPortalCreated) {
    // Check if a return portal has already been created or if the source URL is invalid
    if (returnPortalCreated || !sourceUrl) return false;
    
    console.log(`Creating return portal to: ${sourceUrl}`);
    
    // Try to create a valid URL if it's not already one
    let targetUrl = sourceUrl;
    if (!sourceUrl.startsWith('http://') && !sourceUrl.startsWith('https://')) {
        // Try to construct a valid URL
        try {
            // First try with https
            targetUrl = 'https://' + sourceUrl;
            // Test if it's a valid URL
            new URL(targetUrl);
        } catch (e) {
            console.log(`Invalid URL: ${targetUrl}`);
            // If not valid, it might be just a name/identifier, not a URL
            return false; // Return false since we didn't create a portal
        }
    }
    
    // Create a new portal with blue color - place it next to the Vibe Sail portal
    const returnPortalPosition = new THREE.Vector3(0, 0, 10); // Position it in positive Z
    const returnPortal = new Portal(
        returnPortalPosition,
        new THREE.Euler(0, Math.PI, 0), // Rotate to face Rick
        `Return to ${sourceUrl}`,
        targetUrl,
        0x0088ff, // Blue color for return portals
        1.5,      // Smaller size (1.5x instead of 2x)
        scene,
        true     // Show preview for return portals
    );
    
    // Add the portal to the array
    portals.push(returnPortal);
    
    console.log(`Return portal created at position: ${returnPortalPosition.x}, ${returnPortalPosition.y}, ${returnPortalPosition.z}`);
    
    return true;
}

// Function to check for dim_source parameter and create notification
function checkDimSource(portals, scene) {
    const urlParams = new URLSearchParams(window.location.search);
    const dimSource = urlParams.get('dim_source');
    let returnPortalCreated = false;
    
    if (dimSource) {
        console.log(`User arrived from: ${dimSource}`);
        
        // Display notification
        const dimNotification = document.getElementById('dimNotification');
        const dimMessage = document.getElementById('dimMessage');
        
        // Format the message
        let message = `You arrived through a portal from: <strong>${dimSource}</strong>`;
        
        // If it's a URL, make it clickable
        if (dimSource.startsWith('http://') || dimSource.startsWith('https://')) {
            message += `<br><a href="${dimSource}" target="_blank" style="color: white; text-decoration: underline;">Visit source</a>`;
        }
        
        dimMessage.innerHTML = message;
        dimNotification.style.display = 'block';
        
        // Fade out after 8 seconds
        setTimeout(() => {
            dimNotification.style.opacity = '0';
            dimNotification.style.transition = 'opacity 1s';
            setTimeout(() => {
                dimNotification.style.display = 'none';
                dimNotification.style.opacity = '1';
                dimNotification.style.transition = '';
            }, 1000);
        }, 8000);
        
        // Add close button functionality
        document.getElementById('dimCloseBtn').addEventListener('click', function() {
            dimNotification.style.display = 'none';
        });
        
        // Create return portal if not already created
        returnPortalCreated = createReturnPortal(dimSource, scene, portals, returnPortalCreated);
    }
    
    return returnPortalCreated;
}

// Function to initialize portal system
function initPortalSystem() {
    // Add portal CSS to document
    const styleElement = document.createElement('style');
    styleElement.textContent = portalStyles;
    document.head.appendChild(styleElement);
    
    // Add portal HTML to document
    const portalContainer = document.createElement('div');
    portalContainer.innerHTML = portalHTML;
    document.body.appendChild(portalContainer);
    
    // Initialize global variables
    window.isOverlayActive = false;
    window.currentGameUrl = '';
    window.lastOverlayCloseTime = 0;
    window.OVERLAY_COOLDOWN = 5000;  // 5 seconds cooldown
    window.portalStack = [];  // Stack to track portal navigation
    
    // Add hide/show navigation functionality
    const modalHeader = document.querySelector('.modal-header');
    const showNavButton = document.querySelector('.show-nav-button');
    
    showNavButton.addEventListener('click', () => {
        modalHeader.classList.toggle('hidden');
    });

    // Auto-hide navigation after 3 seconds of inactivity
    let hideTimeout;
    function resetHideTimeout() {
        clearTimeout(hideTimeout);
        modalHeader.classList.remove('hidden');
        hideTimeout = setTimeout(() => {
            if (!modalHeader.matches(':hover')) {
                modalHeader.classList.add('hidden');
            }
        }, 3000);
    }

    // Reset timeout on mouse movement or touch
    modalHeader.addEventListener('mousemove', resetHideTimeout);
    modalHeader.addEventListener('touchstart', resetHideTimeout);
    modalHeader.addEventListener('mouseenter', resetHideTimeout);
    
    // Keep visible while hovering
    modalHeader.addEventListener('mouseleave', () => {
        if (!modalHeader.classList.contains('hidden')) {
            hideTimeout = setTimeout(() => {
                modalHeader.classList.add('hidden');
            }, 1000);
        }
    });

    // Listen for messages from iframes
    window.addEventListener('message', (event) => {
        if (event.data.type === 'PORTAL_NAVIGATION') {
            const { url } = event.data;
            const gameFrame = document.getElementById('gameFrame');
            
            // Update the iframe source
            gameFrame.src = url;
            window.currentGameUrl = url;
            window.portalStack.push(url);
            
            console.log('Portal stack updated:', window.portalStack);
        }
    });
    
    // Add event listeners for overlay controls
    document.getElementById('closeOverlay').addEventListener('click', () => {
        const overlay = document.getElementById('gameOverlay');
        const gameFrame = document.getElementById('gameFrame');
        
        window.portalStack.pop();
        
        if (window.portalStack.length > 0) {
            const previousUrl = window.portalStack[window.portalStack.length - 1];
            gameFrame.src = previousUrl;
            window.currentGameUrl = previousUrl;
            updateBreadcrumb();
            
            // Update visual depth effect
            const depth = window.portalStack.length;
            overlay.style.background = `rgba(0, 0, 0, ${0.5 + (depth * 0.1)})`;
        } else {
            overlay.classList.remove('active');
            gameFrame.src = '';
            window.isOverlayActive = false;
            window.lastOverlayCloseTime = Date.now();
            overlay.style.background = 'rgba(0, 0, 0, 0.5)';
        }
    });

    // Add new tab handler
    document.getElementById('openNewTab').addEventListener('click', () => {
        window.open(window.currentGameUrl, '_blank');
    });
}

// Function to update breadcrumb navigation
function updateBreadcrumb() {
    const breadcrumb = document.querySelector('.portal-breadcrumb');
    if (!breadcrumb) return;

    breadcrumb.innerHTML = '';
    
    window.portalStack.forEach((url, index) => {
        const item = document.createElement('div');
        item.className = 'portal-breadcrumb-item';
        
        // Create URL display
        const urlDisplay = document.createElement('span');
        urlDisplay.className = 'portal-url';
        try {
            const urlObj = new URL(url);
            urlDisplay.textContent = urlObj.hostname;
        } catch (e) {
            urlDisplay.textContent = url;
        }
        
        item.appendChild(urlDisplay);
        breadcrumb.appendChild(item);
        
        // Add click handler for navigation
        if (index < window.portalStack.length - 1) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                // Navigate back to this point in the stack
                while (window.portalStack.length > index + 1) {
                    window.portalStack.pop();
                }
                const gameFrame = document.getElementById('gameFrame');
                gameFrame.src = url;
                window.currentGameUrl = url;
                updateBreadcrumb();
            });
        }
    });
}

// Update the activatePortal function to include breadcrumb updates
function activatePortal(targetUrl) {
    // Check if we're in an iframe
    if (window !== window.top) {
        // We're in an iframe, send message to parent
        window.top.postMessage({
            type: 'PORTAL_NAVIGATION',
            url: targetUrl
        }, '*');
    } else {
        // We're in the top window, handle normally
        const overlay = document.getElementById('gameOverlay');
        const gameFrame = document.getElementById('gameFrame');
        
        if (overlay && gameFrame) {
            window.portalStack.push(targetUrl);
            gameFrame.src = targetUrl;
            window.currentGameUrl = targetUrl;
            overlay.classList.add('active');
            window.isOverlayActive = true;
            updateBreadcrumb();
            
            // Add visual depth effect based on stack depth
            const depth = window.portalStack.length;
            overlay.style.background = `rgba(0, 0, 0, ${0.5 + (depth * 0.1)})`;
        } else {
            window.open(targetUrl, '_blank');
        }
    }
}

/**
 * Creates a 2D portal that can be embedded in any webpage
 * @param {Object} options Configuration options for the 2D portal
 * @param {string} options.target The URL to navigate to when entering the portal (default: "https://dim42.com")
 * @param {string} options.position Where to place the portal - "top-left", "top-right", "bottom-left", or "bottom-right" (default: "bottom-right")
 * @param {string} options.color The color of the portal in hex format (default: "#00ff77")
 * @param {number} options.size Size multiplier for the portal (default: 1)
 * @param {string} options.title The title to display above the portal (default: "Enter Dim42")
 * @returns {void}
 */
export function create2DPortal(options = {}) {
    const {
        target = 'https://dim42.com',
        position = 'bottom-right',
        color = '#00ff77',
        size = 1,
        title = 'Enter Dim42'
    } = options;

    // Convert color string to hex number
    const colorHex = parseInt(color.replace('#', '0x'));

    // Create container for the portal
    const container = document.createElement('div');
    container.id = 'dim42-portal-container';
    container.style.cssText = `
        position: fixed;
        width: ${200 * size}px;
        height: ${200 * size}px;
        z-index: 9999;
        pointer-events: auto;
        user-select: none;
    `;

    // Set position
    switch (position) {
        case 'top-left':
            container.style.top = '20px';
            container.style.left = '20px';
            break;
        case 'top-right':
            container.style.top = '20px';
            container.style.right = '20px';
            break;
        case 'bottom-left':
            container.style.bottom = '20px';
            container.style.left = '20px';
            break;
        case 'bottom-right':
        default:
            container.style.bottom = '20px';
            container.style.right = '20px';
            break;
    }

    document.body.appendChild(container);

    // Create title element
    const titleElement = document.createElement('div');
    titleElement.textContent = title;
    titleElement.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        color: ${color};
        font-family: Arial, sans-serif;
        font-size: ${16 * size}px;
        font-weight: bold;
        text-align: center;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        pointer-events: none;
    `;
    container.appendChild(titleElement);

    // Create scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true
    });
    renderer.setSize(200 * size, 200 * size);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create portal group
    const portalGroup = new THREE.Group();
    scene.add(portalGroup);

    // Create portal spiral
    const spiralGeometry = new THREE.TorusGeometry(2, 0.3, 16, 100);
    const spiralMaterial = new THREE.MeshBasicMaterial({ 
        color: colorHex,
        transparent: true,
        opacity: 0.8
    });
    const spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
    portalGroup.add(spiral);

    // Create portal inner effect
    const portalGeometry = new THREE.CircleGeometry(1.7, 32);
    const portalMaterial = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });

    // Create swirl texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create gradient
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    
    // Convert hex color to RGB components for gradient
    const r = (colorHex >> 16) & 255;
    const g = (colorHex >> 8) & 255;
    const b = colorHex & 255;
    
    gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
    gradient.addColorStop(0.5, `rgb(${Math.floor(r*0.7)}, ${Math.floor(g*0.7)}, ${Math.floor(b*0.7)})`);
    gradient.addColorStop(1, `rgb(${Math.floor(r*0.4)}, ${Math.floor(g*0.4)}, ${Math.floor(b*0.4)})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Create spiral pattern
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for(let i = 0; i < 360; i += 30) {
        ctx.beginPath();
        ctx.arc(256, 256, i, 0, Math.PI * 2);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    portalMaterial.map = texture;

    const portal = new THREE.Mesh(portalGeometry, portalMaterial);
    portalGroup.add(portal);

    // Add particles
    const particles = [];
    for(let i = 0; i < 20; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Set random position
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.7 + Math.random() * 0.5;
        particle.position.x = Math.cos(angle) * radius;
        particle.position.y = Math.sin(angle) * radius;
        
        // Store particle data
        particle.userData.speed = 0.02 + Math.random() * 0.03;
        particle.userData.angle = angle;
        
        portalGroup.add(particle);
        particles.push(particle);
    }

    // Add click event to portal
    renderer.domElement.addEventListener('click', () => {
        const separator = target.includes('?') ? '&' : '?';
        const portalUrl = `${target}${separator}dim_source=${encodeURIComponent(window.location.hostname)}`;
        
        activatePortal(portalUrl);
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate portal
        spiral.rotation.z += 0.01;
        
        // Rotate texture
        if (portalMaterial.map) {
            portalMaterial.map.rotation += 0.01;
            portalMaterial.map.needsUpdate = true;
        }
        
        // Update particles
        particles.forEach(particle => {
            particle.userData.angle += particle.userData.speed;
            if (particle.userData.angle > Math.PI * 2) {
                particle.userData.angle = 0;
            }
            const radius = 1.7 + Math.random() * 0.5;
            particle.position.x = Math.cos(particle.userData.angle) * radius;
            particle.position.y = Math.sin(particle.userData.angle) * radius;
        });
        
        // Pulse effects
        const pulse = Math.sin(Date.now() * 0.003) * 0.2 + 0.8;
        portalMaterial.opacity = 0.6 * pulse;
        spiralMaterial.opacity = 0.8 * pulse;
        
        // Slowly rotate the entire portal
        portalGroup.rotation.z += 0.001;
        
        renderer.render(scene, camera);
    }
    
    animate();

    // Check for dim_source and create return portal if needed
    const urlParams = new URLSearchParams(window.location.search);
    const dimSource = urlParams.get('dim_source');
    
    if (dimSource) {
        // Create return portal in opposite corner
        create2DPortal({
            target: dimSource.startsWith('http') ? dimSource : `https://${dimSource}`,
            position: getOppositePosition(position),
            color: '#ff5500', // Orange for return portals
            size: size,
            title: `Return to ${dimSource}`
        });

        // Show notification
        showDimSourceNotification(dimSource, color);
    }
}

function getOppositePosition(position) {
    switch (position) {
        case 'top-left': return 'bottom-right';
        case 'top-right': return 'bottom-left';
        case 'bottom-left': return 'top-right';
        case 'bottom-right': return 'top-left';
        default: return 'top-left';
    }
}

function showDimSourceNotification(dimSource, color) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${color};
        color: black;
        padding: 15px 25px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 18px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        opacity: 0;
        transition: opacity 0.5s ease;
        text-align: center;
        max-width: 90%;
    `;
    
    notification.textContent = `You arrived through a portal from ${dimSource}`;
    document.body.appendChild(notification);
    
    // Show notification after a short delay
    setTimeout(() => {
        notification.style.opacity = '1';
        
        // Hide notification after 8 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            
            // Remove notification after fade out
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 8000);
    }, 1000);
}

export { Portal, initPortalSystem, createReturnPortal, checkDimSource, portalStyles, portalHTML }; 