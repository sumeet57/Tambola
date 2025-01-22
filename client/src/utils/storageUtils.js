// storageUtils.js

// Update localStorage and emit a custom event
export const updateLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
  window.dispatchEvent(new Event("localStorageUpdated"));
};

// Update sessionStorage and emit a custom event
export const updateSessionStorage = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("sessionStorageUpdated"));
};
