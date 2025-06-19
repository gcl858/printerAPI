// printerLib.js

// Base URL for the printer API (placeholder)
const PRINTER_API_BASE_URL = 'https://127.0.0.1:443/xxx'; // As per the issue description

/**
 * Main function to handle the printing process.
 * @param {string} systemName - The name of the system calling the library.
 * @param {string} displayMessage - The initial message to display in the popup.
 * @param {string} apiKey - The API key for authentication.
 * @param {string} printContent - The content to be printed.
 * @returns {Promise<boolean>} - True if the process is successful, false otherwise.
 */
async function handlePrintProcess(systemName, displayMessage, apiKey, printContent) {
    console.log('handlePrintProcess called with:', systemName, displayMessage, 'API_KEY_REDACTED', printContent);

    const modalElement = document.getElementById('printerModal');
    if (!modalElement) {
        console.error('Printer modal element not found in the DOM.');
        addStatusMessage('內部錯誤:找不到彈出視窗元件', 'danger');
        // No modal, so we can't show an end button in it.
        // The calling code should check the return value.
        return false;
    }
    if (typeof bootstrap === 'undefined' || typeof bootstrap.Modal === 'undefined') {
        console.error('Bootstrap Modal class not found. Make sure Bootstrap JS is loaded.');
        addStatusMessage('內部錯誤:Bootstrap未載入', 'danger');
        return false;
    }
    const printerModal = new bootstrap.Modal(modalElement);

    document.getElementById('printerModalLabel').textContent = systemName;
    document.getElementById('initialMessage').textContent = displayMessage;
    const statusList = document.getElementById('statusList');
    statusList.innerHTML = '';
    const endButton = document.getElementById('endButton');
    endButton.style.display = 'none';

    // Define a function to handle the end button click
    const handleEndButtonClick = () => {
        printerModal.hide();
        // This promise is resolved by the click handler itself
    };

    // It's important that the promise returned by handlePrintProcess
    // only resolves after the user clicks "End" or all steps complete.
    return new Promise(async (resolveOuter) => {
        endButton.onclick = () => {
            handleEndButtonClick();
            resolveOuter(false); // Resolve the main promise with false
        };

        printerModal.show();
        addStatusMessage('流程開始...', 'info');

        try {
            // Step 1: Lock API
            await callLockAPI(apiKey);
            addStatusMessage('占用 成功', 'success');

            // Step 2: Status API
            await callStatusAPI(apiKey); // Actual API call
            addStatusMessage('紙張放入 成功', 'success'); // Message upon successful API call

            // Step 3: Insert API
            await callInsertAPI(apiKey); // Actual API call
            addStatusMessage('吸入 成功', 'success'); // Message upon successful API call

            // Step 4: Print API
            await callPrintAPI(apiKey, printContent); // Actual API call with content
            addStatusMessage('列印 成功', 'success'); // Message upon successful API call

            // Step 5: Eject API
            await callEjectAPI(apiKey); // Actual API call
            addStatusMessage('排出 成功', 'success'); // Message upon successful API call

            // Step 6: Unlock API
            await callUnlockAPI(apiKey); // Actual API call
            addStatusMessage('解除 成功', 'success'); // Message upon successful API call

            // If all successful
            // printerModal.hide(); // Optionally hide modal on success
            resolveOuter(true); // Resolve the main promise with true

        } catch (error) {
            console.error('Error during print process:', error);
            addStatusMessage(`錯誤: ${error.message || '未知錯誤'}`, 'danger');
            endButton.style.display = 'block';
            // The promise will be resolved by endButton.onclick which calls resolveOuter(false)
        }
    });
}

/**
 * Helper function to add a status message to the popup.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'danger', 'info' for styling (Bootstrap alert colors).
 */
function addStatusMessage(message, type = 'info') {
    const statusList = document.getElementById('statusList');
    if (statusList) {
        const listItem = document.createElement('li');
        // Sanitize message to prevent XSS if messages could come from untrusted sources
        // For this specific case, messages are developer-defined or from API errors (which should be handled)
        listItem.textContent = message;
        listItem.className = `alert alert-${type} p-1 m-1`;
        statusList.appendChild(listItem);
        // Scroll to the bottom of the status list
        statusList.scrollTop = statusList.scrollHeight;
    } else {
        console.warn('statusList element not found. Cannot add message:', message);
    }
}

// --- API call functions ---

async function callApi(endpoint, apiKey, method = 'POST', body = null) {
    const headers = {
        'X-API-Key': apiKey
    };
    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        method: method,
        headers: headers,
    };
    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${PRINTER_API_BASE_URL}/${endpoint}`, config);

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: `API請求失敗，狀態碼: ${response.status}` };
        }
        // Use the specific error message from the API if available
        const errorMessage = errorData.error || errorData.message || `API 錯誤: ${response.status}`;
        console.error(`API Error for ${endpoint}: ${errorMessage}`, errorData);
        throw new Error(errorMessage);
    }

    // For calls that might return no content (204) or JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else if (response.status === 204) {
        return null; // No content, successful
    } else {
        // Handle other content types if necessary, or assume text for unknown
        return response.text().then(text => {
            // If text is empty for a 200/OK, treat as success (e.g. for Lock/Unlock)
            if (response.ok && !text) return null;
            return text; // Or attempt to parse if specific format expected
        });
    }
}

async function callLockAPI(apiKey) {
    // Lock is typically a POST or PUT, and might not have a request body.
    // Assuming POST for this and other state-changing operations.
    // The API description doesn't specify HTTP methods, assuming POST for actions.
    return callApi('Lock', apiKey, 'POST');
}

async function callStatusAPI(apiKey) {
    // Status is typically a GET request.
    return callApi('Status', apiKey, 'GET');
}

async function callInsertAPI(apiKey) {
    return callApi('Insert', apiKey, 'POST');
}

async function callPrintAPI(apiKey, content) {
    // Print content should be in the body.
    return callApi('Print', apiKey, 'POST', { content: content });
}

async function callEjectAPI(apiKey) {
    return callApi('Eject', apiKey, 'POST');
}

async function callUnlockAPI(apiKey) {
    return callApi('Unlock', apiKey, 'POST');
}
```
