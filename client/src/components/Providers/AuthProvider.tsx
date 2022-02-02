import React, { useEffect, useState } from "react";
import { useFirebase, useMe, useRoom, useSocket } from "../../hooks";
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

  const socket = useSocket();
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
    if (res) {
      const data = {
        user_id: res.uid,
        user_name: res.displayName,
      };
      socket.connect();
      socket.emit("LIST_USER_SOCKET", { me: data });
      setMe(data);
      history.push("/");
    }
  }

  useEffect(() => {
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        const data = {
          ...me,
          user_id: user.uid,
          user_name: user.displayName,
        };
        setMe(data);
        socket.emit("LIST_USER_SOCKET", { me: data });
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
