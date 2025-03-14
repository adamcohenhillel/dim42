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

For Three.js games and applications, use the `embed/3d-portal-embed.js` component for full integration with your 3D scene.

### Option 2: Simple Script

For regular websites (no Three.js required), use the `embed/2d-portal-embed.js` to add a floating portal anywhere on your site.

## Three.js Component Usage

1. Include the `embed/3d-portal-embed.js` file in your project
2. Make sure Three.js is available globally (`window.THREE = THREE`)
3. Create a portal in your scene
4. Add portal update and collision detection to your animation loop

```javascript
// Create a portal
const portal = new Dim42Portal(
    scene,                          // Your Three.js scene
    new THREE.Vector3(0, 1, 0),     // Position
    new THREE.Euler(0, 0, 0),       // Rotation
    "Enter Dim42",                  // Title
    "https://dim42.com",            // Target URL
    0x00ff77,                       // Color (green)
    { size: 1 }                     // Options
);

// In your animation loop
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    
    // Update portal animations
    portal.update(delta);
    
    // Check if player has entered the portal
    portal.checkCollision(playerPosition);
    
    renderer.render(scene, camera);
}
```

## Simple Script Usage

For regular websites, simply include the script tag with optional data attributes:

```html
<script 
    src="embed/2d-portal-embed.js" 
    data-target="https://dim42.com" 
    data-position="bottom-right" 
    data-color="#00ff77"
    data-size="1"
    data-title="Enter Dim42">
</script>
```

### Available Options:

- **data-target**: The URL to navigate to when entering the portal (default: "https://dim42.com")
- **data-position**: Where to place the portal - "top-left", "top-right", "bottom-left", or "bottom-right" (default: "bottom-right")
- **data-color**: The color of the portal in hex format (default: "#00ff77")
- **data-size**: Size multiplier for the portal (default: 1)
- **data-title**: The title to display above the portal (default: "Enter Dim42")

## dim Source Tracking

Both integration options support dim source tracking, creating a network of interconnected portals between different games and websites.

### How It Works:

1. **Outgoing Portals**: When a user clicks a portal to visit another site, a `dim_source` parameter is automatically added to the URL:
   ```
   https://destination.com?dim_source=yoursite.com
   ```

2. **Return Portals**: When a user arrives at your site with a `dim_source` parameter:
   - A notification appears showing where they came from
   - A blue return portal is automatically created
   - The return portal takes them back to the source site

### Three.js Return Portal

For Three.js games, use the `createdimSourcePortal` helper function to automatically create a return portal:

```javascript
// Create a portal back to the source game
const dimPortal = createdimSourcePortal(scene, {
    position: new THREE.Vector3(-5, 1, 0),
    rotation: new THREE.Euler(0, Math.PI / 4, 0),
    color: 0x0088ff,  // Blue color for return portals
    size: 0.8
});

// Check if a return portal was created
if (dimPortal) {
    console.log("Created return portal to:", dimPortal.url);
}
```

### Website Return Portal

For regular websites using the simple script, return portals are created automatically when a `dim_source` parameter is detected in the URL. The return portal appears in the opposite corner from your main portal with a blue color.

## Testing dim Source Functionality

Both example files include a simple way to test the dim source functionality:

1. Click the "Add Test dim Source" button
2. The page will reload with a test dim parameter
3. You'll see a return portal appear (blue color)
4. You can click the return portal to go back to the "source" site

### Testing in the Main App

The main Dim42 application includes a dedicated "Test dim Source" button on the intro screen:

1. Click the blue "Test dim Source" button on the intro screen
2. A new tab will open with the same app but with a `dim_source=test-portal` parameter
3. You'll see a notification indicating you arrived through a portal
4. A blue return portal will appear at position (-5, 0, -5)
5. You can enter this portal to return to the "source" site

When a user arrives via a dim source:
- A notification appears at the top of the screen showing the source
- The notification includes a link to the source if it's a valid URL
- A blue return portal is automatically created in the scene

## API Reference

### Dim42Portal

```javascript
new Dim42Portal(scene, position, rotation, title, targetUrl, color, options)
```

#### Parameters

- `scene` (THREE.Scene): The Three.js scene to add the portal to
- `position` (THREE.Vector3): Position of the portal
- `rotation` (THREE.Euler): Rotation of the portal
- `title` (string): Title to display above the portal
- `targetUrl` (string, optional): URL to navigate to when entering the portal (default: "https://dim42.com")
- `color` (number, optional): Hex color of the portal (default: 0x00ff77 - green)
- `options` (object, optional): Additional options
  - `addOverlay` (boolean): Whether to add the overlay HTML (default: true)
  - `addFontLoader` (boolean): Whether to add the FontLoader (default: true)
  - `size` (number): Size multiplier for the portal (default: 1)

#### Methods

- `update(deltaTime)`: Update portal animations
- `checkCollision(playerPosition)`: Check if player has entered the portal
- `dispose()`: Remove the portal from the scene and clean up resources

### createdimSourcePortal

```javascript
createdimSourcePortal(scene, options)
```

#### Parameters

- `scene` (THREE.Scene): The Three.js scene to add the portal to
- `options` (object, optional): Options for the portal
  - `position` (THREE.Vector3): Position of the portal
  - `rotation` (THREE.Euler): Rotation of the portal
  - `title` (string): Title to display above the portal
  - `targetUrl` (string): URL to navigate to when entering the portal
  - `color` (number): Hex color of the portal
  - `size` (number): Size multiplier for the portal

#### Returns

- `Dim42Portal` or `null`: The created portal or null if no dim_source was found

## Examples

- See `3d-portal-example.html` for a complete Three.js integration example
- See `2d-portal-example.html` for a simple website integration example

## License

MIT
