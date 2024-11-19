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

  // Sign up a new user
  const signUp = async (email, password) => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      console.log("User signed up:", userCredential.user);
      return userCredential.user;
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

  // Send a message
  const sendMessage = async (chatRoom, message) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not signed in.");
      const timestamp = Date.now();
      await db.ref(`chats/${chatRoom}`).push({
        user: currentUser.email,
        message,
        timestamp
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Listen for new messages
  const listenForMessages = (chatRoom, callback) => {
    db.ref(`chats/${chatRoom}`).on("child_added", (snapshot) => {
      callback(snapshot.val());
    });
  };

  // Sign out the current user
  const signOut = async () => {
    try {
      await auth.signOut();
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    signUp,
    signIn,
    sendMessage,
    listenForMessages,
    signOut
  };
})();
