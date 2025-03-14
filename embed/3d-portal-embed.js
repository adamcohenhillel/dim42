/**
 * Dim42 Portal - Embeddable Rick and Morty style portal
 * 
 * This is a standalone component that can be added to any Three.js game
 * to create a portal to Dim42 (https://dim42.com)
 * 
 * Usage:
 * 1. Include this script in your Three.js project
 * 2. Create a portal with:
 *    const portal = new Dim42Portal(scene, position, rotation, title, targetUrl, color);
 * 3. Add to your animation loop:
 *    portal.update(deltaTime);
 *    portal.checkCollision(playerPosition);
 */

class Dim42Portal {
    /**
     * Create a new Dim42 portal
     * @param {THREE.Scene} scene - The Three.js scene to add the portal to
     * @param {THREE.Vector3} position - Position of the portal
     * @param {THREE.Euler} rotation - Rotation of the portal
     * @param {string} title - Title to display above the portal
     * @param {string} targetUrl - URL to navigate to when entering the portal (default: https://dim42.com)
     * @param {number} color - Hex color of the portal (default: 0x00ff77 - green)
     * @param {Object} options - Additional options
     * @param {boolean} options.addOverlay - Whether to add the overlay HTML (default: true)
     * @param {boolean} options.addFontLoader - Whether to add the FontLoader (default: true)
     * @param {number} options.size - Size multiplier for the portal (default: 1)
     */
    constructor(scene, position, rotation, title, targetUrl = "https://dim42.com", color = 0x00ff77, options = {}) {
        // Default options
        this.options = Object.assign({
            addOverlay: true,
            addFontLoader: true,
            size: 1
        }, options);

        this.scene = scene;
        this.url = targetUrl;
        this.position = position;
        this.rotation = rotation;
        this.title = title;
        this.color = color;
        this.lastTriggerTime = 0;
        this.triggerCooldown = 1000; // 1 second cooldown
        this.isOverlayActive = false;
        this.lastOverlayCloseTime = 0;
        this.OVERLAY_COOLDOWN = 1000; // 1 second cooldown
        
        // Create portal group to hold all elements
        this.group = new THREE.Group();
        this.group.position.copy(position);
        this.group.rotation.copy(rotation);
        scene.add(this.group);
        
        // Initialize portal
        this._createPortal();
        
        // Add overlay HTML if needed
        if (this.options.addOverlay) {
            this._addOverlayHTML();
        }
        
        // Add title text
        if (this.options.addFontLoader) {
            this._addTitle();
        }
    }
    
