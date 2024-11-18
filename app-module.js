export function initApp(config) {
  const { appName, installPromptText, installInstructions } = config;

  // Inject manifest.json
  const manifest = {
    name: appName || "Globally",
    short_name: "Globally",
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
        src: "path-to-your-icon-512x512.png", // Replace with your actual path
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
  document.title = `Download ${appName || "Globally"}!`;

  // Detect if the app is in standalone mode
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  if (!isStandalone) {
    // Display install prompt
    showInstallScreen(installPromptText, installInstructions);
  } else {
    // App-like behavior
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
    background: white;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
  `;
  installScreen.innerHTML = `
    <h1>${promptText}</h1>
    ${instructionsHTML}
  `;
  document.body.appendChild(installScreen);
}

function initAppMode() {
  console.log("App is running in standalone mode.");
  // Additional standalone mode behavior can go here
}
