import * as THREE from 'three';

// Define portal configurations
const portalConfigs = [
    {
        position: new THREE.Vector3(-8, 0, -8),
        rotation: new THREE.Euler(0, 0.5, 0),
        title: "2048",
        url: "https://arcadefun.vercel.app/game/2048",
        color: 0x00ff77,
        sizeMultiplier: 1.0
    },
    {
        position: new THREE.Vector3(0, 0, -12),
        rotation: new THREE.Euler(0, 0, 0),
        title: "Fly Pieter",
        url: "https://fly.pieter.com/",
        color: 0x00ff77,
        sizeMultiplier: 1.0
    },
    {
        position: new THREE.Vector3(8, 0, -8),
        rotation: new THREE.Euler(0, -0.5, 0),
        title: "Flappy Bird",
        url: "https://arcadefun.vercel.app/game/flappybird",
        color: 0x00ff77,
        sizeMultiplier: 1.0
    },
    {
        position: new THREE.Vector3(10, 0, -2),
        rotation: new THREE.Euler(0, -1.0, 0),
        title: "Pacman",
        url: "https://arcadefun.vercel.app/game/pacman",
        color: 0x00ff77,
        sizeMultiplier: 1.0
    },
    {
        position: new THREE.Vector3(10, 0, 5),
        rotation: new THREE.Euler(0, -1.5, 0),
        title: "Hot Air Vibe",
        url: "https://www.hotairvibe.com/",
        color: 0x00ff77,
        sizeMultiplier: 1.0
    },
    {
        position: new THREE.Vector3(5, 0, 10),
        rotation: new THREE.Euler(0, -2.0, 0),
        title: "Vibe Sail",
        url: "https://vibesail.com/",
        color: 0x00ff77,
        sizeMultiplier: 1.0
    },
    {
        position: new THREE.Vector3(-10, 0, -2),
        rotation: new THREE.Euler(0, 1.0, 0),
        title: "Submit New Portal",
        url: "https://tally.so/r/wgvvPJ",
        color: 0xff0000,  // Red color for the submission portal
        sizeMultiplier: 1.0
    }
];

export default portalConfigs; 