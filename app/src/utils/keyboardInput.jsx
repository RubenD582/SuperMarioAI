// utils/keyboardInput.js
const keyState = {};

const listeners = [];

export default function setupKeyboardInput() {
  window.addEventListener('keydown', (e) => {
    keyState[e.key.toLowerCase()] = true;
    notifyListeners();
  });

  window.addEventListener('keyup', (e) => {
    keyState[e.key.toLowerCase()] = false;
    notifyListeners();
  });

  window.keyState = keyState; // Optional, if other code still uses it
}

function notifyListeners() {
  listeners.forEach((cb) => cb(keyState));
}

export function subscribeToKeys(callback) {
  listeners.push(callback);
}
