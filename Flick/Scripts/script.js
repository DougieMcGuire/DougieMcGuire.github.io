import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, query, limitToLast } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCa026-T60VjqfvYAtDrh_uUfgLkVa80WU",
  authDomain: "flickapi.firebaseapp.com",
  databaseURL: "https://flickapi-default-rtdb.firebaseio.com",
  projectId: "flickapi",
  storageBucket: "flickapi.appspot.com",
  messagingSenderId: "605379013848",
  appId: "1:605379013848:web:0e58360df6726849d87bad",
  measurementId: "G-X4NDYQBFF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM Elements
const cameraModal = document.getElementById('cameraModal');
const video = document.getElementById('video');
const photoCanvas = document.getElementById('photoCanvas');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const loginStatus = document.getElementById('loginStatus');

let fabricCanvas;
let stream;
let currentFacingMode = 'user';

// Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginStatus.textContent = `Logged in as ${user.displayName}`;
        loginBtn.textContent = 'Logout';
        loadMessages();
    } else {
        loginStatus.textContent = 'Not logged in';
        loginBtn.textContent = 'Login with Google';
    }
});

// Login/Logout
document.getElementById('loginBtn').addEventListener('click', async () => {
    if (auth.currentUser) {
        await auth.signOut();
    } else {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Auth error:', error);
            alert('Login failed. Please try again.');
        }
    }
});

// Camera initialization
async function initCamera() {
    try {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode }
        });
        video.srcObject = stream;
        cameraModal.style.display = 'block';
        video.style.display = 'block';
        photoCanvas.style.display = 'none';
        document.getElementById('editContainer').style.display = 'none';
        document.getElementById('captureTools').style.display = 'block';
        document.getElementById('editTools').style.display = 'none';
    } catch (err) {
        console.error('Camera error:', err);
        alert('Could not access camera. Please check permissions.');
    }
}

// Switch camera
document.getElementById('switchCameraBtn').addEventListener('click', () => {
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    initCamera();
});

// Take photo
document.getElementById('snapBtn').addEventListener('click', () => {
    const context = photoCanvas.getContext('2d');
    context.drawImage(video, 0, 0, photoCanvas.width, photoCanvas.height);
    video.style.display = 'none';
    photoCanvas.style.display = 'block';
    document.getElementById('captureTools').style.display = 'none';
    document.getElementById('editTools').style.display = 'flex';

    initFabricCanvas();
});

// Add text to photo
document.getElementById('addTextBtn').addEventListener('click', () => {
    const text = new fabric.Textbox('Edit me', {
        left: 50,
        top: 50,
        fontSize: 24,
        fill: document.getElementById('colorPicker').value,
    });
    fabricCanvas.add(text).setActiveObject(text);
});

// Drawing tool
document.getElementById('drawBtn').addEventListener('click', () => {
    fabricCanvas.isDrawingMode = !fabricCanvas.isDrawingMode;
    fabricCanvas.freeDrawingBrush.color = document.getElementById('colorPicker').value;
    document.getElementById('drawBtn').textContent = fabricCanvas.isDrawingMode ? 'Stop Drawing' : 'Draw';
});

// Undo
document.getElementById('undoBtn').addEventListener('click', () => {
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
        fabricCanvas.remove(activeObject);
    }
});

// Send photo
document.getElementById('sendPhotoBtn').addEventListener('click', () => {
    const image = fabricCanvas.toDataURL('image/png');
    sendMessage({ image });
    closeCameraModal();
});

// Retake photo
document.getElementById('retakeBtn').addEventListener('click', () => {
    initCamera();
});

// Close camera modal
document.getElementById('closeCamera').addEventListener('click', closeCameraModal);

// Message send
document.getElementById('sendBtn').addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (text) {
        sendMessage({ text });
        messageInput.value = '';
    }
});

// Load messages from Firebase
function loadMessages() {
    const messagesRef = query(ref(database, 'messages'), limitToLast(20));
    onChildAdded(messagesRef, (snapshot) => {
        const message = snapshot.val();
        addMessageToChat(message);
    });
}

// Send message to Firebase
function sendMessage(message) {
    if (auth.currentUser) {
        push(ref(database, 'messages'), {
            user: auth.currentUser.displayName,
            ...message,
            timestamp: Date.now(),
        });
    } else {
        alert('Please log in to send messages.');
    }
}

// Add message to chat
function addMessageToChat(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(auth.currentUser && message.user === auth.currentUser.displayName ? 'sent' : 'received');

    if (message.text) {
        div.textContent = message.text;
    } else if (message.image) {
        const img = document.createElement('img');
        img.src = message.image;
        div.appendChild(img);
    }

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// Initialize Fabric.js canvas for editing
function initFabricCanvas() {
    fabricCanvas = new fabric.Canvas('photoCanvas', {
        isDrawingMode: false,
        width: photoCanvas.width,
        height: photoCanvas.height,
    });
    fabricCanvas.setBackgroundImage(photoCanvas.toDataURL(), fabricCanvas.renderAll.bind(fabricCanvas));
}

// Close camera modal
function closeCameraModal() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    cameraModal.style.display = 'none';
}
