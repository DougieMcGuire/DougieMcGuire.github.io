// Initialize Firebase Auth
const auth = firebase.auth();

// Set persistence to LOCAL to ensure user stays logged in after page refresh
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    // Authentication state change listener
    auth.onAuthStateChanged(user => {
      if (user) {
        // User is logged in
        console.log('User logged in as:', user.displayName);
        document.getElementById('user-status').textContent = `Logged in as: ${user.displayName}`;
        // Optionally, show the logged-in user's details or redirect
      } else {
        // User is not logged in
        console.log('No user is logged in');
        document.getElementById('user-status').textContent = 'Not logged in';
        // Optionally, show the login form or redirect to login page
      }
    });
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// --- Register User Function ---
function registerUser(email, password, username) {
    auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        // Save additional user details (e.g., username)
        db.ref('users/' + user.uid).set({
            username: username,
            email: user.email
        }).then(() => {
            console.log('User Registered Successfully!');
            document.getElementById('user-status').textContent = `Logged in as: ${username}`;
        });
    })
    .catch((error) => {
        console.error('Registration Error:', error.message);
    });
}

// --- Login User Function ---
function loginUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log('Logged in as:', user.displayName);
        document.getElementById('user-status').textContent = `Logged in as: ${user.displayName}`;
        // Optionally load user data or update the UI after login
    })
    .catch((error) => {
        console.error('Login Error:', error.message);
    });
}

// --- Logout User Function ---
function logoutUser() {
    auth.signOut()
    .then(() => {
        console.log('User logged out');
        document.getElementById('user-status').textContent = 'Not logged in';
        // Optionally, redirect to login page or show login form
    })
    .catch((error) => {
        console.error('Logout Error:', error.message);
    });
}
