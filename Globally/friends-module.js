// Firebase initialization (ensure this part is already in your code)

const db = firebase.database();
const auth = firebase.auth();

// --- Send Friend Request ---
function sendFriendRequest(friendUsername) {
    const currentUserId = auth.currentUser.uid;
    const friendRef = db.ref(`users/${friendUsername}/friendRequests/${currentUserId}`);
    const currentUserRef = db.ref(`users/${currentUserId}/friendRequests/${friendUsername}`);

    // Check if user exists and send friend request
    friendRef.set({
        fromUsername: auth.currentUser.displayName,
        status: "pending"
    }).then(() => {
        // Update current user
        currentUserRef.set({
            toUsername: friendUsername,
            status: "pending"
        });
        
        alert('Friend request sent!');
    }).catch(error => {
        console.error("Error sending friend request:", error);
    });
}

// --- Accept Friend Request ---
function acceptFriendRequest(friendUsername) {
    const currentUserId = auth.currentUser.uid;
    
    // Add to both users' friends list
    db.ref(`users/${currentUserId}/friends/${friendUsername}`).set(true);
    db.ref(`users/${friendUsername}/friends/${currentUserId}`).set(true);

    // Remove the pending friend request
    db.ref(`users/${friendUsername}/friendRequests/${currentUserId}`).remove();
    db.ref(`users/${currentUserId}/friendRequests/${friendUsername}`).remove();

    alert('Friend request accepted!');
    updateFriendsList();
}

// --- Deny Friend Request ---
function denyFriendRequest(friendUsername) {
    const currentUserId = auth.currentUser.uid;
    
    // Remove the pending friend request
    db.ref(`users/${friendUsername}/friendRequests/${currentUserId}`).remove();
    db.ref(`users/${currentUserId}/friendRequests/${friendUsername}`).remove();

    alert('Friend request denied!');
    updateFriendsList();
}

// --- Update Friend List UI ---
function updateFriendsList() {
    const currentUserId = auth.currentUser.uid;
    const friendsListContainer = document.getElementById('friends-list');
    
    // Clear current list
    friendsListContainer.innerHTML = '';

    db.ref(`users/${currentUserId}/friends`).once('value').then(snapshot => {
        const friends = snapshot.val();

        if (friends) {
            Object.keys(friends).forEach(friendId => {
                const friendListItem = document.createElement('div');
                friendListItem.textContent = friendId;  // Display friend's username

                // Click to switch to chat with this friend
                friendListItem.addEventListener('click', () => {
                    setCurrentChat(friendId);
                });

                friendsListContainer.appendChild(friendListItem);
            });
        } else {
            friendsListContainer.innerHTML = 'No friends yet!';
        }
    }).catch(error => {
        console.error("Error fetching friend list:", error);
    });
}

// --- Set Current Chat ---
function setCurrentChat(friendUsername) {
    const currentUserId = auth.currentUser.uid;

    // Set current chat room
    const currentChatRef = db.ref(`users/${currentUserId}/currentChat`);
    currentChatRef.set(friendUsername);

    // Update UI
    document.getElementById('current-chat').textContent = `Currently chatting with: ${friendUsername}`;
    loadMessages(friendUsername);
}

// --- Send Message ---
function sendMessage() {
    const currentUserId = auth.currentUser.uid;
    const currentChatRef = db.ref(`users/${currentUserId}/currentChat`);
    
    currentChatRef.once('value').then(snapshot => {
        const currentChatUsername = snapshot.val();
        if (currentChatUsername) {
            const message = document.getElementById('message-input').value;
            const messageData = {
                from: auth.currentUser.displayName,
                text: message,
                timestamp: Date.now()
            };

            // Send message to both users' chat history
            db.ref(`messages/${currentUserId}/${currentChatUsername}`).push(messageData);
            db.ref(`messages/${currentChatUsername}/${currentUserId}`).push(messageData);

            document.getElementById('message-input').value = '';  // Clear input
            loadMessages(currentChatUsername);
        } else {
            alert('Please select a chat first!');
        }
    });
}

// --- Load Messages ---
function loadMessages(friendUsername) {
    const currentUserId = auth.currentUser.uid;
    const messageContainer = document.getElementById('message-container');
    
    db.ref(`messages/${currentUserId}/${friendUsername}`).once('value').then(snapshot => {
        const messages = snapshot.val();

        messageContainer.innerHTML = ''; // Clear message area

        if (messages) {
            Object.keys(messages).forEach(key => {
                const message = messages[key];
                const messageElement = document.createElement('div');
                messageElement.textContent = `${message.from}: ${message.text}`;
                messageContainer.appendChild(messageElement);
            });
        } else {
            messageContainer.innerHTML = 'No messages yet!';
        }
    }).catch(error => {
        console.error("Error loading messages:", error);
    });
}

// --- Listen for Friend Requests ---
function listenForFriendRequests() {
    const currentUserId = auth.currentUser.uid;
    const requestsContainer = document.getElementById('friend-requests');
    
    db.ref(`users/${currentUserId}/friendRequests`).on('value', snapshot => {
        requestsContainer.innerHTML = ''; // Clear current requests

        const requests = snapshot.val();
        if (requests) {
            Object.keys(requests).forEach(requesterId => {
                const request = requests[requesterId];
                
                const requestElement = document.createElement('div');
                requestElement.textContent = `Friend request from: ${request.fromUsername}`;

                // Accept and deny buttons
                const acceptButton = document.createElement('button');
                acceptButton.textContent = 'Accept';
                acceptButton.addEventListener('click', () => acceptFriendRequest(requesterId));

                const denyButton = document.createElement('button');
                denyButton.textContent = 'Deny';
                denyButton.addEventListener('click', () => denyFriendRequest(requesterId));

                requestElement.appendChild(acceptButton);
                requestElement.appendChild(denyButton);

                requestsContainer.appendChild(requestElement);
            });
        } else {
            requestsContainer.innerHTML = 'No pending friend requests.';
        }
    });
}

// --- Initialize the Friend Request Listener on Page Load ---
window.onload = function() {
    listenForFriendRequests();
    updateFriendsList();
};
