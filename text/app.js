// Firebase configurations
const authConfig = {
  apiKey: "AIzaSyAg0n2RMCxZjBMGjPOXJarolggd7CtTbAw",
  authDomain: "auth-5d180.firebaseapp.com",
  projectId: "auth-5d180",
  storageBucket: "auth-5d180.firebasestorage.app",
  messagingSenderId: "189598882429",
  appId: "1:189598882429:web:ffc83a4d0c9d6d9e636f14",
  measurementId: "G-M2LH2Z0PTB"
};

  const chatConfig = {
    apiKey: "AIzaSyAg0n2RMCxZjBMGjPOXJarolggd7CtTbAw",
    authDomain: "auth-5d180.firebaseapp.com",
    projectId: "auth-5d180",
    storageBucket: "auth-5d180.firebasestorage.app",
    messagingSenderId: "189598882429",
    appId: "1:189598882429:web:ffc83a4d0c9d6d9e636f14",
    measurementId: "G-M2LH2Z0PTB"
  };

// Initialize Firebase apps
const authApp = firebase.initializeApp(authConfig);
const chatApp = firebase.initializeApp(chatConfig, 'chat');

// Get Firestore instances
const authDb = authApp.firestore();
const chatDb = chatApp.firestore();

let currentUser = null;
let currentChatId = null;

// Auth functions
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    authApp.auth().signInWithPopup(provider)
        .then(handleSignInSuccess)
        .catch(error => console.error('Error signing in with Google:', error));
}

function signInWithEmail() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    authApp.auth().signInWithEmailAndPassword(email, password)
        .then(handleSignInSuccess)
        .catch(error => console.error('Error signing in with email:', error));
}

function registerWithEmail() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    authApp.auth().createUserWithEmailAndPassword(email, password)
        .then(async (userCredential) => {
            // Create user profile
            const username = email.split('@')[0]; // Default username
            await authDb.collection('users').doc(userCredential.user.uid).set({
                email: email,
                username: username,
                friends: []
            });
            handleSignInSuccess(userCredential);
        })
        .catch(error => console.error('Error registering:', error));
}

async function handleSignInSuccess(userCredential) {
    currentUser = userCredential.user;
    const userDoc = await authDb.collection('users').doc(currentUser.uid).get();
    
    if (!userDoc.exists) {
        // Create profile if it doesn't exist (for Google sign-in)
        const username = currentUser.email.split('@')[0];
        await authDb.collection('users').doc(currentUser.uid).set({
            email: currentUser.email,
            username: username,
            friends: []
        });
    }
    
    showAppScreen();
    loadFriends();
}

function signOut() {
    authApp.auth().signOut()
        .then(() => {
            currentUser = null;
            showLoginScreen();
        })
        .catch(error => console.error('Error signing out:', error));
}

// UI functions
function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('hidden');
}

function showAppScreen() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    loadUserInfo();
}

async function loadUserInfo() {
    const userDoc = await authDb.collection('users').doc(currentUser.uid).get();
    const userData = userDoc.data();
    document.getElementById('username').textContent = userData.username;
}

// Friends management
async function addFriend() {
    const friendUsername = document.getElementById('friendUsername').value;
    if (!friendUsername) return;

    try {
        // Find user by username
        const usersSnapshot = await authDb.collection('users')
            .where('username', '==', friendUsername)
            .get();

        if (usersSnapshot.empty) {
            alert('User not found');
            return;
        }

        const friendData = usersSnapshot.docs[0];
        const currentUserDoc = authDb.collection('users').doc(currentUser.uid);
        
        // Add to friends list
        await currentUserDoc.update({
            friends: firebase.firestore.FieldValue.arrayUnion(friendData.id)
        });

        loadFriends();
        document.getElementById('friendUsername').value = '';
    } catch (error) {
        console.error('Error adding friend:', error);
    }
}

async function loadFriends() {
    const userDoc = await authDb.collection('users').doc(currentUser.uid).get();
    const userData = userDoc.data();
    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = '';

    for (const friendId of userData.friends) {
        const friendDoc = await authDb.collection('users').doc(friendId).get();
        const friendData = friendDoc.data();
        
        const friendElement = document.createElement('div');
        friendElement.className = 'friend-item';
        friendElement.textContent = friendData.username;
        friendElement.onclick = () => openChat(friendId);
        friendsList.appendChild(friendElement);
    }
}

// Chat functions
async function openChat(friendId) {
    const chatId = [currentUser.uid, friendId].sort().join('_');
    currentChatId = chatId;
    
    // Clear previous messages
    document.getElementById('messages').innerHTML = '';
    
    // Show friend's username in chat header
    const friendDoc = await authDb.collection('users').doc(friendId).get();
    const friendData = friendDoc.data();
    document.getElementById('chatHeader').textContent = friendData.username;
    
    // Listen for messages
    chatDb.collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp')
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    displayMessage(change.doc.data());
                }
            });
        });
}

async function sendMessage() {
    if (!currentChatId) return;
    
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (!message) return;
    
    try {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        await chatDb.collection('chats')
            .doc(currentChatId)
            .collection('messages')
            .add({
                sender: currentUser.uid,
                text: message,
                timestamp: timestamp
            });
        
        messageInput.value = '';
        
        // Schedule message deletion after 24 hours
        setTimeout(async () => {
            const messagesRef = chatDb.collection('chats')
                .doc(currentChatId)
                .collection('messages');
            
            const oldMessages = await messagesRef
                .where('timestamp', '<=', new Date(Date.now() - 24 * 60 * 60 * 1000))
                .get();
            
            oldMessages.forEach(doc => doc.ref.delete());
        }, 24 * 60 * 60 * 1000);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function displayMessage(messageData) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${messageData.sender === currentUser.uid ? 'sent' : 'received'}`;
    messageElement.textContent = messageData.text;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Initialize auth state observer
authApp.auth().onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        showAppScreen();
        loadFriends();
    } else {
        showLoginScreen();
    }
});
