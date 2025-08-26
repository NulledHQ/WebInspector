// js/devtools-filters.js

export function setupFilters({
  methodFilterButton, methodFilterDropdown, methodFilterList,
  typeFilterButton, typeFilterDropdown, typeFilterList,
  statusFilterButton, statusFilterDropdown, statusFilterList
}, availableMethods, availableTypes, availableStatuses, filterCallback) { // Add filterCallback

  function toggleDropdown(button, dropdown) {
    return () => dropdown.classList.toggle('show');
  }

  methodFilterButton.addEventListener('click', toggleDropdown(methodFilterButton, methodFilterDropdown));
  typeFilterButton.addEventListener('click', toggleDropdown(typeFilterButton, typeFilterDropdown));
  statusFilterButton.addEventListener('click', toggleDropdown(statusFilterButton, statusFilterDropdown));

  function updateFilter(listEl, availableMap) { // Remove the callback from here
    listEl.innerHTML = '';
    availableMap.forEach((checked, key) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <input type="checkbox" value="${key}" ${checked ? 'checked' : ''}> ${key}
      `;
      listEl.appendChild(li);
      li.querySelector('input').addEventListener('change', (e) => {
        availableMap.set(key, e.target.checked);
        filterCallback(); // Use the single callback passed during setup
      });
    });
  }

  return {
    // These functions no longer need to accept a callback
    updateMethodFilters: () => updateFilter(methodFilterList, availableMethods),
    updateTypeFilters: () => updateFilter(typeFilterList, availableTypes),
    updateStatusFilters: () => updateFilter(statusFilterList, availableStatuses),
  };
}