const ChatModule = (() => {
  let database, currentUser, currentChat;

  const initialize = (authModule) => {
    database = firebase.database();
    currentUser = authModule.getCurrentUser();
    if (!currentUser) throw new Error("User must be signed in to use ChatModule.");
  };

  const selectChat = (friendId) => {
    currentChat = friendId;
    console.log("Selected chat with:", friendId);
  };

  const sendMessage = async (message) => {
    if (!currentChat) throw new Error("No chat selected.");

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
    if (!currentChat) throw new Error("No chat selected.");

    database.ref(`chats/${currentUser.uid}/${currentChat}`).on("child_added", (snapshot) => {
      callback(snapshot.val());
    });
  };

  return {
    initialize,
    selectChat,
    sendMessage,
    listenForMessages,
  };
})();
