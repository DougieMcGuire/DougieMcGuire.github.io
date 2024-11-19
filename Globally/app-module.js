export function initApp(config) {
  // Prevent zooming
  const metaViewport = document.createElement('meta');
  metaViewport.name = 'viewport';
  metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.head.appendChild(metaViewport);

  // Check if it's a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (!isMobile) return;

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
    background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
    color: white;
    font-family: Arial, sans-serif;
    user-select: none;
    -webkit-user-select: none;
  `;

  installScreen.innerHTML = `
    <div style="max-width: 400px; text-align: center;">
      <h1 style="font-size: 2.5rem; margin-bottom: 30px;">Add to Home Screen</h1>
      
      <div style="background-color: rgba(255,255,255,0.2); border-radius: 15px; padding: 20px; margin-bottom: 30px;">
        <div style="font-size: 4rem; margin-bottom: 20px;">📱</div>
        <p style="font-size: 1.2rem; line-height: 1.6;">
          Tap the <strong>Share</strong> button 
          <span style="display: inline-block; background-color: white; color: black; border-radius: 5px; padding: 0 5px; margin: 0 5px;">➦</span> 
          then "Add to Home Screen"
        </p>
      </div>

      <div style="background-color: rgba(255,255,255,0.2); border-radius: 15px; padding: 20px;">
        <h2 style="margin-bottom: 15px;">Quick Steps:</h2>
        <ol style="text-align: left; padding-left: 20px; font-size: 1rem; line-height: 1.6;">
          <li>Tap Share button</li>
          <li>Scroll and tap "Add to Home Screen"</li>
          <li>Tap "Add"</li>
        </ol>
      </div>
    </div>
  `;

  // Prevent interactions
  installScreen.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  installScreen.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  
  // Disable all input interactions
  const disableInteractions = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const inputs = document.querySelectorAll('input, textarea, select, button');
  inputs.forEach(input => {
    input.addEventListener('click', disableInteractions);
    input.addEventListener('focus', disableInteractions);
  });

  document.body.appendChild(installScreen);
}

function initAppMode() {
  console.log("App is running in standalone mode.");
  
  // App-like styling and behavior
  document.body.style.fontFamily = 'Arial, sans-serif';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overscrollBehavior = 'none';
  
  // Prevent default touch behaviors
  document.addEventListener('touchmove', (e) => {
    if (e.scale !== 1) e.preventDefault();
  }, { passive: false });
}
