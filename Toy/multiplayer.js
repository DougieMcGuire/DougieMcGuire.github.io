import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB4Sa8mLb2lLpmrrMM9bX_loiTS3MYul14",
    authDomain: "toydemo-341bc.firebaseapp.com",
    databaseURL: "https://toydemo-341bc-default-rtdb.firebaseio.com",
    projectId: "toydemo-341bc",
    storageBucket: "toydemo-341bc.firebasestorage.app",
    messagingSenderId: "843712244489",
    appId: "1:843712244489:web:8474efba9732edda7fc1d8",
    measurementId: "G-QQRZQR4HZK"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const playersRef = ref(db, "players");

let playerId;
let players = {};

export function initMultiplayer(player) {
    playerId = player.id;
    
    // Store player position & rotation in Firebase
    set(ref(db, `players/${playerId}`), {
        x: player.x,
        y: player.y,
        z: player.z,
        rotationY: player.rotationY
    });

    // Listen for updates from other players
    onValue(playersRef, (snapshot) => {
        players = snapshot.val() || {};
    });

    // Update player position in database every 100ms
    setInterval(() => {
        if (players[playerId]) {
            set(ref(db, `players/${playerId}`), {
                x: player.x,
                y: player.y,
                z: player.z,
                rotationY: player.rotationY
            });
        }
    }, 100);
}

// Get all players
export function getPlayers() {
    return players;
}
