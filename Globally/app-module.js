export function initApp(config) {
  // Prevent zooming
  const metaViewport = document.createElement('meta');
  metaViewport.name = 'viewport';
  metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.head.appendChild(metaViewport);

  // Tap highlight color transparent
  const tapHighlight = document.createElement('style');
  tapHighlight.innerHTML = `
    * {
      -webkit-tap-highlight-color: transparent;
      -moz-tap-highlight-color: transparent;
    }
  `;
  document.head.appendChild(tapHighlight);

  // Splash screen
  const splashScreen = document.createElement('div');
  splashScreen.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #4caf50;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    font-family: Arial, sans-serif;
    transition: opacity 0.5s ease-in-out;
  `;
  splashScreen.innerHTML = `
    <h1 style="font-size: 3rem; margin-bottom: 20px;">Globally</h1>
    <div class="loader" style="
      border: 4px solid white;
      border-top: 4px solid #2196F3;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
    "></div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.appendChild(splashScreen);

  // Remove splash screen after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      splashScreen.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(splashScreen);
      }, 500);
    }, 1000);
  });

  // Check if it's a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (!isMobile) return;

  const { appName, installPromptText, installInstructions } = config;
  
  // Previous manifest and other initialization code remains the same...

  // New function to lock scrolling on specific elements
  function preventElementScroll(element) {
    element.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  // App initialization
  function initAppMode() {
    console.log("App is running in standalone mode.");
    
    // App-like styling and behavior
    document.body.style.fontFamily = 'Arial, sans-serif';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overscrollBehavior = 'none';
    
    // Fix header
    const header = document.querySelector('header');
    if (header) {
      header.style.position = 'fixed';
      header.style.top = '0';
      header.style.width = '100%';
      header.style.zIndex = '100';
    }

    // Prevent scrolling on footer
    const footer = document.querySelector('footer');
    if (footer) {
      preventElementScroll(footer);
      footer.style.position = 'fixed';
      footer.style.bottom = '0';
      footer.style.width = '100%';
    }
    
    // Adjust body to account for fixed header/footer
    if (header && footer) {
      document.body.style.paddingTop = `${header.offsetHeight}px`;
      document.body.style.paddingBottom = `${footer.offsetHeight}px`;
    }
    
    // Prevent default touch behaviors
    document.addEventListener('touchmove', (e) => {
      if (e.scale !== 1) e.preventDefault();
    }, { passive: false });
  }
}

// Rest of the previous code remains the same...
