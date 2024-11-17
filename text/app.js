// Import and configure Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";

// Your Firebase configuration
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
const auth = getAuth();
const database = getDatabase(app);

// DOM elements
const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupBtn = document.getElementById("signup");
const loginBtn = document.getElementById("login");
const googleSigninBtn = document.getElementById("google-signin");
const logoutBtn = document.getElementById("logout");
const usernameDisplay = document.getElementById("username");
const addFriendBtn = document.getElementById("add-friend");
const friendUsernameInput = document.getElementById("friend-username");
const friendList = document.getElementById("friend-list");
const chatWith = document.getElementById("chat-with");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendMessageBtn = document.getElementById("send-message");

let currentChatFriend = null;

// Authentication state listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.style.display = "none";
        appContainer.style.display = "block";
        usernameDisplay.textContent = `Welcome, ${user.email}`;
        loadFriends();
    } else {
        authContainer.style.display = "block";
        appContainer.style.display = "none";
    }
});

// Signup
signupBtn.addEventListener("click", () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => alert("Signup successful!"))
        .catch((err) => alert(err.message));
});

// Login
loginBtn.addEventListener("click", () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    signInWithEmailAndPassword(auth, email, password)
        .then(() => alert("Login successful!"))
        .catch((err) => alert(err.message));
});

// Google Sign-In
googleSigninBtn.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((err) => alert(err.message));
});

// Logout
logoutBtn.addEventListener("click", () => {
    signOut(auth).catch((err) => alert(err.message));
});

// Add Friend
addFriendBtn.addEventListener("click", () => {
    const friendUsername = friendUsernameInput.value;
    const userRef = ref(database, `users/${auth.currentUser.uid}/friends`);
    push(userRef, friendUsername).then(() => {
        friendUsernameInput.value = "";
        loadFriends();
    });
});

// Load Friends
function loadFriends() {
    const userRef = ref(database, `users/${auth.currentUser.uid}/friends`);
    onValue(userRef, (snapshot) => {
        friendList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const li = document.createElement("li");
            li.textContent = childSnapshot.val();
            li.addEventListener("click", () => {
                currentChatFriend = childSnapshot.val();
                chatWith.textContent = `Chat with: ${currentChatFriend}`;
                loadMessages();
            });
            friendList.appendChild(li);
        });
    });
}

// Send Message
sendMessageBtn.addEventListener("click", () => {
    if (currentChatFriend) {
        const chatRef = ref(database, `chats/${auth.currentUser.uid}_${currentChatFriend}`);
        push(chatRef, {
            sender: auth.currentUser.email,
            text: messageInput.value,
        });
        messageInput.value = "";
    }
});

// Load Messages
function loadMessages() {
    const chatRef =
