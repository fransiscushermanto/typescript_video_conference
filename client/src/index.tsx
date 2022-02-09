import * as React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { MessageProvider } from "./components/Providers/MessageProvider";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { FirebaseProvider } from "./components/Providers/FirebaseProvider";
import { AuthProvider } from "./components/Providers/AuthProvider";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import GlobalStyles from "./styles/app";
import { SocketProvider } from "./components/Providers/SocketProvider";

const queryClient = new QueryClient();

ReactDOM.render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <FirebaseProvider>
        <SocketProvider>
          <AuthProvider>
            <MessageProvider>
              <App />
            </MessageProvider>
          </AuthProvider>
        </SocketProvider>
      </FirebaseProvider>
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </QueryClientProvider>
    <GlobalStyles />
  </BrowserRouter>,
  document.getElementById("root"),
);
