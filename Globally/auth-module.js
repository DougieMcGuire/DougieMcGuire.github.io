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
    
    // Set persistent authentication
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });
    
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
    console.log("User signed out.");
  };
  
  const getCurrentUser = () => currentUser;
  
  return { initialize, signUp, signIn, signOut, getCurrentUser };
})();