    /**
     * Create the portal visuals
     * @private
     */
    _createPortal() {
        const size = this.options.size;
        
        // Create portal spiral effect
        const spiralGeometry = new THREE.TorusGeometry(2 * size, 0.3 * size, 16, 100);
        const spiralMaterial = new THREE.MeshStandardMaterial({ 
            color: this.color,
            emissive: this.color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        this.spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
        this.group.add(this.spiral);

        // Create portal inner effect (swirling texture)
        const portalGeometry = new THREE.CircleGeometry(1.7 * size, 32);
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
        this.group.add(this.portal);

        // Add electric particles
        this.particles = [];
        for(let i = 0; i < 20; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.03 * size, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            this._resetParticle(particle);
            this.group.add(particle);
            this.particles.push(particle);
        }
    }
    
    /**
     * Reset a particle to a random position around the portal
     * @private
     */
    _resetParticle(particle) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.7 * this.options.size + Math.random() * 0.5 * this.options.size;
        particle.position.x = Math.cos(angle) * radius;
        particle.position.y = Math.sin(angle) * radius;
        particle.position.z = 0;
        particle.userData.speed = 0.02 + Math.random() * 0.03;
        particle.userData.angle = angle;
    }
    
    /**
     * Add the title text above the portal
     * @private
     */
    _addTitle() {
        // Check if TextGeometry and FontLoader are available
        if (typeof THREE.TextGeometry === 'undefined' || typeof THREE.FontLoader === 'undefined') {
            console.warn('TextGeometry or FontLoader not available. Title will not be displayed.');
            return;
        }
        
        const loader = new THREE.FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            const geometry = new THREE.TextGeometry(this.title, {
                font: font,
                size: 0.3 * this.options.size,
                height: 0.05 * this.options.size
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
            textMesh.position.y = 2.5 * this.options.size;
            textMesh.position.x = -textWidth / 2;
            
            this.group.add(textMesh);
        });
    }
    
    /**
     * Add the overlay HTML to the document
     * @private
     */
    _addOverlayHTML() {
        // Check if overlay already exists
        if (document.getElementById('dim42-gameOverlay')) {
            return;
        }
        
        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'dim42-gameOverlay';
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 2000;
            overflow: hidden;
        `;
        
        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            padding: 10px 20px;
            width: 100%;
        `;
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.id = 'dim42-closeOverlay';
        closeButton.style.cssText = `
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
        `;
        closeButton.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; white-space: nowrap;">
                <span>Back to Game</span>
            </div>
        `;
        
        // Create open in new tab button
        const openNewTabButton = document.createElement('button');
        openNewTabButton.id = 'dim42-openNewTab';
        openNewTabButton.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
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
        `;
        openNewTabButton.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; white-space: nowrap;">
                <span>Open in New Tab</span>
            </div>
        `;
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'dim42-gameFrame';
        iframe.allowFullscreen = true;
        iframe.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 95%;
            height: 90%;
            border: none;
            border-radius: 10px;
            background: white;
        `;
        
        // Add event listeners
        closeButton.addEventListener('click', () => {
            overlay.style.display = 'none';
            iframe.src = '';
            this.isOverlayActive = false;
            this.lastOverlayCloseTime = Date.now();
        });
        
        openNewTabButton.addEventListener('click', () => {
            window.open(iframe.src, '_blank');
        });
        
        // Append elements
        buttonContainer.appendChild(openNewTabButton);
        buttonContainer.appendChild(closeButton);
        overlay.appendChild(buttonContainer);
        overlay.appendChild(iframe);
        document.body.appendChild(overlay);
        
        // Store references
        this.overlay = overlay;
        this.iframe = iframe;
    }
    
    /**
     * Update the portal animation
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (this.isOverlayActive) return;
        
        // Rotate spiral
        this.spiral.rotation.z += 0.01;
        
        // Rotate portal texture
        if (this.portalMaterial.map) {
            this.portalMaterial.map.rotation += 0.01;
            this.portalMaterial.map.needsUpdate = true;
        }
        
        // Update particles
        this.particles.forEach(particle => {
            particle.userData.angle += particle.userData.speed;
            if (particle.userData.angle > Math.PI * 2) {
                this._resetParticle(particle);
            }
            const radius = 1.7 * this.options.size + Math.random() * 0.5 * this.options.size;
            particle.position.x = Math.cos(particle.userData.angle) * radius;
            particle.position.y = Math.sin(particle.userData.angle) * radius;
        });
        
        // Pulse effects
        const pulse = Math.sin(Date.now() * 0.003) * 0.2 + 0.8;
        this.portalMaterial.opacity = 0.6 * pulse;
        this.spiral.material.opacity = 0.8 * pulse;
        this.spiral.material.emissiveIntensity = 0.5 * pulse;
    }
    
    /**
     * Check if a player has collided with the portal
     * @param {THREE.Vector3} playerPosition - Position of the player
     */
    checkCollision(playerPosition) {
        // Skip collision check if overlay is active
        if (this.isOverlayActive) return;
        
        // Check if we're still in cooldown period
        if (Date.now() - this.lastOverlayCloseTime < this.OVERLAY_COOLDOWN) return;
        
        // Convert player position to local space
        const localPosition = playerPosition.clone().sub(this.position);
        localPosition.applyEuler(new THREE.Euler(
            -this.rotation.x,
            -this.rotation.y,
            -this.rotation.z,
            this.rotation.order
        ));
        
        const distance = localPosition.length();
        const COLLISION_THRESHOLD = 1.5 * this.options.size;
        
        const currentTime = Date.now();
        if (distance < COLLISION_THRESHOLD && 
            currentTime - this.lastTriggerTime > this.triggerCooldown) {
            
            // Check if player is in front of the portal
            if (localPosition.z < 0) {
                this.lastTriggerTime = currentTime;
                
                // Add a small delay to ensure the collision is intentional
                setTimeout(() => {
                    const newLocalPosition = playerPosition.clone().sub(this.position);
                    newLocalPosition.applyEuler(new THREE.Euler(
                        -this.rotation.x,
                        -this.rotation.y,
                        -this.rotation.z,
                        this.rotation.order
                    ));
                    
                    if (newLocalPosition.length() < COLLISION_THRESHOLD) {
                        this._enterPortal();
                    }
                }, 100);
            }
        }
    }
    
    /**
     * Enter the portal and show the overlay
     * @private
     */
    _enterPortal() {
        // Check if overlay exists
        if (!this.overlay) {
            // If no overlay, just open the URL in a new tab
            window.open(this.url, '_blank');
            return;
        }
        
        // Show overlay and set active state
        this.iframe.src = this.url;
        this.overlay.style.display = 'block';
        this.isOverlayActive = true;
    }
    
    /**
     * Remove the portal from the scene
     */
    dispose() {
        // Remove from scene
        this.scene.remove(this.group);
        
        // Dispose geometries and materials
        this.spiral.geometry.dispose();
        this.spiral.material.dispose();
        this.portal.geometry.dispose();
        this.portalMaterial.dispose();
        
        // Dispose particles
        this.particles.forEach(particle => {
            particle.geometry.dispose();
            particle.material.dispose();
        });
        
        // Remove overlay if it exists
        if (this.overlay) {
            document.body.removeChild(this.overlay);
        }
    }
}

/**
 * Check if the URL has a dim_source parameter and create a portal to that source
 * @param {THREE.Scene} scene - The Three.js scene to add the portal to
 * @param {Object} options - Options for the portal
 * @returns {Dim42Portal|null} - The created portal or null if no dim_source was found
 */
function createdimSourcePortal(scene, options = {}) {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    let dimSource = urlParams.get('dim_source');
    
    // If no dim_source is provided in URL, use current website hostname as default
    if (!dimSource) {
        dimSource = window.location.hostname || "current-website";
        console.log("No dim_source parameter found in URL, using current website as default:", dimSource);
    } else {
        console.log("Found dim_source:", dimSource);
    }
    
    // Determine target URL - handle both domain names and full URLs
    let targetUrl;
    if (dimSource.startsWith('http://') || dimSource.startsWith('https://')) {
        targetUrl = dimSource;
    } else if (dimSource.includes('.')) {
        // Looks like a domain name, add https://
        targetUrl = `https://${dimSource}`;
    } else {
        // Just a name, make a best guess
        targetUrl = `https://${dimSource}.com`;
    }
    
    // Default options
    const portalOptions = Object.assign({
        position: new THREE.Vector3(0, 0, -5),
        rotation: new THREE.Euler(0, 0, 0),
        title: `Portal to ${dimSource}`,
        targetUrl: targetUrl,
        color: 0xff5500, // Use orange for return portals
        size: 1
    }, options);
    
    console.log("Creating portal to:", targetUrl);
    
    // Create portal
    return new Dim42Portal(
        scene,
        portalOptions.position,
        portalOptions.rotation,
        portalOptions.title,
        portalOptions.targetUrl,
        portalOptions.color,
        { size: portalOptions.size }
    );
}

// Export the portal class and helper function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Dim42Portal, createdimSourcePortal };
} else {
    window.Dim42Portal = Dim42Portal;
    window.createdimSourcePortal = createdimSourcePortal;
} 