export class Player {
    constructor(name) {
        this.id = Math.random().toString(36).substring(7);
        this.name = name;
        this.x = 0;
        this.y = 1.5; // Start above ground
        this.z = 0;
        this.rotationY = 0;
        this.speed = 0.1;
        this.velocityY = 0;
        this.gravity = -0.005;
        this.onGround = false;
    }

    move(keys) {
        if (keys["w"]) {
            this.x -= Math.sin(this.rotationY) * this.speed;
            this.z -= Math.cos(this.rotationY) * this.speed;
        }
        if (keys["s"]) {
            this.x += Math.sin(this.rotationY) * this.speed;
            this.z += Math.cos(this.rotationY) * this.speed;
        }
        if (keys["a"]) {
            this.x -= Math.cos(this.rotationY) * this.speed;
            this.z += Math.sin(this.rotationY) * this.speed;
        }
        if (keys["d"]) {
            this.x += Math.cos(this.rotationY) * this.speed;
            this.z -= Math.sin(this.rotationY) * this.speed;
        }

        // Apply gravity
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        if (this.y <= 1.5) {
            this.y = 1.5;
            this.velocityY = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }

        // Jumping
        if (keys[" "] && this.onGround) {
            this.velocityY = 0.1;
            this.onGround = false;
        }
    }
}
