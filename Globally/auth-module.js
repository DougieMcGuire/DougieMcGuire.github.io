const AuthModule = (() => {
  let auth, database, currentUser;
  
  const initialize = () => {
    const firebaseConfig = {
      apiKey: "AIzaSyCB1DU7DtkswEU_9vs0tFxKlX1nN7ovkQc",
      authDomain: "globallyapi-c3088.firebaseapp.com",
      projectId: "globallyapi-c3088",
      storageBucket: "globallyapi-c3088.appspot.com",
      messagingSenderId: "489666785193",
      appId: "1:489666785193:web:a3027c53685758e9a99eb8",
      measurementId: "G-636R3YJQ6B",
    };
    
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    database = firebase.database();
    
    // Check for persisted user on initialization
    const persistedUser = localStorage.getItem('currentUser');
    
    auth.onAuthStateChanged((user) => {
      if (user) {
        currentUser = user;
        // Save user info to local storage
        localStorage.setItem('currentUser', JSON.stringify({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email
        }));
        console.log("Logged in as:", user.displayName || user.email);
      } else {
        currentUser = null;
        localStorage.removeItem('currentUser');
        console.log("No user signed in.");
      }
    });
    
    // Attempt to restore user from local storage if exists
    if (persistedUser) {
      try {
        const savedUser = JSON.parse(persistedUser);
        // You might want to add additional verification here
        currentUser = savedUser;
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem('currentUser');
      }
    }
  };
  
  const signUp = async (email, password, username) => {
    await auth.createUserWithEmailAndPassword(email, password);
    const user = auth.currentUser;
    await user.updateProfile({ displayName: username });
    await database.ref(`users/${user.uid}`).set({
      username: username,
      email: email,
    });
    console.log("User signed up:", username);
    return user;
  };
  
  const signIn = async (email, password) => {
    const user = await auth.signInWithEmailAndPassword(email, password);
    console.log("User signed in:", user.displayName || user.email);
    return user;
  };
  
  const signOut = () => {
    auth.signOut();
    localStorage.removeItem('currentUser');
    console.log("User signed out.");
  };
  
  const getCurrentUser = () => {
    // Try to get current user from Firebase auth first
    const firebaseUser = auth.currentUser;
    if (firebaseUser) return firebaseUser;
    
    // If not, try to get from local storage
    const persistedUser = localStorage.getItem('currentUser');
    return persistedUser ? JSON.parse(persistedUser) : null;
  };
  
  return { initialize, signUp, signIn, signOut, getCurrentUser };
})();
