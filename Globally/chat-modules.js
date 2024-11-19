// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCB1DU7DtkswEU_9vs0tFxKlX1nN7ovkQc",
  authDomain: "globallyapi-c3088.firebaseapp.com",
  projectId: "globallyapi-c3088",
  storageBucket: "globallyapi-c3088.firebasestorage.app",
  messagingSenderId: "489666785193",
  appId: "1:489666785193:web:a3027c53685758e9a99eb8",
  measurementId: "G-636R3YJQ6B"
};

firebase.initializeApp(firebaseConfig);

const ChatModule = (() => {
  const db = firebase.database();
  const auth = firebase.auth();
  let currentChat = null;

  // Helper to save user profile data
  const saveUserProfile = async (user, displayName) => {
    try {
      const profileData = {
        email: user.email,
        displayName: displayName || user.email.split("@")[0],
        friends: {}, // Initialize empty friends list
      };
      await db.ref(`users/${user.uid}`).set(profileData);
      console.log("User profile saved:", profileData);
    } catch (error) {
      console.error("Error saving user profile:", error);
    }
  };

  // Sign up a new user
  const signUp = async (email, password, displayName) => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (displayName) {
        await user.updateProfile({ displayName });
      }

      await saveUserProfile(user, displayName);
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

  // Send a private message
  const sendMessage = async (recipientId, message) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not signed in.");

      if (!currentChat) throw new Error("No active chat selected.");

      const timestamp = Date.now();
      const messageData = {
        from: currentUser.uid,
        to: recipientId,
        message,
        timestamp,
      };

      await db.ref(`users/${currentUser.uid}/chats/${currentChat}`).push(messageData);
      await db.ref(`users/${recipientId}/chats/${currentChat}`).push(messageData);

      console.log("Message sent:", messageData);
    } catch (error) {
      console.error("Error sending message:", error);
      alert(error.message);
    }
  };

  // Listen for new messages in the current chat
  const listenForMessages = (callback) => {
    if (!currentChat) {
      console.error("No active chat selected.");
      return;
    }

    db.ref(`users/${auth.currentUser.uid}/chats/${currentChat}`).on("child_added", (snapshot) => {
      callback(snapshot.val());
    });
  };

  // Add a friend
  const addFriend = async (friendEmail) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not signed in.");

      const snapshot = await db.ref("users").orderByChild("email").equalTo(friendEmail).once("value");
      if (!snapshot.exists()) throw new Error("User not found.");

      const friendId = Object.keys(snapshot.val())[0];
      await db.ref(`users/${currentUser.uid}/friends/${friendId}`).set(true);
      await db.ref(`users/${friendId}/friends/${currentUser.uid}`).set(true);

      console.log(`Friend added: ${friendEmail}`);
    } catch (error) {
      console.error("Error adding friend:", error);
      alert(error.message);
    }
  };

  // Select a chat with a friend
  const selectChat = (friendId) => {
    currentChat = friendId;
    console.log("Chat selected:", currentChat);
  };

  // Automatically delete chats every hour
  const setupChatCleanup = () => {
    setInterval(async () => {
      try {
        const usersRef = db.ref("users");
        const snapshot = await usersRef.once("value");
        snapshot.forEach((userSnap) => {
          const chatsRef = userSnap.child("chats").ref;
          chatsRef.remove();
        });
        console.log("Chats cleaned up.");
      } catch (error) {
        console.error("Error cleaning chats:", error);
      }
    }, 3600000); // Every hour
  };

  // Sign out the current user
  const signOut = async () => {
    try {
      await auth.signOut();
      console.log("User signed out.");
    } catch (error) {
      console.error("Error signing out:", error);
      alert(error.message);
    }
  };

  // Initialize the chat module
  const initialize = () => {
    setupChatCleanup();
  };

  return {
    initialize,
    signUp,
    signIn,
    signOut,
    sendMessage,
    listenForMessages,
    addFriend,
    selectChat,
  };
})();

// Initialize chat module
ChatModule.initialize();
