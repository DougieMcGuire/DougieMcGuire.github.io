// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCB1DU7DtkswEU_9vs0tFxKlX1nN7ovkQc",
  authDomain: "globallyapi-c3088.firebaseapp.com",
  projectId: "globallyapi-c3088",
  storageBucket: "globallyapi-c3088.firebasestorage.app",
  messagingSenderId: "489666785193",
  appId: "1:489666785193:web:a3027c53685758e9a99eb8",
  measurementId: "G-636R3YJQ6B",
};

firebase.initializeApp(firebaseConfig);

const ChatModule = (() => {
  const db = firebase.database();
  const auth = firebase.auth();
  let currentChat = null;

  // Helper to save user profile data
  const saveUserProfile = async (user, username) => {
    try {
      const profileData = {
        email: user.email,
        username: username || user.email.split("@")[0],
        friends: {}, // Initialize empty friends list
        friendRequests: {}, // Pending requests
      };
      await db.ref(`users/${user.uid}`).set(profileData);
      console.log("User profile saved:", profileData);
    } catch (error) {
      console.error("Error saving user profile:", error);
    }
  };

  // Sign up a new user
  const signUp = async (email, password, username) => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (username) {
        await user.updateProfile({ displayName: username });
      }

      await saveUserProfile(user, username);
      console.log("User signed up:", user);
      return user;
    } catch (error) {
      console.error("Error signing up:", error);
      alert(error.message);
    }
  };

  // Sign in an existing user
  const signIn = async (email, password) => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      console.log("User signed in:", userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in:", error);
      alert(error.message);
    }
  };

  // Send a message to the current chat
  const sendMessage = async (message) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not signed in.");
      if (!currentChat) throw new Error("No active chat selected.");

      const timestamp = Date.now();
      const messageData = {
        from: currentUser.displayName,
        message,
        timestamp,
      };

      await db.ref(`chatrooms/${currentChat}`).push(messageData);
      console.log("Message sent:", messageData);
    } catch (error) {
      console.error("Error sending message:", error);
      alert(error.message);
    }
  };

  // Listen for messages in the current chat
  const listenForMessages = (callback) => {
    if (!currentChat) {
      console.error("No active chat selected.");
      return;
    }

    db.ref(`chatrooms/${currentChat}`).on("child_added", (snapshot) => {
      callback(snapshot.val());
    });
  };

  // Send a friend request
  const sendFriendRequest = async (username) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not signed in.");

      const snapshot = await db.ref("users").orderByChild("username").equalTo(username).once("value");
      if (!snapshot.exists()) throw new Error("User not found.");

      const recipientId = Object.keys(snapshot.val())[0];
      await db.ref(`users/${recipientId}/friendRequests/${currentUser.uid}`).set({
        from: currentUser.displayName,
      });

      console.log(`Friend request sent to: ${username}`);
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert(error.message);
    }
  };

  // Handle friend requests (accept or deny)
  const handleFriendRequest = async (requesterId, accept) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not signed in.");

      const userRef = db.ref(`users/${currentUser.uid}`);

      if (accept) {
        // Add to both users' friend lists
        await userRef.child(`friends/${requesterId}`).set(true);
        await db.ref(`users/${requesterId}/friends/${currentUser.uid}`).set(true);
        console.log("Friend request accepted.");
      } else {
        console.log("Friend request denied.");
      }

      // Remove the friend request
      await userRef.child(`friendRequests/${requesterId}`).remove();
    } catch (error) {
      console.error("Error handling friend request:", error);
      alert(error.message);
    }
  };

  // Select a chatroom
  const selectChat = (friendId) => {
    currentChat = friendId;
    console.log("Chat selected:", currentChat);
  };

  // Display logged-in user
  const displayCurrentUser = () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("No user logged in.");
      return;
    }

    console.log(`Currently logged in as: ${currentUser.displayName}`);
    document.getElementById("currentUserDisplay").innerText = `Logged in as: ${currentUser.displayName}`;
  };

  // Initialize the chat module
  const initialize = () => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        displayCurrentUser();
      }
    });
  };

  return {
    initialize,
    signUp,
    signIn,
    sendMessage,
    listenForMessages,
    sendFriendRequest,
    handleFriendRequest,
    selectChat,
  };
})();

// Initialize chat module
ChatModule.initialize();
