import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

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
    background: rgba(0, 0, 0, 0.8);
    z-index: 2000;
    overflow: hidden; /* Prevent scrolling */
}
#gameFrame {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    height: 90%;
    border: none;
    border-radius: 10px;
    background: white;
}
#closeOverlay {
    position: absolute;
    top: 20px;
    right: 20px;
    background: #00ff77;
    color: black;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    z-index: 2001;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s ease;
}
#openNewTab {
    position: absolute;
    top: 80px; /* Position below the close button */
    right: 20px;
    background: #00ff77;
    color: black;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    z-index: 2001;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s ease;
}
.button-content {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
}
.portal-logo {
    width: 24px;
    height: 24px;
    object-fit: contain;
    filter: brightness(0) invert(1); /* Make icons white */
}
#closeOverlay:hover, #openNewTab:hover {
    background: #00cc77;
}

/* Mobile-friendly adjustments for game overlay */
@media (max-width: 768px) {
    #closeOverlay, #openNewTab {
        padding: 12px 15px;
        font-size: 14px;
        width: auto;
        max-width: 150px;
    }
    
    #gameFrame {
        width: 95%;
        height: 85%; /* Smaller height to make room for buttons */
        top: 55%; /* Move down slightly to make room for buttons */
    }
}

/* Even smaller screens */
@media (max-width: 480px) {
    #closeOverlay, #openNewTab {
        padding: 15px;
        font-size: 16px;
        right: 10px;
        width: auto;
        max-width: 140px;
    }
    
    .portal-logo {
        width: 20px;
        height: 20px;
        filter: brightness(0) invert(1); /* Make icons white */
    }
    
    /* Stack buttons vertically on very small screens */
    #openNewTab {
        top: 70px;          /* Position below the close button */
        right: 10px;        /* Align with close button */
    }
    
    #gameFrame {
        width: 100%;
        height: 80%;
        border-radius: 0; /* Remove border radius on small screens */
    }
}

/* Mobile styles */
@media (max-width: 768px) {
    #closeOverlay, #openNewTab {
        padding: 15px 20px;  /* Larger padding on mobile */
        font-size: 18px;     /* Larger font on mobile */
    }
    
    .portal-logo {
        width: 32px;         /* Larger logo on mobile */
        height: 32px;
        filter: brightness(0) invert(1); /* Make icons white */
    }
    
    #openNewTab {
        right: 200px;        /* More space between buttons on mobile */
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
    <div style="display: flex; justify-content: space-between; padding: 10px 20px; width: 100%;">
        <button id="closeOverlay" style="font-size: max(16px, 2.5vw); padding: 10px 20px;">
            <div class="button-content">
                <img src="assets/back.png" alt="Back Icon" class="portal-logo" style="filter: brightness(0); width: max(20px, 3vw); height: max(20px, 3vw);">
                <span>Back to Dim42</span>
            </div>
        </button>
        <button id="openNewTab" style="font-size: max(16px, 2.5vw); padding: 10px 20px;">
            <div class="button-content">
                <img src="assets/newtab.png" alt="New Tab Icon" class="portal-logo" style="filter: brightness(0); width: max(20px, 3vw); height: max(20px, 3vw);">
                <span>Open in New Tab</span>
            </div>
        </button>
    </div>
    <iframe id="gameFrame" allowfullscreen style="width: 95%; height: 90%; margin: auto;"></iframe>
</div>

<div id="dimNotification">
    <div id="dimMessage"></div>
    <button id="dimCloseBtn">Close</button>
</div>
`;

// Portal class
class Portal {
    constructor(position, rotation, title, url, color = 0x00ff77, sizeMultiplier = 1.0, scene) {
        this.url = url;
        this.position = position;
        this.rotation = rotation;
        this.lastTriggerTime = 0;  // Add cooldown tracking
        this.triggerCooldown = 1000; // 1 second cooldown
        this.color = color;
        this.sizeMultiplier = sizeMultiplier;
        this.scene = scene;

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
                        // Show overlay and set active state
                        const overlay = document.getElementById('gameOverlay');
                        const gameFrame = document.getElementById('gameFrame');
                        
                        // Add dim_source parameter to track where the user came from
                        let targetUrl = this.url;
                        const separator = targetUrl.includes('?') ? '&' : '?';
                        targetUrl += `${separator}dim_source=${encodeURIComponent(window.location.hostname)}`;
                        
                        gameFrame.src = targetUrl;
                        window.currentGameUrl = targetUrl;  // Store current game URL with dim_source
                        overlay.style.display = 'block';
                        window.isOverlayActive = true;  // Set state
                        
                        // Log portal activation for debugging
                        console.log(`Portal activated! Navigating to: ${targetUrl}`);
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
        scene
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
    
    // Add event listeners for overlay controls
    document.getElementById('closeOverlay').addEventListener('click', () => {
        const overlay = document.getElementById('gameOverlay');
        const gameFrame = document.getElementById('gameFrame');
        overlay.style.display = 'none';
        gameFrame.src = '';  // Clear the iframe
        window.isOverlayActive = false;  // Reset state
        window.lastOverlayCloseTime = Date.now();  // Set the close time
    });

    // Add new tab handler
    document.getElementById('openNewTab').addEventListener('click', () => {
        window.open(window.currentGameUrl, '_blank');
    });
}

export { Portal, initPortalSystem, createReturnPortal, checkDimSource, portalStyles, portalHTML }; 