import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, query, limitToLast } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCS08ARvKhKc-fgK2WInmLrVpkbUJ-DBYg",
  authDomain: "chat-apii.firebaseapp.com",
  databaseURL: "https://chat-apii-default-rtdb.firebaseio.com",
  projectId: "chat-apii",
  storageBucket: "chat-apii.firebasestorage.app",
  messagingSenderId: "1030242819289",
  appId: "1:1030242819289:web:8adbd8916c9d06aea332c8",
  measurementId: "G-NKV4WVYK68"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM Elements
const cameraModal = document.getElementById("cameraModal");
const video = document.getElementById("video");
const photoCanvas = document.getElementById("photoCanvas");
const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const loginStatus = document.getElementById("loginStatus");
const loginBtn = document.getElementById("loginBtn");

// Camera variables
let stream = null;
let currentFacingMode = "user";

// Fabric.js canvas
let fabricCanvas = null;

// Firebase Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginStatus.textContent = `Logged in as ${user.displayName}`;
    loginBtn.textContent = "Logout";
    loadMessages();
  } else {
    loginStatus.textContent = "Not logged in";
    loginBtn.textContent = "Login with Google";
  }
});

// Login/Logout functionality
loginBtn.addEventListener("click", async () => {
  if (auth.currentUser) {
    await auth.signOut();
  } else {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Auth error:", error);
      alert("Login failed. Please try again.");
    }
  }
});

// Initialize camera
async function initCamera() {
  try {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacingMode },
    });

    video.srcObject = stream;
    cameraModal.style.display = "block";
    resetCameraUI();
  } catch (err) {
    console.error("Camera error:", err);
    alert("Could not access camera. Please check permissions.");
  }
}

// Reset camera UI
function resetCameraUI() {
  video.style.display = "block";
  photoCanvas.style.display = "none";
  document.getElementById("editContainer").style.display = "none";
  document.getElementById("captureTools").style.display = "block";
  document.getElementById("editTools").style.display = "none";
}

// Switch camera
document.getElementById("switchCameraBtn").addEventListener("click", () => {
  currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
  initCamera();
});

// Capture photo
document.getElementById("snapBtn").addEventListener("click", () => {
  const context = photoCanvas.getContext("2d");
  context.drawImage(video, 0, 0, 640, 480);

  video.style.display = "none";
  document.getElementById("editContainer").style.display = "block";
  document.getElementById("captureTools").style.display = "none";
  document.getElementById("editTools").style.display = "flex";

  initFabricCanvas();
});

// Fabric.js canvas setup
function initFabricCanvas() {
  if (fabricCanvas) {
    fabricCanvas.dispose();
  }

  const container = document.getElementById("fabricContainer");
  container.innerHTML = '<canvas id="editCanvas" width="640" height="480"></canvas>';

  fabricCanvas = new fabric.Canvas("editCanvas", {
    isDrawingMode: false,
    backgroundColor: "transparent",
  });
}

// Drawing mode toggle
document.getElementById("drawBtn").addEventListener("click", () => {
  fabricCanvas.isDrawingMode = !fabricCanvas.isDrawingMode;
  document.getElementById("drawBtn").style.background = fabricCanvas.isDrawingMode
    ? "#00ff00"
    : "#0084ff";
});

// Add text
document.getElementById("addTextBtn").addEventListener("click", () => {
  const text = new fabric.IText("Tap to edit", {
    left: 50,
    top: 50,
    fontFamily: "Arial",
    fill: document.getElementById("colorPicker").value,
    fontSize: 30,
  });
  fabricCanvas.add(text);
});

// Undo functionality
document.getElementById("undoBtn").addEventListener("click", () => {
  const objects = fabricCanvas.getObjects();
  if (objects.length > 0) {
    fabricCanvas.remove(objects[objects.length - 1]);
  }
});

// Send photo to Firebase
async function sendPhoto() {
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = 640;
  finalCanvas.height = 480;

  const ctx = finalCanvas.getContext("2d");
  ctx.drawImage(photoCanvas, 0, 0);

  // Add fabric.js edits
  const fabricBlob = await new Promise((resolve) =>
    fabricCanvas.toBlob((blob) => resolve(blob))
  );
  const fabricURL = URL.createObjectURL(fabricBlob);

  const img = new Image();
  img.onload = async () => {
    ctx.drawImage(img, 0, 0);

    const finalImage = finalCanvas.toDataURL("image/jpeg", 0.7);
    await sendMessage(finalImage, "image");
  };
  img.src = fabricURL;
}

// Message sending
async function sendMessage(content, type) {
  if (!auth.currentUser) {
    alert("Please login first.");
    return;
  }

  const messageRef = ref(database, "messages");
  await push(messageRef, {
    uid: auth.currentUser.uid,
    name: auth.currentUser.displayName,
    content,
    type,
    timestamp: Date.now(),
  });
}

// Load messages from Firebase
function loadMessages() {
  const messagesQuery = query(ref(database, "messages"), limitToLast(50));
  onChildAdded(messagesQuery, (snapshot) => {
    const message = snapshot.val();
    displayMessage(message);
  });
}

// Display message
function displayMessage(message) {
  const div = document.createElement("div");
  div.className = message.uid === auth.currentUser?.uid ? "sent" : "received";

  if (message.type === "image") {
    const img = document.createElement("img");
    img.src = message.content;
    div.appendChild(img);
  } else {
    div.textContent = message.content;
  }

  messagesContainer.appendChild(div);
}

// Close camera
document.getElementById("closeCamera").addEventListener("click", () => {
  cameraModal.style.display = "none";
  if (stream) stream.getTracks().forEach((track) => track.stop());
});
