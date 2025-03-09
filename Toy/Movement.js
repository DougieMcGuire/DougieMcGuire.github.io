export class Movement {
    constructor(character) {
        this.character = character;
        this.keys = {};
        window.addEventListener("keydown", (e) => (this.keys[e.key] = true));
        window.addEventListener("keyup", (e) => (this.keys[e.key] = false));
    }

    update() {
        let dx = 0, dy = 0;
        if (this.keys["ArrowLeft"]) dx = -1;
        if (this.keys["ArrowRight"]) dx = 1;
        if (this.keys["ArrowUp"]) dy = -1;
        if (this.keys["ArrowDown"]) dy = 1;
        this.character.move(dx, dy);
    }
}
