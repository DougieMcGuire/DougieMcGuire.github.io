// app-module.js

export function initApp(options) {
  const defaultOptions = {
    appName: "Globally",
    installPromptText: "Install Globally.",
    installInstructions: `
      <p>Follow these steps to add this app to your home screen:</p>
      <ul>
        <li>iOS: Tap the <strong>Share</strong> button and select <strong>Add to Home Screen</strong>.</li>
        <li>Android: Tap the <strong>three dots</strong> and select <strong>Add to Home Screen</strong>.</li>
      </ul>
    `,
  };
  const settings = { ...defaultOptions, ...options };

  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone ||
    document.referrer.startsWith("android-app://");

  const appHTML = `
    <header style="position: fixed; top: 0; width: 100%; height: 60px; background: #4caf50; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); z-index: 10;">
      <h1>${settings.appName}</h1>
    </header>
    <div id="instructions" style="display: none; margin-top: 70px; padding: 20px; text-align: center;">
      <h2>${settings.installPromptText}</h2>
      ${settings.installInstructions}
      <button id="reset-app" style="padding: 10px 20px; font-size: 16px; border: none; border-radius: 5px; background: #4caf50; color: white; cursor: pointer;">Done, Take Me Back</button>
    </div>
    <div id="main-app" style="display: none; margin-top: 70px; padding: 20px; text-align: center;">
      <h2>Welcome to ${settings.appName}</h2>
      <p>You are now running this app in full-screen mode!</p>
      <button id="open-settings" style="padding: 10px 20px; font-size: 16px; border: none; border-radius: 5px; background: #4caf50; color: white; cursor: pointer;">Settings</button>
    </div>
  `;

  const appStyles = `
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      color: #333;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      height: 100vh;
      overflow: hidden;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
  `;

  // Inject HTML
  document.body.innerHTML = appHTML;

  // Inject Styles
  const styleTag = document.createElement("style");
  styleTag.textContent = appStyles;
  document.head.appendChild(styleTag);

  // App Logic
  const instructions = document.getElementById("instructions");
  const mainApp = document.getElementById("main-app");
  const resetButton = document.getElementById("reset-app");
  const openSettingsButton = document.getElementById("open-settings");

  function checkAppState() {
    if (isStandalone()) {
      showMainApp();
    } else {
      showInstructions();
    }
  }

  function showInstructions() {
    instructions.style.display = "block";
    mainApp.style.display = "none";
  }

  function showMainApp() {
    instructions.style.display = "none";
    mainApp.style.display = "flex";
  }

  resetButton.addEventListener("click", () => {
    localStorage.removeItem("standaloneSeen");
    showInstructions();
  });

  openSettingsButton.addEventListener("click", () => {
    alert("Settings page will be added here.");
  });

  checkAppState();
}
