// js/devtools.js
import { setupFilters } from "./devtools-filters.js";
import { setupModal } from "./devtools-modal.js";
import { addRequestToTable } from "./devtools-table.js";
import { formatHeaders, formatJSON, highlightJSON, parseHeadersString } from "./devtools-utils.js";

chrome.devtools.panels.create("WebInspector", "", "../html/devtools.html", () => {});

document.addEventListener("DOMContentLoaded", () => {
  const requestTableBody = document.getElementById("request-table-body");
  const urlFilter = document.getElementById("url-filter");
  const clearAll = document.getElementById("clear-all");
  const ignoreExtensionsCheckbox = document.getElementById('ignore-extensions-checkbox');

  const customButton = document.getElementById("custom-button");
  const customModal = document.getElementById("custom-modal");
  const closeCustomModal = document.getElementById("close-custom-modal");
  const customRequestForm = document.getElementById("custom-request-form");
  const customResponseStatus = document.getElementById("custom-response-status");
  const customResponseHeaders = document.getElementById("custom-response-headers");
  const customResponseBody = document.getElementById("custom-response-body");
  
  const imageModal = document.getElementById('image-modal');
  const closeImageModal = document.getElementById('close-image-modal');
  const responseImageViewer = document.getElementById('response-image-viewer');

  const encodeBodyBtn = document.getElementById('encode-body-btn');
  const decodeBodyBtn = document.getElementById('decode-body-btn');
  const customBodyTextarea = document.getElementById('custom-body');

  let previousImageBlobUrl = null;
  const availableMethods = new Map();
  const availableTypes = new Map();
  const availableStatuses = new Map();
  const requestDetailsMap = new Map();

  const { openDetailsModal } = setupModal(requestDetailsMap, customModal);

  ignoreExtensionsCheckbox.addEventListener('change', applyFilters);
  
  customButton.addEventListener("click", () => customModal.style.display = "flex");
  closeCustomModal.addEventListener("click", () => customModal.style.display = "none");
  closeImageModal.addEventListener('click', () => {
    imageModal.style.display = 'none';
    if (previousImageBlobUrl) {
      URL.revokeObjectURL(previousImageBlobUrl);
      previousImageBlobUrl = null;
    }
  });

  decodeBodyBtn.addEventListener('click', () => {
    try {
      let decoded = decodeURIComponent(customBodyTextarea.value);
      try {
        decoded = formatJSON(decoded);
      } catch (e) { /* Not JSON, just use the decoded string */ }
      customBodyTextarea.value = decoded;
    } catch (e) {
      console.error("Failed to decode text: ", e);
    }
  });

  encodeBodyBtn.addEventListener('click', () => {
    try {
      customBodyTextarea.value = encodeURIComponent(customBodyTextarea.value);
    } catch (e) {
      console.error("Failed to encode text: ", e);
    }
  });

  customRequestForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = document.getElementById("custom-url").value;
    const method = document.getElementById("custom-method").value;
    const headersString = document.getElementById("custom-headers").value;
    const body = document.getElementById("custom-body").value;

    customResponseStatus.value = "";
    customResponseHeaders.innerHTML = "Sending request...";
    customResponseBody.innerHTML = "";
    imageModal.style.display = 'none';
    if (previousImageBlobUrl) {
      URL.revokeObjectURL(previousImageBlobUrl);
      previousImageBlobUrl = null;
    }
    
    const startTime = performance.now();
    try {
      const customHeaders = parseHeadersString(headersString);
      const options = { method, headers: customHeaders, body: (method !== 'GET' && body) ? body : null };

      const response = await fetch(url, options);
      const endTime = performance.now();
      
      const responseForDisplay = response.clone();
      const responseForLog = response;

      customResponseStatus.value = `${responseForDisplay.status} ${responseForDisplay.statusText}`;
      const responseHeadersArray = Array.from(responseForDisplay.headers.entries()).map(([key, value]) => `${key}: ${value}`);
      customResponseHeaders.innerHTML = responseHeadersArray.join('\n');

      const contentType = responseForDisplay.headers.get("content-type");
      let responseBodyForLog = '';

      if (contentType && contentType.startsWith("image/")) {
        customResponseBody.textContent = `[Image content shown in separate window]`;
        
        const imageBlob = await responseForDisplay.blob();
        previousImageBlobUrl = URL.createObjectURL(imageBlob);
        responseImageViewer.src = previousImageBlobUrl;
        imageModal.style.display = 'flex';
        
        responseBodyForLog = `[Image content received (${contentType})]`;
      } else {
        const responseBody = await responseForDisplay.text();
        customResponseBody.innerHTML = highlightJSON(responseBody);
        responseBodyForLog = responseBody;
      }
      
      const id = crypto.randomUUID();
      const requestHeadersForLog = Object.entries(customHeaders).map(([name, value]) => ({ name, value }));
      const responseHeadersForLog = responseHeadersArray.map(h => {
        const parts = h.split(/:\s*(.*)/);
        return { name: parts[0], value: parts[1] };
      });

      const details = {
        url: url,
        method: method,
        status: responseForLog.status.toString(),
        type: 'CUSTOM',
        time: Math.round(endTime - startTime),
        requestHeaders: formatHeaders(requestHeadersForLog),
        requestBody: body,
        responseHeaders: formatHeaders(responseHeadersForLog),
        responseBody: highlightJSON(responseBodyForLog),
        rawRequestHeaders: requestHeadersForLog,
        rawResponseHeaders: responseHeadersForLog
      };

      requestDetailsMap.set(id, details);
      addRequestToTable(id, details, requestTableBody, requestDetailsMap, openDetailsModal);
      applyFilters();
      
    } catch (error) {
      customResponseHeaders.textContent = `Error: ${error.message}`;
      customResponseBody.innerHTML = "";
      customResponseStatus.value = "Error";
    }
  });

  function applyFilters() {
    const urlFilterValue = urlFilter.value.toLowerCase();
    const ignoreExtensions = ignoreExtensionsCheckbox.checked;

    requestTableBody.querySelectorAll("tr").forEach((row) => {
      const method = row.getAttribute('data-method');
      const type = row.getAttribute('data-type');
      const status = row.getAttribute('data-status');
      const urlCell = row.querySelector(".url-cell");

      const urlMatch = urlCell && urlCell.textContent.toLowerCase().includes(urlFilterValue);
      const methodMatch = availableMethods.get(method);
      const typeMatch = availableTypes.get(type);
      const statusMatch = availableStatuses.get(status);
      const extensionMatch = !ignoreExtensions || (urlCell && !urlCell.textContent.startsWith('chrome-extension://'));

      if (urlMatch && methodMatch && typeMatch && statusMatch && extensionMatch) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  const { updateMethodFilters, updateTypeFilters, updateStatusFilters } =
    setupFilters(
      {
        methodFilterButton: document.getElementById("method-filter-button"),
        methodFilterDropdown: document.getElementById("method-filter-dropdown"),
        methodFilterList: document.getElementById("method-filter-list"),
        typeFilterButton: document.getElementById("type-filter-button"),
        typeFilterDropdown: document.getElementById("type-filter-dropdown"),
        typeFilterList: document.getElementById("type-filter-list"),
        statusFilterButton: document.getElementById("status-filter-button"),
        statusFilterDropdown: document.getElementById("status-filter-dropdown"),
        statusFilterList: document.getElementById("status-filter-list"),
      },
      availableMethods,
      availableTypes,
      availableStatuses,
      applyFilters
    );

  clearAll.addEventListener("click", () => {
    requestTableBody.innerHTML = "";
    availableMethods.clear();
    availableTypes.clear();
    availableStatuses.clear();
    updateMethodFilters();
    updateTypeFilters();
    updateStatusFilters();
    requestDetailsMap.clear();
  });

  chrome.devtools.network.onRequestFinished.addListener((request) => {
    const id = crypto.randomUUID();
    request.getContent((body) => {
      const details = {
        url: request.request.url,
        method: request.request.method,
        status: request.response.status.toString(),
        type: (request._resourceType || "unknown").toUpperCase(),
        time: request.time ? Math.round(request.time) : "N/A",
        requestHeaders: formatHeaders(request.request.headers || []),
        requestBody: request.request.postData?.text || "",
        responseHeaders: formatHeaders(request.response.headers || []),
        responseBody: body ? highlightJSON(body) : "",
        rawRequestHeaders: request.request.headers || [],
        rawResponseHeaders: request.response.headers || [],
      };

      requestDetailsMap.set(id, details);

      if (!availableMethods.has(details.method)) {
        availableMethods.set(details.method, true);
        updateMethodFilters();
      }
      if (!availableTypes.has(details.type)) {
        availableTypes.set(details.type, true);
        updateTypeFilters();
      }
      if (!availableStatuses.has(details.status)) {
        availableStatuses.set(details.status, true);
        updateStatusFilters();
      }

      addRequestToTable(id, details, requestTableBody, requestDetailsMap, openDetailsModal);
      applyFilters();
    });
  });

  urlFilter.addEventListener("input", applyFilters);
});