// Initialize Firebase Auth and set the persistence
const auth = firebase.auth();

// Set persistence to LOCAL (stores session info even after the browser is closed/reopened)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    // You can now use auth state management here
    auth.onAuthStateChanged(user => {
      if (user) {
        console.log('User is logged in:', user.displayName);
        // You can display logged-in user details here or redirect them to the main page
        document.getElementById('user-status').textContent = `Logged in as: ${user.displayName}`;
        // Optionally, load the user data or update the UI here
      } else {
        console.log('No user is logged in');
        document.getElementById('user-status').textContent = 'Not logged in';
        // You can redirect to login page here or show the login form
      }
    });
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// --- Register User ---
function registerUser(email, password, username) {
    auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        // Save additional user details like username
        db.ref('users/' + user.uid).set({
            username: username,
            email: user.email
        }).then(() => {
            alert('User Registered Successfully!');
        });
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('Registration Error: ', errorCode, errorMessage);
    });
}

// --- Login User ---
function loginUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log('Logged in as:', user.displayName);
        document.getElementById('user-status').textContent = `Logged in as: ${user.displayName}`;
        // Optionally load user data or update UI after login
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('Login Error: ', errorCode, errorMessage);
    });
}

// --- Logout User ---
function logoutUser() {
    auth.signOut()
    .then(() => {
        console.log('User logged out');
        document.getElementById('user-status').textContent = 'Not logged in';
        // Optionally redirect to login page or show login form
    })
    .catch((error) => {
        console.error('Logout Error: ', error);
    });
}
