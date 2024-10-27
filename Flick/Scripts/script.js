
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
        import { getDatabase, ref, push, onChildAdded, query, limitToLast } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

        // Replace with your Firebase config
 const firebaseConfig = {
  apiKey: "AIzaSyCa026-T60VjqfvYAtDrh_uUfgLkVa80WU",
  authDomain: "flickapi.firebaseapp.com",
  databaseURL: "https://flickapi-default-rtdb.firebaseio.com",
  projectId: "flickapi",
  storageBucket: "flickapi.appspot.com",
  messagingSenderId: "605379013848",
  appId: "1:605379013848:web:0e58360df6726849d87bad",
  measurementId: "G-X4NDYQBFF0"
};

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const database = getDatabase(app);

        // DOM Elements
        const cameraModal = document.getElementById('cameraModal');
        const video = document.getElementById('video');
        const photoCanvas = document.getElementById('photoCanvas');
        const messages = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        const loginStatus = document.getElementById('loginStatus');

        // Initialize fabric.js canvas
        let fabricCanvas;
        let stream;
        let currentFacingMode = 'user';

        // Auth State
        onAuthStateChanged(auth, (user) => {
            if (user) {
                loginStatus.textContent = `Logged in as ${user.displayName}`;
                loginBtn.textContent = 'Logout';
                loadMessages();
            } else {
                loginStatus.textContent = 'Not logged in';
                loginBtn.textContent = 'Login with Google';
            }
        });

        // Login/Logout
        document.getElementById('loginBtn').addEventListener('click', async () => {
            if (auth.currentUser) {
                await auth.signOut();
            } else {
                const provider = new GoogleAuthProvider();
                try {
                    await signInWithPopup(auth, provider);
                } catch (error) {
                    console.error('Auth error:', error);
                    alert('Login failed. Please try again.');
                }
            }
        });

        // Camera initialization
        async function initCamera() {
            try {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: currentFacingMode }
                });
                video.srcObject = stream;
                cameraModal.style.display = 'block';
                
                // Reset UI
                video.style.display = 'block';
                photoCanvas.style.display = 'none';
                document.getElementById('editContainer').style.display = 'none';
                document.getElementById('captureTools').style.display = 'block';
                document.getElementById('editTools').style.display = 'none';
            } catch (err) {
                console.error('Camera error:', err);
                alert('Could not access camera. Please check permissions.');
            }
        }

        // Switch camera
        document.getElementById('switchCameraBtn').addEventListener('click', () => {
            currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
            initCamera();
        });

        // Take photo
        document.getElementById('snapBtn').addEventListener('click', () => {
            const context = photoCanvas.getContext('2d');
            context.drawImage(video, 0, 0, 640, 480);
            
            video.style.display = 'none';
            document.getElementById('editContainer').style.display = 'block';
            document.getElementById('captureTools').style.display = 'none';
            document.getElementById('editTools').style.display = 'flex';
            
            initFabricCanvas();
        });

        // Drawing mode
        document.getElementById('drawBtn').addEventListener('click', () => {
            fabricCanvas.isDrawingMode = !fabricCanvas.isDrawingMode;
            if (fabricCanvas.isDrawingMode) {
                fabricCanvas.freeDrawingBrush.width = 5;
                fabricCanvas.freeDrawingBrush.color = document.getElementById('colorPicker').value;
            }
            document.getElementById('drawBtn').style.background = 
                fabricCanvas.isDrawingMode ? '#00ff00' : '#0084ff';
        });

        // Add text
        document.getElementById('addTextBtn').addEventListener('click', () => {
            const text = new fabric.IText('Tap to edit', {
                left: 50,
                top: 50,
                fontFamily: 'Arial',
                fill: document.getElementById('colorPicker').value,
                fontSize: 30
            });
            fabricCanvas.add(text);
            fabricCanvas.setActiveObject(text);
        });

        // Color picker
        document.getElementById('colorPicker').addEventListener('change', (e) => {
            fabricCanvas.freeDrawingBrush.color = e.target.value;
        });

        // Undo
        document.getElementById('undoBtn').addEventListener('click', () => {
            const objects = fabricCanvas.getObjects();
            if (objects.length > 0) {
                fabricCanvas.remove(objects[objects.length - 1]);
            }
        });

        // Send photo
        document.getElementById('sendPhotoBtn').addEventListener('click', async () => {
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = 640;
            finalCanvas.height = 480;
            const ctx = finalCanvas.getContext('2d');
            
            // Draw original photo
            ctx.drawImage(photoCanvas, 0, 0);
            
            // Draw fabric canvas content
            fabricCanvas.getElement().toBlob(async (blob) => {
                const reader = new FileReader();
                reader.onload = async function(e) {
                    const img = new Image();
                    img.onload = async function() {
                        ctx.drawImage(img, 0, 0);
                        
                        // Convert to base64 and compress
                        const imageData = finalCanvas.toDataURL('image/jpeg', 0.7);
                        
                        // Upload to imgBB
                        const formData = new FormData();
                        formData.append('image', imageData.split(',')[1]);
                        formData.append('key', 'YOUR_IMGBB_API_KEY'); // Replace with your ImgBB API key

                        try {
                            const response = await fetch('https://api.imgbb.com/1/upload', {
                                method: 'POST',
                                body: formData
                            });
                            const data = await response.json();
                            
                            if (data.success) {
                                await sendMessage(data.data.url, 'image');
                                closeCamera();
                            } else {
                                throw new Error('Upload failed');
                            }
                        } catch (error) {
                            console.error('Upload error:', error);
                            alert('Failed to upload image. Please try again.');
                        }
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(blob);
            });
        });

        // Retake photo
        document.getElementById('retakeBtn').addEventListener('click', () => {
            if (fabricCanvas) {
                fabricCanvas.dispose();
            }
            initCamera();
        });

        // Close camera
        function closeCamera() {
            cameraModal.style.display = 'none';
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (fabricCanvas) {
                fabricCanvas.dispose();
            }
        }

        document.getElementById('closeCamera').addEventListener('click', closeCamera);

        // Send message
        async function sendMessage(content = null, type = 'text') {
            if (!auth.currentUser) {
                alert('Please login first');
                return;
            }

            const messageContent = content || messageInput.value.trim();
            if (!messageContent) return;

            try {
                const messageRef = ref(database, 'messages');
                await push(messageRef, {
                    uid: auth.currentUser.uid,
                    name: auth.currentUser.displayName,
                    content: messageContent,
                    type: type,
                    timestamp: Date.now()
                });

                if (type === 'text') {
                    messageInput.value = '';
                }
            } catch (error) {
                console.error('Send error:', error);
                alert(`Failed to send message: ${error.message}`);
            }
        }

        // Load messages
        function loadMessages() {
            const messagesQuery = query(ref(database, 'messages'), limitToLast(50));
            onChildAdded(messagesQuery, (snapshot) => {
                const message = snapshot.val();
                displayMessage(message);
            });
        }

        // Display message
        function displayMessage(message) {
            const div = document.createElement('div');
            div.className = `message ${message.uid === auth.currentUser?.uid ? 'sent' : 'received'}`;

            if (message.type === 'image') {
                const img = document.createElement('img');
                img.src = message.content;
                div.appendChild(img);
            } else {
                div.textContent = message.content;
            }

            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        }

        // Event listeners
        document.getElementById('cameraBtn').addEventListener('click', initCamera);
        document.getElementById('sendBtn').addEventListener('click', () => sendMessage());
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // Cleanup messages periodically (every 20 minutes)
        setInterval(() => {
            const messages = document.getElementById('messages');
            const localMessages = Array.from(messages.children);
            if (localMessages.length > 100) {
                localMessages.slice(0, localMessages.length - 100).forEach(msg => msg.remove());
            }
        }, 20 * 60 * 1000);

        // Initialize fabric canvas
        function initFabricCanvas() {
            if (fabricCanvas) {
                fabricCanvas.dispose();
            }

            const container = document.getElementById('fabricContainer');
            container.innerHTML = '<canvas id="editCanvas" width="640" height="480"></canvas>';
            
            fabricCanvas = new fabric.Canvas('editCanvas', {
                isDrawingMode: false,
                backgroundColor: 'transparent'
            });

            // Make fabric canvas container position absolute
            const canvasContainer = document.querySelector('.canvas-container');
            if (canvasContainer) {
                canvasContainer.style.position = 'absolute';
                canvasContainer.style.top = '0';
                canvasContainer.style.left = '0';
                canvasContainer.style.zIndex = '2';
            }
        }

