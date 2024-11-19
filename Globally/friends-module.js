const FriendsModule = (() => {
  let database, currentUser;

  const initialize = (authModule) => {
    database = firebase.database();
    currentUser = authModule.getCurrentUser();
    if (!currentUser) throw new Error("User must be signed in to use FriendsModule.");
  };

  const sendFriendRequest = async (friendUsername) => {
    const snapshot = await database
      .ref("users")
      .orderByChild("username")
      .equalTo(friendUsername)
      .once("value");

    if (snapshot.exists()) {
      const [friendId] = Object.keys(snapshot.val());

      if (friendId === currentUser.uid) {
        console.log("You cannot send a friend request to yourself.");
        return;
      }

      await database.ref(`friendRequests/${friendId}`).push({
        from: currentUser.uid,
        fromUsername: currentUser.displayName,
      });

      console.log("Friend request sent!");
    } else {
      console.log("User not found:", friendUsername);
    }
  };

  const listenForFriendRequests = (callback) => {
    database.ref(`friendRequests/${currentUser.uid}`).on("value", (snapshot) => {
      callback(snapshot.val() || {});
    });
  };

  const handleFriendRequest = async (requestId, accept) => {
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

  const listenForFriends = (callback) => {
    database.ref(`friends/${currentUser.uid}`).on("value", (snapshot) => {
      callback(snapshot.val() || {});
    });
  };

  return {
    initialize,
    sendFriendRequest,
    listenForFriendRequests,
    handleFriendRequest,
    listenForFriends,
  };
})();
