export class Character {
    constructor(name, x = 0, y = 0) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.speed = 5;
    }

    move(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x, this.y, 50, 50);
    }
}
