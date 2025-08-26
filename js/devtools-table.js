// js/devtools-table.js

export function addRequestToTable(id, request, requestTableBody, requestDetailsMap, openDetailsModal) {
  const row = document.createElement('tr');
  // Add data attributes for filtering
  row.setAttribute('data-method', request.method);
  row.setAttribute('data-type', request.type);
  row.setAttribute('data-status', request.status);

  row.innerHTML = `
    <td><span class="clear-btn" data-id="${id}">X</span></td>
    <td>${request.method}</td>
    <td>${request.time}ms</td>
    <td>${request.type}</td>
    <td>${request.status}</td>
    <td class="url-cell">${request.url}</td>
  `;

  // Clicking a row opens details modal (unless it's the X button)
  row.addEventListener('click', (e) => {
    if (e.target.classList.contains('clear-btn')) return;
    openDetailsModal(id);
  });

  // Insert at the top of the table
  requestTableBody.prepend(row);

  // Handle "X" clear button
  row.querySelector('.clear-btn').addEventListener('click', () => {
    requestDetailsMap.delete(id);
    row.remove();
  });
}