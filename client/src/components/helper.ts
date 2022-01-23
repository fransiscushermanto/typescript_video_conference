import Icon from "../assets/logo.svg";

export function detectOnBlur(ref, state, setState) {
  function handleClickOutside(event) {
    if (ref.current && !ref.current.contains(event.target)) {
      if (state === true) {
        setState(false);
      }
    }
  }
  document.addEventListener("mouseup", handleClickOutside);
}

export function compare2Objects(x, y) {
  var p;

  // remember that NaN === NaN returns false
  // and isNaN(undefined) returns true
  if (isNaN(x) && isNaN(y) && typeof x === "number" && typeof y === "number") {
    return true;
  }

  // Compare primitives and functions.
  // Check if both arguments link to the same object.
  // Especially useful on the step where we compare prototypes
  if (x === y) {
    return true;
  }

  // Works in case when functions are created in constructor.
  // Comparing dates is a common scenario. Another built-ins?
  // We can even handle functions passed across iframes
  if (
    (typeof x === "function" && typeof y === "function") ||
    (x instanceof Date && y instanceof Date) ||
    (x instanceof RegExp && y instanceof RegExp) ||
    (x instanceof String && y instanceof String) ||
    (x instanceof Number && y instanceof Number)
  ) {
    return x.toString() === y.toString();
  }

  // At last checking prototypes as good as we can
  if (!(x instanceof Object && y instanceof Object)) {
    return false;
  }

  if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
    return false;
  }

  if (x.constructor !== y.constructor) {
    return false;
  }

  if (x.prototype !== y.prototype) {
    return false;
  }

  // Quick checking of one object being a subset of another.
  // todo: cache the structure of arguments[0] for performance
  for (p in y) {
    if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
      return false;
    } else if (typeof y[p] !== typeof x[p]) {
      return false;
    }
  }

  for (p in x) {
    if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
      return false;
    } else if (typeof y[p] !== typeof x[p]) {
      return false;
    }

    switch (typeof x[p]) {
      case "object":
      case "function":
        if (!compare2Objects(x[p], y[p])) {
          return false;
        }
        break;

      default:
        if (x[p] !== y[p]) {
          return false;
        }
        break;
    }
  }

  return true;
}

export const callAllFunctions =
  (...fns) =>
  (...args) =>
    fns.forEach((fn) => fn?.(...args));

export function pushNotification(
  options: NotificationOptions = {
    icon: Icon,
  },
) {
  const title = "Video Room";
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    return;
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    new Notification(title, options);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        new Notification(title, options);
      }
    });
  }

  // At last, if the user has denied notifications, and you
  // want to be respectful there is no need to bother them any more.
}
