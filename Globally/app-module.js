export function initApp(config) {
  const { appName = "Globally", installPromptImage, installInstructions } = config;

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
    showInstallScreen(installPromptImage, installInstructions || generateDefaultInstructions());
  } else if (isStandalone) {
    // Apply app-like behavior
    initAppMode();
  }

  // Disable all zooming and scrolling
  disableZoomAndScroll();

  // Prevent autofill and "fill password" prompt
  preventAutofill();
}

function showInstallScreen(imageURL, instructionsHTML) {
  const installScreen = document.createElement("div");
  installScreen.style.position = "fixed";
  installScreen.style.top = "0";
  installScreen.style.left = "0";
  installScreen.style.width = "100%";
  installScreen.style.height = "100%";
  installScreen.style.backgroundColor = "#4caf50"; // Green background
  installScreen.style.color = "green";
  installScreen.style.display = "flex";
  installScreen.style.flexDirection = "column";
  installScreen.style.justifyContent = "center";
  installScreen.style.alignItems = "center";
  installScreen.style.zIndex = "1000";

  const imageElement = document.createElement("img");
  imageElement.src = imageURL; // Use the provided image URL
  imageElement.alt = "Install Prompt Image";
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
