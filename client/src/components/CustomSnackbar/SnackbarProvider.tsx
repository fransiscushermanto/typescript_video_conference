import React, { ReactElement, useEffect, useState } from "react";
import { Snackbar } from "./Snackbar";
import {
  OptionsObject,
  SnackbarProviderProps,
  SnackbarKey,
  SnackbarMessage,
  ProviderContext,
  Severities,
} from "./types";
import { useIdGenerator } from "./useIdGenerator";

const SnackbarContext = React.createContext<ProviderContext>({
  addSnack: (message: SnackbarMessage, options: OptionsObject) => "",
  removeSnack: (key: SnackbarKey) => {},
});

let newSnacks = [];
let que = [];
const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
  maxStack = 3,
  sort = "desc",
}) => {
  const { generate } = useIdGenerator();
  const [snacks, setSnacks] = useState<Array<Element | JSX.Element>>([]);

  const addSnack = (
    message: SnackbarMessage,
    options: OptionsObject,
  ): SnackbarKey => {
    const { severity, action, autoHideDuration, id, stack } = options;
    let randID = generate(8);
    let snack = (
      <Snackbar
        key={id ? id : randID}
        id={id ? id : randID}
        stack={stack}
        severity={severity === "" ? Severities.INFO : severity}
        autoHideDuration={autoHideDuration}
        action={action}
        message={message}
      />
    );
    if (stack) {
      if (snacks.length < maxStack) {
        newSnacks = [...newSnacks];
        if (sort === "desc") {
          newSnacks.unshift(snack);
        } else if (sort === "asc") {
          newSnacks.push(snack);
        }
        setSnacks(newSnacks);
      } else {
        que.push(snack);
        setSnacks(newSnacks);
      }
    } else {
      newSnacks = [...newSnacks, snack];
      setSnacks(newSnacks);
    }
    return id;
  };

  const removeSnack = (id: SnackbarKey): void => {
    let filtered = newSnacks.filter(
      (snack: ReactElement) => snack.props.id !== id,
    );
    newSnacks = filtered;
    if (que.length > 0) {
      if (sort === "desc") {
        newSnacks.unshift(que.shift());
      } else if (sort === "asc") {
        newSnacks.push(que.shift());
      }
      setSnacks(newSnacks);
    } else {
      setSnacks(newSnacks);
    }
  };

  let combinedchild: Array<any> = React.Children.map(
    children,
    (child: { type }) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, null, snacks);
      }
      return child;
    },
  );

  return (
    <SnackbarContext.Provider
      value={{ addSnack: addSnack, removeSnack: removeSnack }}
    >
      {combinedchild}
    </SnackbarContext.Provider>
  );
};

const useSnackbar = () => {
  return React.useContext(SnackbarContext);
};

export { SnackbarProvider, useSnackbar };
