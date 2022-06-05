import { format, formatDuration, intervalToDuration } from "date-fns";
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
  options: NotificationOptions & { link?: string } = {
    icon: Icon,
  },
) {
  try {
    const { link, ...resOptions } = options;

    const title = "Video Room";
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      return;
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      const notification = new Notification(title, resOptions);
      notification.addEventListener("click", () => {
        window.open(link, "_blank");
      });
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          const notification = new Notification(title, resOptions);
          notification.addEventListener("click", () => {
            window.open(link, "_blank");
          });
        }
      });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
  } catch (error) {
    console.log("pushNotif Error", error);
  }
}

export function numberFromText(text) {
  // numberFromText("AA");
  const charCodes = text
    .split("") // => ["A", "A"]
    .map((char) => char.charCodeAt(0)) // => [65, 65]
    .join(""); // => "6565"
  return charCodes;
}

export function getInitialFromString(string: string, splitter: string = " ") {
  const arrStr = String(string).split(splitter);
  if (arrStr.length > 1) {
    return (
      arrStr[0].substr(0, 1).toUpperCase() +
      arrStr[1].substr(0, 1).toUpperCase()
    );
  } else {
    return arrStr[0].substr(0, 1).toUpperCase();
  }
}

export function hashCode(str) {
  // java String#hashCode
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

export function intToRGB(i) {
  var c = (i & 0x00ffffff).toString(16).toUpperCase();

  return "#" + "00000".substring(0, 6 - c.length) + c;
}

export function setMobileCSSHeightProperty() {
  document.documentElement.style.setProperty(
    "--vh",
    `${window.innerHeight * 0.01}px`,
  );
}

export function generateEmptyMediaTrack() {
  const createEmptyAudioTrack = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination()) as any;
    oscillator.start();
    const track = dst.stream.getAudioTracks()[0];
    return Object.assign(track, { enabled: false });
  };

  const createEmptyVideoTrack = ({ width, height }) => {
    const canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    }) as any;
    canvas.getContext("2d").fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    const track = stream.getVideoTracks()[0];

    return Object.assign(track, { enabled: false });
  };

  const audioTrack = createEmptyAudioTrack();
  const videoTrack = createEmptyVideoTrack({ width: 960, height: 720 });
  return new MediaStream([audioTrack, videoTrack]);
}

export function range(n: number) {
  return Array(n).fill(n);
}

export const b64toBlob = (base64) => fetch(base64).then((res) => res.blob());

const formatDistanceLocale = (token: DurationToken, count) => {
  switch (token) {
    case "lessThanXSeconds":
    case "xSeconds":
      return `${count} second(s)`;
    case "halfAMinute":
    case "lessThanXMinutes":
    case "xMinutes":
      return `${count} minute(s)`;
    case "aboutXHours":
    case "xHours":
      return `${count} hour(s)`;
    case "xDays":
      return `${count} day(s)`;
  }
};

type DurationToken =
  | "lessThanXSeconds"
  | "xSeconds"
  | "halfAMinute"
  | "lessThanXMinutes"
  | "xMinutes"
  | "aboutXHours"
  | "xHours"
  | "xDays";

function customFormatDistance(token: DurationToken, count, options: any = {}) {
  const result = formatDistanceLocale(token, count);
  return result;
}

export function formatTimeDurationToReadableFormat({
  start = 0,
  end = 0,
  format,
  delimiter,
}: {
  start?: number | Date;
  end?: number | Date;
  format: ("hours" | "minutes" | "days" | "seconds")[];
  delimiter?: string;
}) {
  return formatDuration(
    intervalToDuration({
      start,
      end,
    }),
    {
      format,
      delimiter,
      locale: {
        code: window.document.documentElement.lang,
        formatDistance: (token: DurationToken, count, options) =>
          customFormatDistance(token, count, { ...options }),
      },
    },
  );
}

export function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

export function stringToArrayBuffer(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

export function addToFormData(object: { [key: string]: any }) {
  const formData = new FormData();

  Object.entries(object).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return formData;
}
