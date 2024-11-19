export function initApp(config) {
  const { appName = "Globally", installPromptText = "Install Globally!", installInstructions } = config;

  // Inject manifest.json
  const manifest = {
    name: appName,
    short_name: appName,
    start_url: "./app.html",
    display: "standalone",
    background_color: "#4caf50",
    theme_color: "#4caf50",
    icons: [
      {
        src: "https://ibb.co/2j700FW", // Replace with your actual path
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "https://ibb.co/2j700FW", // Replace with your actual path
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };

  const manifestBlob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
  const manifestURL = URL.createObjectURL(manifestBlob);

  const manifestLink = document.createElement("link");
  manifestLink.rel = "manifest";
  manifestLink.href = manifestURL;
  document.head.appendChild(manifestLink);

  // General setup
  document.title = `Download ${appName}!`;

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  if (!isStandalone && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    // Show the install prompt for mobile users not in standalone mode
    showInstallScreen(installPromptText, installInstructions || generateDefaultInstructions());
  } else if (isStandalone) {
    // Apply app-like behavior
    initAppMode();
  }

  // Prevent double-tap zoom
  disableDoubleTapZoom();
}

function showInstallScreen(promptText, instructionsHTML) {
  const installScreen = document.createElement("div");
  installScreen.style.position = "fixed";
  installScreen.style.top = "0";
  installScreen.style.left = "0";
  installScreen.style.width = "100%";
  installScreen.style.height = "100%";
  installScreen.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  installScreen.style.color = "white";
  installScreen.style.display = "flex";
  installScreen.style.flexDirection = "column";
  installScreen.style.justifyContent = "center";
  installScreen.style.alignItems = "center";
  installScreen.style.zIndex = "1000";

  const promptTextElement = document.createElement("h1");
  promptTextElement.innerText = promptText;
  installScreen.appendChild(promptTextElement);

  const instructionsElement = document.createElement("div");
  instructionsElement.innerHTML = instructionsHTML;
  installScreen.appendChild(instructionsElement);

  document.body.appendChild(installScreen);

  installScreen.addEventListener("click", () => {
    installScreen.remove();
  });
}

function generateDefaultInstructions() {
  return `
    <p>Follow these steps to add this app to your home screen:</p>
    <ul>
      <li>iOS: Tap the <strong>Share</strong> button and select <strong>Add to Home Screen</strong>.</li>
      <li>Android: Tap the <strong>three dots</strong> and select <strong>Add to Home Screen</strong>.</li>
    </ul>
  `;
}

function initAppMode() {
  document.body.style.height = "100vh";
  document.body.style.overflow = "hidden";
  document.body.style.display = "flex";
  document.body.style.flexDirection = "column";
}

function disableDoubleTapZoom() {
  let lastTouchEnd = 0;

  document.addEventListener("touchstart", (event) => {
    if (event.touches.length > 1) {
      event.preventDefault(); // Prevent pinch zoom
    }
  });

  document.addEventListener("touchend", (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault(); // Prevent double-tap zoom
    }
    lastTouchEnd = now;
  });

  document.addEventListener("gesturestart", (event) => {
    event.preventDefault(); // Prevent pinch-to-zoom gesture
  });
}
