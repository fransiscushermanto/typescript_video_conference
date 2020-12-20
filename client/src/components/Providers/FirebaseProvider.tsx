import React from "react";
import Firebase from "../../firebase/config";

interface Props {
  children: React.ReactNode;
}

const FirebaseContext = React.createContext<Firebase>(null);

const FirebaseProvider: React.FC<Props> = ({ children }) => {
  return (
    <FirebaseContext.Provider value={new Firebase()}>
      {children}
    </FirebaseContext.Provider>
  );
};

export { FirebaseProvider, FirebaseContext };
