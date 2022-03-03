import * as React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { MessageProvider } from "./components/Providers/MessageProvider";
import HttpsRedirect from "react-https-redirect";
import DateFnsUtils from "@date-io/date-fns";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { FirebaseProvider } from "./components/Providers/FirebaseProvider";
import { AuthProvider } from "./components/Providers/AuthProvider";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import GlobalStyles from "./styles/app";
import { SocketProvider } from "./components/Providers/SocketProvider";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";

export const queryClient = new QueryClient();

ReactDOM.render(
  <BrowserRouter>
    <HttpsRedirect>
      <QueryClientProvider client={queryClient}>
        <FirebaseProvider>
          <SocketProvider>
            <AuthProvider>
              <MessageProvider>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <App />
                </MuiPickersUtilsProvider>
              </MessageProvider>
            </AuthProvider>
          </SocketProvider>
        </FirebaseProvider>
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools position="top-right" />
        )}
      </QueryClientProvider>
      <GlobalStyles />
    </HttpsRedirect>
  </BrowserRouter>,
  document.getElementById("root"),
);
