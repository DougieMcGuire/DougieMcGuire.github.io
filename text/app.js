// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";

// Firebase Configuration
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

// Elements
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

let currentUser = null;
let currentChatFriend = null;

// Helper to switch UI
function showApp() {
    authContainer.style.display = "none";
    appContainer.style.display = "block";
}

// Signup
signupBtn.addEventListener("click", () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            currentUser = userCredential.user;
            showApp();
        })
        .catch(console.error);
});

// Login
loginBtn.addEventListener("click", () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            currentUser = userCredential.user;
            showApp();
        })
        .catch(console.error);
});

// Google Sign-In
googleSigninBtn.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
        .then(result => {
            currentUser = result.user;
            showApp();
        })
        .catch(console.error);
});

// Logout
logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
        currentUser = null;
        authContainer.style.display = "block";
        appContainer.style.display = "none";
    });
});

// Add Friend
addFriendBtn.addEventListener("click", () => {
    const friendUsername = friendUsernameInput.value;
    const friendsRef = ref(database, `users/${currentUser.uid}/friends`);
    push(friendsRef, friendUsername);
    friendUsernameInput.value = "";
});

// Load Friends
onValue(ref(database, `users/${currentUser?.uid}/friends`), snapshot => {
    friendList.innerHTML = "";
    snapshot.forEach(childSnapshot => {
        const li = document.createElement("li");
        li.textContent = childSnapshot.val();
        friendList.appendChild(li);

        li.addEventListener("click", () => {
            currentChatFriend = childSnapshot.val();
            chatWith.textContent = `Chat with: ${currentChatFriend}`;
        });
    });
});

// Send Message
sendMessageBtn.addEventListener("click", () => {
    const text = messageInput.value;
    if (currentChatFriend) {
        const chatRef = ref(database, `chats/${currentUser.uid}_${currentChatFriend}`);
        push(chatRef, { sender: currentUser.uid, text });
        messageInput.value = "";
    }
});

// Load Messages
onValue(ref(database, `chats/${currentUser.uid}_${currentChatFriend}`), snapshot => {
    messages.innerHTML = "";
    snapshot.forEach(childSnapshot => {
        const li = document.createElement("li");
        li.textContent = childSnapshot.val().text;
        messages.appendChild(li);
    });
});
