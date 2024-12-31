// Wait function to introduce delays
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to delete an element by XPath
const deleteElement = async (xpath) => {
    const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (element) element.remove();
};

// Function to hide an element by XPath
const hideElement = async (xpath) => {
    const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (element) element.style.display = 'none';
};

// Function to resize an element by XPath
const resizeElement = async (xpath, scale) => {
    const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (element) element.style.transform = `scale(${scale})`;
};

// Setup process
const setup = async () => {
    await deleteElement('/html/body/main/div[1]/div[2]');
    await wait(500);
    await deleteElement('/html/body/main/div[1]/div[2]/div/div/div/div[1]');
    await wait(500);
    await hideElement('/html/body/main/div[1]/div[2]/div/div/div');
    await wait(500);
    await hideElement('/html/body/main/div[1]/div[2]/div/div/div/div/div[1]/ul');
    await wait(500);
    await deleteElement('/html/body/main/div[1]/div[2]/div/div/div/div/div[2]/div/div');
    await wait(500);
    await deleteElement('/html/body/main/div[1]/div[2]/div/div/div/div/div[2]/div/button[2]');
    await wait(500);
    await deleteElement('/html/body/main/div[1]/div[2]/div/div/div/div/div[2]/div/button[2]');
    await wait(500);
    await deleteElement('/html/body/main/div[1]/div[3]/div/div/div/div[2]/div[2]/div/button[2]');
    await wait(500);
    await deleteElement('/html/body/main/div[1]/div[3]/div/div/div/div[2]/div[2]/div/button[2]');
    await wait(500);
    await deleteElement('/html/body/main/div[1]/div[3]/div/div/div/div[2]/div[2]/div/button[2]');
    await wait(500);
    await resizeElement('/html/body/main/div[1]/div[2]/div/div/div/div/div[2]', 2);
    await wait(500);

    // Continuously delete the first <li> element inside the specified <ul>
    const ulXpath = '/html/body/main/div[1]/div[2]/div/div/div/div/div[1]/ul/li[3]/div/ul/li[2]';
    const deleteFirstLi = async () => {
        while (true) {
            const ul = document.evaluate(ulXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (!ul || !ul.firstChild) break;
            ul.firstChild.remove();
            await wait(500);
        }
    };
    deleteFirstLi();
};

// Add the panel to the right side of the screen
const addPanel = () => {
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.top = '10px';
    panel.style.right = '10px';
    panel.style.backgroundColor = '#f1f1f1';
    panel.style.border = '1px solid #ccc';
    panel.style.padding = '10px';
    panel.style.zIndex = '10000';

    // Add buttons
    const actions = [
        '/html/body/main/div[1]/div[2]/div/div/div/div/div[2]/div/button',
        '/html/body/div[1]/div/div/div/div/div/div/div/div[2]/div/div/div[1]/button[1]',
        '/html/body/div[1]/div/div/div/div/div/div/div[2]/div[2]/button[2]',
        '/html/body/div[1]/div/div/div/div/div/div/div[1]/div/form/div[2]/button',
    ];

    let loopInterval = null;

    actions.forEach((xpath, index) => {
        const button = document.createElement('button');
        button.innerText = `Button ${index + 1}`;
        button.style.display = 'block';
        button.style.marginBottom = '5px';
        button.addEventListener('click', async () => {
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (element) element.click();
        });
        panel.appendChild(button);
    });

    // Add "Run All" button
    const runAllButton = document.createElement('button');
    runAllButton.innerText = 'Run All';
    runAllButton.style.display = 'block';
    runAllButton.style.marginBottom = '5px';
    runAllButton.addEventListener('click', async () => {
        for (const xpath of actions) {
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (element) element.click();
            await wait(500);
        }
    });
    panel.appendChild(runAllButton);

    // Add "Loop" button
    const loopButton = document.createElement('button');
    loopButton.innerText = 'Loop';
    loopButton.style.display = 'block';
    loopButton.addEventListener('click', () => {
        if (loopInterval) {
            clearInterval(loopInterval);
            loopInterval = null;
            loopButton.innerText = 'Loop';
        } else {
            loopInterval = setInterval(async () => {
                for (const xpath of actions) {
                    const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    if (element) element.click();
                    await wait(500);
                }
            }, actions.length * 500);
            loopButton.innerText = 'Stop Loop';
        }
    });
    panel.appendChild(loopButton);

    // Add image beside buttons
    const imgXpath = '//*[@id="root"]/div[1]/div[2]/div/div/div/div/div[1]/div[1]/div/div/div/img';
    const imgElement = document.evaluate(imgXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (imgElement) {
        const clonedImg = imgElement.cloneNode(true);
        clonedImg.style.display = 'block';
        clonedImg.style.marginBottom = '10px';
        panel.insertBefore(clonedImg, panel.firstChild);
    }

    document.body.appendChild(panel);
};

// Run setup and add panel
setup();
addPanel();
