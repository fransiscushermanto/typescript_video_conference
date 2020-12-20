import { User } from "@firebase/auth";
import React, { useEffect, useState } from "react";
import { useFirebase, useRoom } from "../../hooks";
import { useHistory } from "react-router-dom";
import Cookies from "js-cookie";

interface Props {
  children: React.ReactNode;
}

interface IAuthContext {
  isLoggedIn?: boolean;
  logout: () => void;
  login: () => void;
}

const AuthContext = React.createContext<IAuthContext>({
  isLoggedIn: false,
  logout: () => {},
  login: () => {},
});

const AuthProvider: React.FC<Props> = ({ children }) => {
  const firebase = useFirebase();
  const history = useHistory();
  const { meState } = useRoom();

  const [me, setMe] = meState;
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!Cookies.get("Authorization"),
  );

  function logout() {
    setIsLoggedIn(false);
    firebase.logout();
    history.push("/login");
  }

  async function login() {
    const res: any = await firebase.login();
    setMe({
      user_id: res.uid,
      user_name: res.displayName,
    });
    history.push("/");
  }

  useEffect(() => {
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        setMe({
          ...me,
          user_id: user.uid,
          user_name: user.displayName,
        });
        setIsLoggedIn(true);
      }
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        logout,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
