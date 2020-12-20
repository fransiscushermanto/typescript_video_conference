import React, { useState, useEffect } from "react";
import { Alert as MuiAlert } from "@material-ui/lab";
import styled from "styled-components";
import { OptionsObject, Severities } from "./types";
import { useSnackbar } from "./SnackbarProvider";

interface Props extends OptionsObject {
  message: string;
}

const Wrapper = styled.div`
  padding: 6px 16px;
  color: white;
  transition: all 0.5s ease-in;
  bottom: 1%;
  position: ${(props: { stack: boolean }) =>
    props.stack ? "relative" : "fixed"};
`;

const Snackbar: React.FC<Props> = ({
  id,
  stack = false,
  severity = Severities.INFO,
  message,
  autoHideDuration = 6000,
  action,
}) => {
  const { removeSnack } = useSnackbar();
  function Alert(props): JSX.Element {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  useEffect(() => {
    setTimeout(() => {
      removeSnack(id);
    }, autoHideDuration);
  }, [autoHideDuration, removeSnack, id]);

  return (
    <Wrapper key={id} id={`${id}`} stack={stack}>
      <Alert severity={severity} action={action}>
        {message}
      </Alert>
    </Wrapper>
  );
};
export { Snackbar };
