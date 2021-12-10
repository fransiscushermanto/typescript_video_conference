import * as React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { RoomProvider } from "./components/Providers/RoomProvider";
import { MessageProvider } from "./components/Providers/MessageProvider";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { FirebaseProvider } from "./components/Providers/FirebaseProvider";
import { AuthProvider } from "./components/Providers/AuthProvider";
import { QueryClient, QueryClientProvider } from "react-query";
import GlobalStyles from "./styles/app";

const queryClient = new QueryClient();

ReactDOM.render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <FirebaseProvider>
        <RoomProvider>
          <AuthProvider>
            <MessageProvider>
              <App />
            </MessageProvider>
          </AuthProvider>
        </RoomProvider>
      </FirebaseProvider>
    </QueryClientProvider>
    <GlobalStyles />
  </BrowserRouter>,
  document.getElementById("root"),
);
