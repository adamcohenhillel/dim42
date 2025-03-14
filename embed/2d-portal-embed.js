/**
 * Dim42 Portal Script
 * 
 * A simple script to add a Rick and Morty style portal to any website.
 * Just include this script in your HTML and it will automatically add a portal.
 * 
 * <script src="embed/2d-portal-embed.js" 
 *   data-target="https://dim42.com" 
 *   data-position="bottom-right"
 *   data-color="#00ff77">
 * </script>
 */

(function() {
    // Load Three.js from CDN
    function loadScript(url, callback) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onload = callback;
        document.head.appendChild(script);
    }

    // Get script parameters
    const scriptTag = document.currentScript;
    const targetUrl = scriptTag.getAttribute('data-target') || 'https://dim42.com';
    const position = scriptTag.getAttribute('data-position') || 'bottom-right';
    const colorStr = scriptTag.getAttribute('data-color') || '#00ff77';
    const size = parseFloat(scriptTag.getAttribute('data-size') || '1');
    const title = scriptTag.getAttribute('data-title') || 'Enter Dim42';
    
    // Convert color string to hex number
    const color = parseInt(colorStr.replace('#', '0x'));

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
        color: ${colorStr};
        font-family: Arial, sans-serif;
        font-size: ${16 * size}px;
        font-weight: bold;
        text-align: center;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        pointer-events: none;
    `;
    container.appendChild(titleElement);

    // Load Three.js and dependencies
    loadScript('https://unpkg.com/three@0.160.0/build/three.min.js', function() {
        // Create scene
        const scene = new THREE.Scene();
        
        // Create camera
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
            color: color,
            transparent: true,
            opacity: 0.8
        });
        const spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
        portalGroup.add(spiral);

        // Create portal inner effect
        const portalGeometry = new THREE.CircleGeometry(1.7, 32);
        const portalMaterial = new THREE.MeshBasicMaterial({
            color: color,
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
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;
        
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
                color: color,
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

        // Create overlay
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
            z-index: 10000;
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
            background: ${colorStr};
            color: black;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            z-index: 10001;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background-color 0.2s ease;
        `;
        closeButton.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; white-space: nowrap;">
                <span>Back to Site</span>
            </div>
        `;
        
        // Create open in new tab button
        const openNewTabButton = document.createElement('button');
        openNewTabButton.id = 'dim42-openNewTab';
        openNewTabButton.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            background: ${colorStr};
            color: black;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            z-index: 10001;
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

        // Add click event to portal
        renderer.domElement.addEventListener('click', () => {
            iframe.src = targetUrl;
            overlay.style.display = 'block';
            
            // Add dim source parameter if not already present
            if (iframe.src.indexOf('dim_source=') === -1) {
                const separator = iframe.src.indexOf('?') !== -1 ? '&' : '?';
                iframe.src += `${separator}dim_source=${encodeURIComponent(window.location.hostname)}`;
            }
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

        // Check for dim_source parameter
        const urlParams = new URLSearchParams(window.location.search);
        const dimSource = urlParams.get('dim_source');
        
        if (dimSource) {
            console.log("User arrived from portal source:", dimSource);
            
            // Create a more prominent notification that we came from another portal
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: ${colorStr};
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
            
            // Create a return portal button
            const returnPortalText = document.createElement('div');
            returnPortalText.textContent = `You arrived through a portal from ${dimSource}`;
            returnPortalText.style.marginBottom = '10px';
            
            const returnButton = document.createElement('button');
            returnButton.textContent = `Return to ${dimSource}`;
            returnButton.style.cssText = `
                background: #ffffff;
                color: ${colorStr};
                border: none;
                padding: 8px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                margin-top: 10px;
                transition: all 0.2s ease;
            `;
            
            returnButton.addEventListener('mouseover', () => {
                returnButton.style.transform = 'scale(1.05)';
                returnButton.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
            });
            
            returnButton.addEventListener('mouseout', () => {
                returnButton.style.transform = 'scale(1)';
                returnButton.style.boxShadow = 'none';
            });
            
            returnButton.addEventListener('click', () => {
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
                
                // Add dim_source parameter to track the return journey
                const separator = targetUrl.includes('?') ? '&' : '?';
                const returnUrl = `${targetUrl}${separator}dim_source=${encodeURIComponent(window.location.hostname)}`;
                
                // Navigate back
                window.location.href = returnUrl;
            });
            
            notification.appendChild(returnPortalText);
            notification.appendChild(returnButton);
            document.body.appendChild(notification);
            
            // Show notification after a short delay
            setTimeout(() => {
                notification.style.opacity = '1';
                
                // Hide notification after 10 seconds
                setTimeout(() => {
                    notification.style.opacity = '0';
                    
                    // Remove notification after fade out
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 500);
                }, 10000);
            }, 1000);
            
            // Also create a return portal in the opposite corner
            const returnPortalContainer = document.createElement('div');
            returnPortalContainer.id = 'dim42-return-portal-container';
            returnPortalContainer.style.cssText = `
                position: fixed;
                width: ${200 * size}px;
                height: ${200 * size}px;
                z-index: 9998;
                pointer-events: auto;
                user-select: none;
            `;
            
            // Place in opposite corner
            switch (position) {
                case 'top-left':
                    returnPortalContainer.style.bottom = '20px';
                    returnPortalContainer.style.right = '20px';
                    break;
                case 'top-right':
                    returnPortalContainer.style.bottom = '20px';
                    returnPortalContainer.style.left = '20px';
                    break;
                case 'bottom-left':
                    returnPortalContainer.style.top = '20px';
                    returnPortalContainer.style.right = '20px';
                    break;
                case 'bottom-right':
                default:
                    returnPortalContainer.style.top = '20px';
                    returnPortalContainer.style.left = '20px';
                    break;
            }
            
            document.body.appendChild(returnPortalContainer);
            
            // Create return portal title
            const returnTitleElement = document.createElement('div');
            returnTitleElement.textContent = `Return to ${dimSource}`;
            returnTitleElement.style.cssText = `
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                color: #ff5500;
                font-family: Arial, sans-serif;
                font-size: ${16 * size}px;
                font-weight: bold;
                text-align: center;
                text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                pointer-events: none;
            `;
            returnPortalContainer.appendChild(returnTitleElement);
            
            // Create a new scene for return portal
            const returnScene = new THREE.Scene();
            const returnCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            returnCamera.position.z = 5;
            
            const returnRenderer = new THREE.WebGLRenderer({ 
                alpha: true,
                antialias: true
            });
            returnRenderer.setSize(200 * size, 200 * size);
            returnRenderer.setClearColor(0x000000, 0);
            returnPortalContainer.appendChild(returnRenderer.domElement);
            
            // Create return portal with orange color
            const returnPortalGroup = new THREE.Group();
            returnScene.add(returnPortalGroup);
            
            // Create portal spiral
            const returnSpiralGeometry = new THREE.TorusGeometry(2, 0.3, 16, 100);
            const returnSpiralMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff5500, // Orange for return portal
                transparent: true,
                opacity: 0.8
            });
            const returnSpiral = new THREE.Mesh(returnSpiralGeometry, returnSpiralMaterial);
            returnPortalGroup.add(returnSpiral);
            
            // Create portal inner effect
            const returnPortalGeometry = new THREE.CircleGeometry(1.7, 32);
            const returnPortalMaterial = new THREE.MeshBasicMaterial({
                color: 0xff5500, // Orange for return portal
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            
            // Create swirl texture
            const returnCanvas = document.createElement('canvas');
            returnCanvas.width = 512;
            returnCanvas.height = 512;
            const returnCtx = returnCanvas.getContext('2d');
            
            // Create gradient
            const returnGradient = returnCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
            
            // Orange gradient
            returnGradient.addColorStop(0, 'rgb(255, 85, 0)');
            returnGradient.addColorStop(0.5, 'rgb(178, 59, 0)');
            returnGradient.addColorStop(1, 'rgb(102, 34, 0)');
            
            returnCtx.fillStyle = returnGradient;
            returnCtx.fillRect(0, 0, 512, 512);
            
            // Create spiral pattern
            returnCtx.strokeStyle = '#ffffff';
            returnCtx.lineWidth = 2;
            for(let i = 0; i < 360; i += 30) {
                returnCtx.beginPath();
                returnCtx.arc(256, 256, i, 0, Math.PI * 2);
                returnCtx.stroke();
            }
            
            const returnTexture = new THREE.CanvasTexture(returnCanvas);
            returnPortalMaterial.map = returnTexture;
            
            const returnPortalMesh = new THREE.Mesh(returnPortalGeometry, returnPortalMaterial);
            returnPortalGroup.add(returnPortalMesh);
            
            // Add particles
            const returnParticles = [];
            for(let i = 0; i < 20; i++) {
                const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
                const particleMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff5500,
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
                
                returnPortalGroup.add(particle);
                returnParticles.push(particle);
            }
            
            // Add click event to return portal
            returnRenderer.domElement.addEventListener('click', () => {
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
                
                // Add dim_source parameter to track the return journey
                const separator = targetUrl.includes('?') ? '&' : '?';
                const returnUrl = `${targetUrl}${separator}dim_source=${encodeURIComponent(window.location.hostname)}`;
                
                // Navigate back
                window.location.href = returnUrl;
            });
            
            // Animation loop for return portal
            function animateReturnPortal() {
                requestAnimationFrame(animateReturnPortal);
                
                // Rotate portal
                returnSpiral.rotation.z -= 0.01; // Opposite direction
                
                // Rotate texture
                if (returnPortalMaterial.map) {
                    returnPortalMaterial.map.rotation -= 0.01; // Opposite direction
                    returnPortalMaterial.map.needsUpdate = true;
                }
                
                // Update particles
                returnParticles.forEach(particle => {
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
                returnPortalMaterial.opacity = 0.6 * pulse;
                returnSpiralMaterial.opacity = 0.8 * pulse;
                
                // Slowly rotate the entire portal
                returnPortalGroup.rotation.z -= 0.001; // Opposite direction
                
                returnRenderer.render(returnScene, returnCamera);
            }
            
            animateReturnPortal();
        } else {
            // If no dim_source is provided, create a hidden return portal to the current website
            // This ensures that when users click the portal, they can return to this site
            console.log("No dim_source parameter found, using current website as default source for return journey");
            
            // Store the current website hostname as a data attribute on the container
            // This will be used when creating the portal to add the dim_source parameter
            container.setAttribute('data-source-site', window.location.hostname || "current-website");
        }
    });
})(); 