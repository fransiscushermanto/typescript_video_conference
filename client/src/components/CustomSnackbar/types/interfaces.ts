import { Severities } from "./constant";
export type SnackbarKey = string | number;
export type SnackbarMessage = string;
export type SnackbarAction =
  | React.ReactNode
  | ((key: SnackbarKey) => React.ReactNode);

export interface OptionsObject {
  /**
   * Unique identifier for snackbar
   * @default random generated string
   */
  id?: SnackbarKey;
  /**
   * Used to define snackbar type and snackbar-background color
   * @default info
   */
  severity?: Severities | string;
  /**
   * Used to define time for snackbar to leave
   * @default 6000(ms)
   */
  autoHideDuration?: number;
  /**
   * Define stack is stackable or unstackable;
   * @default false
   */
  stack?: boolean;
  /**
   * Callback used for closed actions. Mostly button dislpayed in snackbar.
   * @param {string, number} key for snackbar.
   */
  action?: SnackbarAction;
}

export interface SnackbarProviderProps {
  children: React.ReactNode;
  /**
   * Maximum Snack that can be stacked
   * @default 3
   */
  maxStack?: number;
  /**
   * @params {string} "asc" or "desc".
   * @default desc (descending)
   */
  sort?: string;
}

export interface ProviderContext {
  addSnack: (message: SnackbarMessage, options?: OptionsObject) => {};
  removeSnack: (key?: SnackbarKey) => void;
}
