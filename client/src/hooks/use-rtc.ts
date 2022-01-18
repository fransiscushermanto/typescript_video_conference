import React from "react";
import { RTCContext } from "../components/Providers/RTCProvider";

export default function useRTC() {
  return React.useContext(RTCContext);
}
