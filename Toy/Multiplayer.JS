export class Multiplayer {
    constructor() {
        this.players = {};
    }

    connect() {
        console.log("Connecting to multiplayer...");
        // Initialize WebSockets or Firebase here
    }

    updatePlayer(id, data) {
        if (!this.players[id]) return;
        this.players[id].x = data.x;
        this.players[id].y = data.y;
    }

    addPlayer(id, player) {
        this.players[id] = player;
    }

    removePlayer(id) {
        delete this.players[id];
    }
}
