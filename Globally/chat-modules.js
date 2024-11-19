const ChatModule = (() => {
  let firebaseApp, auth, database, currentUser, currentChat;

  const initialize = () => {
    firebaseApp = firebase.initializeApp({
      apiKey: "AIzaSyCB1DU7DtkswEU_9vs0tFxKlX1nN7ovkQc",
      authDomain: "globallyapi-c3088.firebaseapp.com",
      projectId: "globallyapi-c3088",
      storageBucket: "globallyapi-c3088.appspot.com",
      messagingSenderId: "489666785193",
      appId: "1:489666785193:web:a3027c53685758e9a99eb8",
      measurementId: "G-636R3YJQ6B",
    });

    auth = firebase.auth();
    database = firebase.database();

    auth.onAuthStateChanged((user) => {
      if (user) {
        currentUser = user;
        console.log("Logged in as:", user.displayName || user.email);
      } else {
        currentUser = null;
        console.log("No user signed in.");
      }
    });
  };

  const signUp = async (email, password, username) => {
    await auth.createUserWithEmailAndPassword(email, password);
    const user = auth.currentUser;

    // Set user profile
    await user.updateProfile({ displayName: username });

    // Save user data in database
    await database.ref(`users/${user.uid}`).set({
      username: username,
      email: email,
    });

    console.log("User signed up and profile set:", username);
  };

  const signIn = async (email, password) => {
    await auth.signInWithEmailAndPassword(email, password);
    return auth.currentUser;
  };

  const signOut = () => {
    auth.signOut();
  };

  const sendFriendRequest = async (friendUsername) => {
    if (!currentUser) throw new Error("No user signed in.");

    const snapshot = await database
      .ref("users")
      .orderByChild("username")
      .equalTo(friendUsername)
      .once("value");

    if (snapshot.exists()) {
      const [friendId] = Object.keys(snapshot.val());
      const request = {
        from: currentUser.uid,
        fromUsername: currentUser.displayName,
        to: friendId,
      };

      await database.ref(`friendRequests/${friendId}`).push(request);
      console.log("Friend request sent to:", friendUsername);
    } else {
      console.log("User not found:", friendUsername);
    }
  };

  const handleFriendRequest = async (requestId, accept) => {
    if (!currentUser) throw new Error("No user signed in.");

    const requestRef = database.ref(`friendRequests/${currentUser.uid}/${requestId}`);
    const requestSnapshot = await requestRef.once("value");
    const request = requestSnapshot.val();

    if (!request) return;

    if (accept) {
      await database.ref(`friends/${currentUser.uid}/${request.from}`).set(request.fromUsername);
      await database.ref(`friends/${request.from}/${currentUser.uid}`).set(currentUser.displayName);
      console.log("Friend request accepted.");
    } else {
      console.log("Friend request denied.");
    }

    await requestRef.remove();
  };

  const listenForFriendRequests = (callback) => {
    if (!currentUser) throw new Error("No user signed in.");

    database.ref(`friendRequests/${currentUser.uid}`).on("value", (snapshot) => {
      callback(snapshot.val() || {});
    });
  };

  const listenForFriends = (callback) => {
    if (!currentUser) throw new Error("No user signed in.");

    database.ref(`friends/${currentUser.uid}`).on("value", (snapshot) => {
      callback(snapshot.val() || {});
    });
  };

  const selectChat = (friendId) => {
    if (!currentUser) throw new Error("No user signed in.");

    currentChat = friendId;
    console.log("Selected chat with:", friendId);
  };

  const sendMessage = async (message) => {
    if (!currentUser || !currentChat) throw new Error("No user or chat selected.");

    const messageData = {
      from: currentUser.uid,
      fromUsername: currentUser.displayName,
      message: message,
      timestamp: Date.now(),
    };

    await database.ref(`chats/${currentUser.uid}/${currentChat}`).push(messageData);
    await database.ref(`chats/${currentChat}/${currentUser.uid}`).push(messageData);

    console.log("Message sent to:", currentChat);
  };

  const listenForMessages = (callback) => {
    if (!currentUser || !currentChat) throw new Error("No user or chat selected.");

    database.ref(`chats/${currentUser.uid}/${currentChat}`).on("child_added", (snapshot) => {
      callback(snapshot.val());
    });
  };

  return {
    initialize,
    signUp,
    signIn,
    signOut,
    sendFriendRequest,
    handleFriendRequest,
    listenForFriendRequests,
    listenForFriends,
    selectChat,
    sendMessage,
    listenForMessages,
  };
})();
