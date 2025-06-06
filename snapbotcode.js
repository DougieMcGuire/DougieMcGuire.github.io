<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Bookmarklet</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #1a1a1a;
            color: white;
        }
        .video-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            margin: 20px 0;
            border-radius: 12px;
            overflow: hidden;
        }
        .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        .bookmarklet {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            margin: 20px 0;
            cursor: move;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .bookmarklet:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
        }
        .support-link {
            display: inline-block;
            margin-top: 20px;
            color: #ff6b6b;
            text-decoration: none;
            font-weight: bold;
            transition: color 0.2s;
        }
        .support-link:hover {
            color: #ff8e8e;
        }
        .instructions {
            background-color: #2a2a2a;
            padding: 25px;
            border-radius: 12px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        h1 {
            background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-size: 2.5em;
            margin-bottom: 30px;
        }
        h2 {
            color: #ff6b6b;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <h1>Enhanced Bookmarklet</h1>
    
    <div class="video-container">
        <iframe src="/api/placeholder/800/450" frameborder="0" allowfullscreen></iframe>
    </div>

    <div class="instructions">
        <h2>How to Install</h2>
        <p>1. Drag the button below to your bookmarks bar</p>
        <p>2. Click it when you want to use the tool</p>
    </div>

        <a class="bookmarklet" href='javascript:(function(){const wait=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));let capturedSenderImg=null;let capturedReceiverImg=null;let capturedReceiverName=null;const captureElements=()=>{const senderImg=document.evaluate("/html/body/main/div[1]/div[2]/div[1]/div[1]/div/button/div/img",document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;const receiverImg=document.evaluate("/html/body/main/div[1]/div[3]/div/div/div/div[1]/div[1]/div/div[1]/div[1]/div/img",document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;const receiverName=document.evaluate("/html/body/main/div[1]/div[3]/div/div/div/div[1]/div[1]/div/div[1]/div[2]/span/span/span",document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;if(senderImg)capturedSenderImg=senderImg.cloneNode(true);if(receiverImg)capturedReceiverImg=receiverImg.cloneNode(true);if(receiverName)capturedReceiverName=receiverName.textContent;};const deleteElement=async(xpath)=>{const element=document.evaluate(xpath,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;if(element)element.remove();};const hideElement=async(xpath)=>{const element=document.evaluate(xpath,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;if(element)element.style.display="none";};const resizeElement=async(xpath,scale)=>{const element=document.evaluate(xpath,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;if(element)element.style.transform=`scale(${scale})`;};const setup=async()=>{captureElements();await deleteElement("/html/body/main/div[1]/div[2]");await wait(500);await deleteElement("/html/body/main/div[1]/div[2]/div/div/div/div[1]");await wait(500);await hideElement("/html/body/main/div[1]/div[2]/div/div/div");await wait(500);await hideElement("/html/body/main/div[1]/div[2]/div/div/div/div/div[1]/ul");await wait(500);await deleteElement("/html/body/main/div[1]/div[2]/div/div/div/div/div[2]/div/div");await wait(500);await deleteElement("/html/body/main/div[1]/div[2]/div/div/div/div/div[2]/div/button[2]");await wait(500);await deleteElement("/html/body/main/div[1]/div[2]/div/div/div/div/div[2]/div/button[2]");await wait(500);await deleteElement("/html/body/main/div[1]/div[3]/div/div/div/div[2]/div[2]/div/button[2]");await wait(500);await deleteElement("/html/body/main/div[1]/div[3]/div/div/div/div[2]/div[2]/div/button[2]");await wait(500);await deleteElement("/html/body/main/div[1]/div[3]/div/div/div/div[2]/div[2]/div/button[2]");await wait(500);await resizeElement("/html/body/main/div[1]/div[2]/div/div/div/div/div[2]",2);await wait(500);const ulXpath="/html/body/main/div[1]/div[2]/div/div/div/div/div[1]/ul/li[3]/div/ul/li[2]";const deleteFirstLi=async()=>{while(true){const ul=document.evaluate(ulXpath,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;if(!ul||!ul.firstChild)break;ul.firstChild.remove();await wait(500);}};deleteFirstLi();};const addPanel=()=>{const panel=document.createElement("div");panel.style.position="fixed";panel.style.top="10px";panel.style.right="10px";panel.style.backgroundColor="rgba(26, 26, 26, 0.95)";panel.style.border="2px solid #ff6b6b";panel.style.padding="15px";panel.style.zIndex="10000";panel.style.borderRadius="12px";panel.style.boxShadow="0 4px 15px rgba(0, 0, 0, 0.3)";panel.style.color="white";panel.style.fontFamily="Segoe UI, sans-serif";const actions=["/html/body/main/div[1]/div[2]/div/div/div/div/div[2]/div/button","/html/body/div[1]/div/div/div/div/div/div/div/div[2]/div/div/div[1]/button[1]","/html/body/div[1]/div/div/div/div/div/div/div[2]/div[2]/button[2]","/html/body/div[1]/div/div/div/div/div/div/div[1]/div/form/div[2]/button",];let loopInterval=null;let snapCount=0;const counterDisplay=document.createElement("div");counterDisplay.style.fontSize="16px";counterDisplay.style.fontWeight="bold";counterDisplay.style.marginBottom="15px";counterDisplay.style.textAlign="center";counterDisplay.style.color="#ff6b6b";counterDisplay.innerHTML=`Snaps Sent: <span id="snapCount">0</span>`;panel.appendChild(counterDisplay);const visualFlow=document.createElement("div");visualFlow.style.display="flex";visualFlow.style.alignItems="center";visualFlow.style.justifyContent="space-between";visualFlow.style.marginBottom="15px";visualFlow.style.padding="10px";visualFlow.style.backgroundColor="rgba(255,255,255,0.1)";visualFlow.style.borderRadius="8px";const senderContainer=document.createElement("div");senderContainer.style.textAlign="center";const receiverContainer=document.createElement("div");receiverContainer.style.textAlign="center";const arrow=document.createElement("div");arrow.innerHTML="→";arrow.style.fontSize="24px";arrow.style.margin="0 10px";arrow.style.color="#ff6b6b";if(capturedSenderImg){capturedSenderImg.style.width="40px";capturedSenderImg.style.height="40px";capturedSenderImg.style.borderRadius="50%";senderContainer.appendChild(capturedSenderImg);const senderLabel=document.createElement("div");senderLabel.textContent="Me";senderLabel.style.marginTop="5px";senderLabel.style.fontSize="12px";senderContainer.appendChild(senderLabel);}if(capturedReceiverImg){capturedReceiverImg.style.width="40px";capturedReceiverImg.style.height="40px";capturedReceiverImg.style.borderRadius="50%";receiverContainer.appendChild(capturedReceiverImg);const receiverLabel=document.createElement("div");receiverLabel.textContent=capturedReceiverName||"Receiver";receiverLabel.style.marginTop="5px";receiverLabel.style.fontSize="12px";receiverContainer.appendChild(receiverLabel);}visualFlow.appendChild(senderContainer);visualFlow.appendChild(arrow);visualFlow.appendChild(receiverContainer);panel.appendChild(visualFlow);const runAllButton=document.createElement("button");runAllButton.innerText="Run All";runAllButton.style.display="block";runAllButton.style.width="100%";runAllButton.style.marginBottom="10px";runAllButton.style.padding="8px";runAllButton.style.backgroundColor="#ff6b6b";runAllButton.style.border="none";runAllButton.style.borderRadius="6px";runAllButton.style.color="white";runAllButton.style.cursor="pointer";runAllButton.style.transition="background-color 0.2s";runAllButton.addEventListener("mouseenter",()=>{runAllButton.style.backgroundColor="#ff8e8e";});runAllButton.addEventListener("mouseleave",()=>{runAllButton.style.backgroundColor="#ff6b6b";});runAllButton.addEventListener("click",async()=>{for(const xpath of actions){const element=document.evaluate(xpath,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;if(element)element.click();await wait(500);}snapCount++;document.getElementById("snapCount").textContent=snapCount;});panel.appendChild(runAllButton);const loopButton=document.createElement("button");loopButton.innerText="Loop";loopButton.style.display="block";loopButton.style.width="100%";loopButton.style.padding="8px";loopButton.style.backgroundColor="#ff6b6b";loopButton.style.border="none";loopButton.style.borderRadius="6px";loopButton.style.color="white";loopButton.style.cursor="pointer";loopButton.style.transition="background-color 0.2s";loopButton.addEventListener("mouseenter",()=>{loopButton.style.backgroundColor="#ff8e8e";});loopButton.addEventListener("mouseleave",()=>{loopButton.style.backgroundColor="#ff6b6b";});loopButton.addEventListener("click",()=>{if(loopInterval){clearInterval(loopInterval);loopInterval=null;loopButton.innerText="Loop";}else{loopInterval=setInterval(async()=>{for(const xpath of actions){const element=document.evaluate(xpath,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;if(element)element.click();await wait(500);}snapCount++;document.getElementById("snapCount").textContent=snapCount;},actions.length*500);loopButton.innerText="Stop Loop";}});panel.appendChild(loopButton);document.body.appendChild(panel);};setup();addPanel();})();'>
        Drag me to bookmarks ↗️
    </a>

    
    <br>
    
    <a href="https://dougie.wtf" class="support-link">Support me (Free)</a>
</body>
</html>
