import React, { useEffect, useState } from "react";
import { useFirebase, useMe, useRoom } from "../../hooks";
import { useHistory } from "react-router-dom";
import Cookies from "js-cookie";
import { QueryClient } from "react-query";

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
  const queryClient = new QueryClient();
  const firebase = useFirebase();
  const history = useHistory();

  const [me, setMe] = useMe();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!Cookies.get("Authorization"),
  );

  function logout() {
    setIsLoggedIn(false);
    firebase.logout();
    queryClient.removeQueries("rooms");
    queryClient.invalidateQueries("rooms");
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
      } else {
        history.push("/");
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
