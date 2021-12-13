import axios from "axios";

var instance = axios.create({
  baseURL: `${process.env.REACT_APP_SOCKET_URL || window.location.origin}/api`,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, PATCH, DELETE",
    "X-Requested-With": "XMLHttpRequest",
  },
});

export default instance;
