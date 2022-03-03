import React, { useState } from "react";
import { SnackbarItem } from "../CustomSnackbar/types";

interface Props {
  children: React.ReactNode;
}

const MessageContext = React.createContext<
  [[], React.Dispatch<React.SetStateAction<SnackbarItem[]>>]
>([[], () => {}]);

const ErrorProvider: React.FC<Props> = ({ children }) => {
  const [messages, setMessages] = useState<[]>([]);

  return (
    <MessageContext.Provider value={[messages, setMessages]}>
      {children}
    </MessageContext.Provider>
  );
};

export { ErrorProvider as MessageProvider, MessageContext };
