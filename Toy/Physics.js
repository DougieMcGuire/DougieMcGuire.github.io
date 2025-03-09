export class Player {
    constructor(name) {
        this.id = Math.random().toString(36).substring(7);
        this.name = name;
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.speed = 5;
    }

    move(keys) {
        if (keys["w"]) this.y -= this.speed;
        if (keys["s"]) this.y += this.speed;
        if (keys["a"]) this.x -= this.speed;
        if (keys["d"]) this.x += this.speed;
    }
}
