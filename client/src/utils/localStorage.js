// Set item with expiry
export function setItemWithExpiry(key, value, timeToLive) {
  const now = new Date();

  const item = {
    value: value,
    expiry: now.getTime() + timeToLive, // ttl in milliseconds
  };

  localStorage.setItem(key, JSON.stringify(item));
}

// Get item and check expiry
export function getItemWithExpiry(key) {
  const itemStr = localStorage.getItem(key);

  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}
