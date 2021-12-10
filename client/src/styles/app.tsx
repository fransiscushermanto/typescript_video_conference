import { Global } from "@emotion/react";

import global from "./global";
import styles from "./style";

function GlobalStyles() {
  return (
    <>
      <Global styles={global} />
      <Global styles={styles} />
    </>
  );
}

export default GlobalStyles;
