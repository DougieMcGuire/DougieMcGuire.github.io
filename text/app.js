// Initialize Firebase apps
const authApp = firebase.initializeApp(authConfig);
const chatApp = firebase.initializeApp(chatConfig, 'chat');

// Get Firestore instances
const authDb = authApp.firestore();
const chatDb = chatApp.firestore();

let currentUser = null;
let currentChatId = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');
const googleSignInBtn = document.getElementById('googleSignIn');
const emailSignInBtn = document.getElementById('emailSignIn');
const emailRegisterBtn = document.getElementById('emailRegister');
const signOutBtn = document.getElementById('signOutBtn');
const addFriendBtn = document.getElementById('addFriendBtn');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const messageInput = document.getElementById('messageInput');

// Event Listeners
googleSignInBtn.addEventListener('click', signInWithGoogle);
emailSignInBtn.addEventListener('click', signInWithEmail);
emailRegisterBtn.addEventListener('click', registerWithEmail);
signOutBtn.addEventListener('click', signOut);
addFriendBtn.addEventListener('click', addFriend);
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Auth functions
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    authApp.auth().signInWithPopup(provider)
        .then(handleSignInSuccess)
        .catch(error => alert('Error signing in with Google: ' + error.message));
}

function signInWithEmail() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    authApp.auth().signInWithEmailAndPassword(email, password)
        .then(handleSignInSuccess)
        .catch(error => alert('Error signing in: ' + error.message));
}

function registerWithEmail() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    authApp.auth().createUserWithEmailAndPassword(email, password)
        .then(async (userCredential) => {
            const username = email.split('@')[0]; // Default username
            try {
                await authDb.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    username: username,
                    friends: []
                });
                handleSignInSuccess(userCredential);
            } catch (error) {
                alert('Error creating profile: ' + error.message);
            }
        })
        .catch(error => alert('Error registering: ' + error.message));
}

async function handleSignInSuccess(userCredential) {
    currentUser = userCredential.user;
    try {
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
    } catch (error) {
        alert('Error loading user profile: ' + error.message);
    }
}

function signOut() {
    authApp.auth().signOut()
        .then(() => {
            currentUser = null;
            showLoginScreen();
        })
        .catch(error => alert('Error signing out: ' + error.message));
}

// UI functions
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
}

function showAppScreen() {
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    loadUserInfo();
}

async function loadUserInfo() {
    try {
        const userDoc = await authDb.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        document.getElementById('username').textContent = userData.username;
    } catch (error) {
        alert('Error loading user info: ' + error.message);
    }
}

// Friends management
async function addFriend() {
    const friendUsername = document.getElementById('friendUsername').value;
    if (!friendUsername) {
        alert('Please enter a username');
        return;
    }

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
        
        // Don't add yourself
        if (friendData.id === currentUser.uid) {
            alert('You cannot add yourself as a friend');
            return;
        }

        const currentUserDoc = authDb.collection('users').doc(currentUser.uid);
        
        // Add to friends list
        await currentUserDoc.update({
            friends: firebase.firestore.FieldValue.arrayUnion(friendData.id)
        });

        loadFriends();
        document.getElementById('friendUsername').value = '';
        alert('Friend added successfully!');
    } catch (error) {
        alert('Error adding friend: ' + error.message);
    }
}

async function loadFriends() {
    try {
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
    } catch (error) {
        alert('Error loading friends: ' + error.message);
    }
}

// Chat functions
async function openChat(friendId) {
    const chatId = [currentUser.uid, friendId].sort().join('_');
    currentChatId = chatId;
    
    try {
        // Clear previous messages
        document.getElementById('messages').innerHTML = '';
        
        // Show friend's username in chat header
        const friendDoc = await authDb.collection('users').doc(friendId).get();
        const friendData = friendDoc.data();
        document.getElementById('chatHeader').textContent = `Chat with ${friendData.username}`;
        
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
    } catch (error) {
        alert('Error opening chat: ' + error.message);
    }
}

async function sendMessage() {
    if (!currentChatId) {
        alert('Please select a friend to chat with first');
        return;
    }
    
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
            try {
                const messagesRef = chatDb.collection('chats')
                    .doc(currentChatId)
                    .collection('messages');
                
                const oldMessages = await messagesRef
                    .where('timestamp', '<=', new Date(Date.now() - 24 * 60 * 60 * 1000))
                    .get();
                
                oldMessages.forEach(doc => doc.ref.delete());
            } catch (error) {
                console.error('Error deleting old messages:', error);
            }
        }, 24 * 60 * 60 * 1000);
    } catch (error) {
        alert('Error sending message: ' + error.message);
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
