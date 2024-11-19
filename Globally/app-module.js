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
}

function showInstallScreen(promptText, instructionsHTML) {
  const installScreen = document.createElement("div");
  installScreen.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #f9f9f9;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
    overflow: hidden;
  `;

  installScreen.innerHTML = `
    <h1>${promptText}</h1>
    ${instructionsHTML}
  `;

  document.body.appendChild(installScreen);
}

function generateDefaultInstructions() {
  return `
    <p>1. Tap the <strong>Share</strong> button on your browser.</p>
    <p>2. Select <strong>Add to Home Screen</strong>.</p>
    <p>3. Follow the prompts to install the app!</p>
  `;
}

function initAppMode() {
  // Disable zoom functionality completely
  document.addEventListener("gesturestart", e => e.preventDefault());
  document.addEventListener("touchstart", e => {
    if (e.touches.length > 1) e.preventDefault();
  });

  // Reset zoom if it somehow happens
  document.body.style.zoom = "1";
  document.addEventListener("resize", () => {
    document.body.style.zoom = "1";
  });

  // Fixed header and footer
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");

  if (header) {
    header.style.position = "fixed";
    header.style.top = "0";
    header.style.width = "100%";
    header.style.zIndex = "1000";
  }

  if (footer) {
    footer.style.position = "fixed";
    footer.style.bottom = "0";
    footer.style.width = "100%";
    footer.style.zIndex = "1000";
  }

  // Tap highlight color
  document.body.style.webkitTapHighlightColor = "transparent";

  // Splash screen
  const splashScreen = document.createElement("div");
  splashScreen.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #4caf50;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    color: white;
    font-size: 24px;
    font-family: Arial, sans-serif;
    text-align: center;
  `;
  splashScreen.innerHTML = `
    <div>Globally</div>
    <div style="margin-top: 10px;">Loading...</div>
  `;

  document.body.appendChild(splashScreen);

  setTimeout(() => splashScreen.remove(), 2000);

  console.log("App is running in standalone mode.");
}
