# Dim42 Portal Component

A simple, embeddable Rick and Morty style portal component for Three.js games and websites that allows players to travel between different game worlds.

![Dim42 Portal](https://i.imgur.com/example.png)

## Features

- Easy to integrate into any Three.js game or website
- Customizable portal appearance (color, size, title)
- Animated portal effects (swirling, particles, pulsing)
- Built-in overlay for displaying external content
- Support for dim source tracking to create return portals

## Integration Options

### Option 1: Three.js Component

For Three.js games and applications, use the `Portal` class from `js/Portal.js` for full integration with your 3D scene.

### Option 2: Simple 2D Portal

For regular websites (no Three.js expertise required), use the `create2DPortal` function from `js/Portal.js` to add a floating portal anywhere on your site.

## Three.js Component Usage

1. Import the necessary components from `Portal.js`
2. Initialize the portal system
3. Create a portal in your scene
4. Add portal update and collision detection to your animation loop

```javascript
import { Portal, initPortalSystem } from './js/Portal.js';

// Initialize the portal system (adds overlay and styles)
initPortalSystem();

// Create a portal
const portal = new Portal(
    new THREE.Vector3(0, 1, 0),     // Position
    new THREE.Euler(0, 0, 0),       // Rotation
    "Enter Dim42",                  // Title
    "https://dim42.com",            // Target URL
    0x00ff77,                       // Color (green)
    1.2,                           // Size multiplier
    scene                          // Your Three.js scene
);

// In your animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (!window.isOverlayActive) {  // Don't update when overlay is shown
        // Update portal animations
        portal.update();
        
        // Check if player has entered the portal
        portal.checkCollision(
            playerPosition,
            window.isOverlayActive,
            window.lastOverlayCloseTime,
            window.OVERLAY_COOLDOWN
        );
    }
    
    renderer.render(scene, camera);
}
```

## Simple 2D Portal Usage

For regular websites, import and use the `create2DPortal` function:

```javascript
import { initPortalSystem, create2DPortal } from './js/Portal.js';

// Initialize the portal system first
initPortalSystem();

// Create a portal with custom options
create2DPortal({
    target: 'https://dim42.com',
    position: 'bottom-right',
    color: '#00ff77',
    size: 1,
    title: 'Enter Dim42'
});
```

### Available Options:

- **target**: The URL to navigate to when entering the portal (default: "https://dim42.com")
- **position**: Where to place the portal - "top-left", "top-right", "bottom-left", or "bottom-right" (default: "bottom-right")
- **color**: The color of the portal in hex format (default: "#00ff77")
- **size**: Size multiplier for the portal (default: 1)
- **title**: The title to display above the portal (default: "Enter Dim42")

## dim Source Tracking

Both integration options support dim source tracking, creating a network of interconnected portals between different games and websites.

### How It Works:

1. **Outgoing Portals**: When a user clicks a portal to visit another site, a `dim_source` parameter is automatically added to the URL:
   ```
   https://destination.com?dim_source=yoursite.com
   ```

2. **Return Portals**: When a user arrives at your site with a `dim_source` parameter:
   - A notification appears showing where they came from
   - An orange return portal is automatically created
   - The return portal takes them back to the source site

### Three.js Return Portal

For Three.js games, use the `checkDimSource` function to automatically create a return portal:

```javascript
import { Portal, initPortalSystem, checkDimSource } from './js/Portal.js';

// Initialize portal system
initPortalSystem();

// Create your portals array
const portals = [
    new Portal(/* ... portal config ... */)
];

// Check for dim_source and create return portal if needed
const returnPortalCreated = checkDimSource(portals, scene);
```

### 2D Return Portal

For websites using the 2D portal, return portals are created automatically when a `dim_source` parameter is detected in the URL. The return portal appears in the opposite corner from your main portal with an orange color.

## Testing dim Source Functionality

Both example files include a simple way to test the dim source functionality:

1. Click the "Add Test dim Source" button
2. The page will reload with a test dim parameter
3. You'll see a return portal appear (orange color)
4. You can click the return portal to go back to the "source" site

## API Reference

### Portal Class

```javascript
new Portal(position, rotation, title, url, color, sizeMultiplier, scene)
```

#### Parameters

- `position` (THREE.Vector3): Position of the portal
- `rotation` (THREE.Euler): Rotation of the portal
- `title` (string): Title to display above the portal
- `url` (string): URL to navigate to when entering the portal
- `color` (number, optional): Hex color of the portal (default: 0x00ff77 - green)
- `sizeMultiplier` (number, optional): Size multiplier for the portal (default: 1)
- `scene` (THREE.Scene): The Three.js scene to add the portal to

#### Methods

- `update()`: Update portal animations
- `checkCollision(position, isOverlayActive, lastOverlayCloseTime, OVERLAY_COOLDOWN)`: Check if player has entered the portal

### create2DPortal Function

```javascript
create2DPortal(options)
```

#### Options

- `target` (string): URL to navigate to
- `position` (string): Portal position ("top-left", "top-right", "bottom-left", "bottom-right")
- `color` (string): Hex color string
- `size` (number): Size multiplier
- `title` (string): Portal title

### Utility Functions

- `initPortalSystem()`: Initialize the portal overlay system
- `checkDimSource(portals, scene)`: Check for dim_source parameter and create return portal
- `createReturnPortal(sourceUrl, scene, portals, returnPortalCreated)`: Create a return portal manually

## Examples

- See `3d-portal-example.html` for a complete Three.js integration example
- See `2d-portal-example.html` for a simple website integration example

## License

MIT
