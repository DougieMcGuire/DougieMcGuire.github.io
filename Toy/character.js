import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.136/build/three.module.js';

export class Player {
    constructor(scene) {
        this.scene = scene;

        // Create a simple human-like character
        this.body = new THREE.Group();

        // Torso
        const torsoGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
        const torsoMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 1.2;
        this.body.add(torso);

        // Head
        const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffccaa });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        this.body.add(head);

        // Arms
        const armGeometry = new THREE.BoxGeometry(0.3, 0.7, 0.3);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

        this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.leftArm.position.set(-0.65, 1.3, 0);
        this.body.add(this.leftArm);

        this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        this.rightArm.position.set(0.65, 1.3, 0);
        this.body.add(this.rightArm);

        // Attach to scene
        scene.add(this.body);
    }

    updatePosition(x, y, z) {
        this.body.position.set(x, y, z);
    }
}
