export class Physics {
    constructor(gravity = 0.5) {
        this.gravity = gravity;
    }

    applyGravity(character) {
        character.y += this.gravity;
    }

    checkCollision(character, groundLevel) {
        if (character.y > groundLevel) {
            character.y = groundLevel;
        }
    }
}
