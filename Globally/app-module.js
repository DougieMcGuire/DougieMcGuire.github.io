export function initApp(config) {
  const { appName = "𝗚𝗹𝗼𝗯𝗮𝗹𝗹𝘆", installInstructions } = config;

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
        src: "https://i.ibb.co/HtrJBGy/Untitled36-20241119181151.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "https://i.ibb.co/HtrJBGy/Untitled36-20241119181151.png",
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

  // Add splash screen meta tags for iOS
  const splashScreenMeta = document.createElement("meta");
  splashScreenMeta.name = "apple-mobile-web-app-capable";
  splashScreenMeta.content = "yes";
  document.head.appendChild(splashScreenMeta);

  // General setup
  document.title = `Download ${appName}!`;

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  if (!isStandalone && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    // Show the install prompt for mobile users not in standalone mode
    showInstallScreen(installInstructions || generateDefaultInstructions());
  } else if (isStandalone) {
    // Apply app-like behavior and show splash screen
    initAppMode();
    showSplashScreen();
  }

  // Disable all zooming and scrolling
  disableZoomAndScroll();

  // Prevent autofill and "fill password" prompt
  preventAutofill();
}

function showSplashScreen() {
  const splashScreen = document.createElement("div");
  splashScreen.style.position = "fixed";
  splashScreen.style.top = "0";
  splashScreen.style.left = "0";
  splashScreen.style.width = "100%";
  splashScreen.style.height = "100%";
  splashScreen.style.backgroundColor = "#4caf50";
  splashScreen.style.display = "flex";
  splashScreen.style.flexDirection = "column";
  splashScreen.style.justifyContent = "center";
  splashScreen.style.alignItems = "center";
  splashScreen.style.zIndex = "2000";

  const titleImage = document.createElement("img");
  titleImage.src = "https://i.ibb.co/vZC7xhF/IMG-0971.png";
  titleImage.alt = "App Title";
  titleImage.style.maxWidth = "80%";
  titleImage.style.marginBottom = "20px";

  const spinner = document.createElement("div");
  spinner.style.width = "40px";
  spinner.style.height = "40px";
  spinner.style.border = "4px solid #ffffff";
  spinner.style.borderTop = "4px solid transparent";
  spinner.style.borderRadius = "50%";
  spinner.style.animation = "spin 1s linear infinite";

  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  splashScreen.appendChild(titleImage);
  splashScreen.appendChild(spinner);
  document.body.appendChild(splashScreen);

  // Remove splash screen after content is loaded
  window.addEventListener('load', () => {
    setTimeout(() => {
      splashScreen.style.opacity = "0";
      splashScreen.style.transition = "opacity 0.5s ease-out";
      setTimeout(() => {
        splashScreen.remove();
      }, 500);
    }, 1000);
  });
}

function showInstallScreen(instructionsHTML) {
  const installScreen = document.createElement("div");
  installScreen.style.position = "fixed";
  installScreen.style.top = "0";
  installScreen.style.left = "0";
  installScreen.style.width = "100%";
  installScreen.style.height = "100%";
  installScreen.style.backgroundColor = "#4caf50"; // Green background
  installScreen.style.color = "white";
  installScreen.style.display = "flex";
  installScreen.style.flexDirection = "column";
  installScreen.style.justifyContent = "center";
  installScreen.style.alignItems = "center";
  installScreen.style.zIndex = "1000";

  const imageElement = document.createElement("img");
  imageElement.src = "https://i.ibb.co/vZC7xhF/IMG-0971.png"; // Title image
  imageElement.alt = "Install Prompt Title Image";
  imageElement.style.maxWidth = "80%";
  imageElement.style.marginBottom = "20px";
  installScreen.appendChild(imageElement);

  const instructionsElement = document.createElement("div");
  instructionsElement.innerHTML = instructionsHTML;
  instructionsElement.style.fontSize = "18px";
  instructionsElement.style.textAlign = "center";
  installScreen.appendChild(instructionsElement);

  document.body.appendChild(installScreen);
}

function generateDefaultInstructions() {
  return `
    <p>Tap the <img src="https://www.svgrepo.com/show/349629/share-apple.svg" alt="Share Icon" style="width: 24px; vertical-align: middle;"> Button, Then hit <strong>Add to Homescreen</strong>.</p>
  `;
}

function initAppMode() {
  document.body.style.height = "100vh";
  document.body.style.overflow = "hidden";
  document.body.style.display = "flex";
  document.body.style.flexDirection = "column";
}

function disableZoomAndScroll() {
  // Prevent zooming with meta tag
  const metaTag = document.createElement("meta");
  metaTag.name = "viewport";
  metaTag.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
  document.head.appendChild(metaTag);

  // Prevent touch gestures
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("gesturechange", (e) => e.preventDefault());
  document.addEventListener("gestureend", (e) => e.preventDefault());

  // Disable scrolling
  document.body.style.overflow = "hidden";
  document.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
}

function preventAutofill() {
  // Find all input fields and disable autofill
  document.querySelectorAll("input").forEach((input) => {
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("spellcheck", "false");
  });
}
