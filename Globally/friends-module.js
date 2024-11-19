const FriendsModule = {
  // Initialize the Firebase Database
  init: function () {
    this.db = firebase.database();
    this.currentUser = AuthModule.getCurrentUser();
    if (!this.currentUser) {
      console.error("User not authenticated.");
    }
  },

  // Send a Friend Request by Username
  sendFriendRequest: async function (friendUsername) {
    try {
      const currentUserId = this.currentUser.uid;
      const usersRef = this.db.ref("users");

      // Find the user by their username
      const snapshot = await usersRef
        .orderByChild("username")
        .equalTo(friendUsername)
        .once("value");

      if (!snapshot.exists()) {
        alert("User not found!");
        return;
      }

      const friendUserId = Object.keys(snapshot.val())[0];

      // Check if already friends
      const alreadyFriends = await this.db
        .ref(`users/${currentUserId}/friends/${friendUserId}`)
        .once("value");
      if (alreadyFriends.exists()) {
        alert("You are already friends with this user!");
        return;
      }

      // Send a friend request
      await this.db.ref(`users/${friendUserId}/friendRequests/${currentUserId}`).set({
        fromUsername: this.currentUser.displayName,
        status: "pending",
      });

      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Could not send friend request. Please try again.");
    }
  },

  // Handle Friend Request (Accept/Deny)
  handleFriendRequest: async function (requestId, accept) {
    try {
      const currentUserId = this.currentUser.uid;

      // Get the friend's user ID from the request
      const friendRequestRef = this.db.ref(`users/${currentUserId}/friendRequests/${requestId}`);
      const requestSnapshot = await friendRequestRef.once("value");

      if (!requestSnapshot.exists()) {
        alert("Friend request not found!");
        return;
      }

      const friendUserId = requestId;

      if (accept) {
        // Add each other as friends
        await this.db.ref(`users/${currentUserId}/friends/${friendUserId}`).set(true);
        await this.db.ref(`users/${friendUserId}/friends/${currentUserId}`).set(true);
      }

      // Remove the friend request
      await friendRequestRef.remove();

      alert(accept ? "Friend request accepted!" : "Friend request denied.");
    } catch (error) {
      console.error("Error handling friend request:", error);
      alert("Could not process the friend request. Please try again.");
    }
  },

  // Load Friend Requests
  loadFriendRequests: async function (callback) {
    try {
      const currentUserId = this.currentUser.uid;

      const friendRequestsRef = this.db.ref(`users/${currentUserId}/friendRequests`);
      friendRequestsRef.on("value", (snapshot) => {
        if (snapshot.exists()) {
          const requests = snapshot.val();
          callback(requests);
        } else {
          callback({});
        }
      });
    } catch (error) {
      console.error("Error loading friend requests:", error);
    }
  },

  // Load Friends
  loadFriends: async function (callback) {
    try {
      const currentUserId = this.currentUser.uid;

      const friendsRef = this.db.ref(`users/${currentUserId}/friends`);
      friendsRef.on("value", (snapshot) => {
        if (snapshot.exists()) {
          const friends = snapshot.val();
          callback(friends);
        } else {
          callback({});
        }
      });
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  },
};

export default FriendsModule;
