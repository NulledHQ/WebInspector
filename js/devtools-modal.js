// js/devtools-modal.js
import { formatJSON, highlightJSON } from "./devtools-utils.js";

export function setupModal(requestDetailsMap, customModal) { 
  const detailsModal = document.getElementById('details-modal');
  const closeDetails = document.getElementById('close-details');
  let editAndReplayButton = document.getElementById('edit-and-replay-button');

  // --- New Helper Function to make an element's content selectable on click ---
  const makeContentSelectable = (element) => {
    element.addEventListener('click', () => {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    });
  };

  // Apply the selectable behavior to all <pre> blocks in the details modal
  makeContentSelectable(document.getElementById('details-request-body-display'));
  makeContentSelectable(document.getElementById('details-request-headers'));
  makeContentSelectable(document.getElementById('details-response-headers'));
  makeContentSelectable(document.getElementById('details-response-body'));

  closeDetails.addEventListener('click', () => {
    detailsModal.style.display = 'none';
  });

  function openDetailsModal(id) {
    const details = requestDetailsMap.get(id);
    if (!details) return;

    document.getElementById('details-url').value = details.url;
    document.getElementById('details-method').value = details.method;
    document.getElementById('details-status').value = details.status;
    document.getElementById('details-request-body-display').innerHTML = highlightJSON(details.requestBody);
    document.getElementById('details-request-headers').innerHTML = details.requestHeaders;
    document.getElementById('details-response-headers').innerHTML = details.responseHeaders;
    document.getElementById('details-response-body').innerHTML = details.responseBody;

    const newEditButton = editAndReplayButton.cloneNode(true);
    editAndReplayButton.parentNode.replaceChild(newEditButton, editAndReplayButton);
    editAndReplayButton = newEditButton;

    editAndReplayButton.addEventListener('click', () => {
      const currentDetails = requestDetailsMap.get(id);
      if (!currentDetails) return;

      document.getElementById('custom-url').value = currentDetails.url;
      document.getElementById('custom-method').value = currentDetails.method;
      
      const headersString = (currentDetails.rawRequestHeaders || [])
        .map(h => `${h.name}: ${h.value}`).join('\n');
      document.getElementById('custom-headers').value = headersString;
      
      document.getElementById('custom-body').value = formatJSON(currentDetails.requestBody);

      detailsModal.style.display = 'none';
      customModal.style.display = 'flex';
    });

    detailsModal.style.display = 'flex';
  }

  return { openDetailsModal };
}