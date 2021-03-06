import React, { useContext, useReducer, useCallback } from "react";
import axios from "axios";
import { getLoginDomain } from "utils/getEnvironmentVariables";
import { reportError } from "utils/errorReporting";

interface State {
  isAuthenticated: boolean;
  initialLoad: boolean;
}

const defaultState: State = {
  isAuthenticated: false,
  initialLoad: true,
};

type Action = { type: "authenticate" } | { type: "deauthenticate" };

export type Dispatch = (action: Action) => void;

export type Logout = () => void;

interface DispatchContext {
  login: (LoginParams) => void;
  logout: Logout;
  dispatch: Dispatch;
}

const reducer = (state: State, action: Action): State => {
  // check to see if the authenticate state has changed otherwise dont update the reducer
  if (
    state.isAuthenticated &&
    !state.initialLoad &&
    action.type === "authenticate"
  ) {
    return state;
  }
  switch (action.type) {
    case "authenticate":
      return {
        ...state,
        isAuthenticated: true,
        initialLoad: false,
      };
    case "deauthenticate":
      return {
        ...state,
        isAuthenticated: false,
        initialLoad: false,
      };
    default:
      return state;
  }
};

const logout = async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch({ type: "deauthenticate" });
    await axios.get(`${getLoginDomain()}/logout`);
  } catch (error) {
    reportError(error).warning();
  }
};

interface LoginParams {
  username: string;
  password: string;
}
const login = async (
  dispatch: Dispatch,
  { username, password }: LoginParams
): Promise<void> => {
  try {
    await axios.post(`${getLoginDomain()}/login`, {
      username,
      password,
    });
    dispatch({ type: "authenticate" });
  } catch (error) {
    // TODO: log errors if/when this is used in production
  }
};

const AuthDispatchContext = React.createContext<DispatchContext | null>(null);
const AuthStateContext = React.createContext<State | null>(null);

const AuthProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  const logoutHandler = useCallback(() => {
    logout(dispatch);
  }, [dispatch]);

  const loginHandler = useCallback(
    ({ username, password }: LoginParams) => {
      login(dispatch, { username, password });
    },
    [dispatch]
  );

  const dispatchContext: DispatchContext = {
    login: loginHandler,
    logout: logoutHandler,
    dispatch,
  };

  return (
    <AuthDispatchContext.Provider value={dispatchContext}>
      <AuthStateContext.Provider value={state}>
        {children}
      </AuthStateContext.Provider>
    </AuthDispatchContext.Provider>
  );
};

const useAuthStateContext = (): State => {
  const authState = useContext(AuthStateContext);
  if (authState === undefined) {
    throw new Error(
      "useAuthStateContext must be used within an auth context provider"
    );
  }
  return authState;
};

const useAuthDispatchContext = (): DispatchContext => {
  const authDispatch = useContext(AuthDispatchContext);
  if (authDispatch === undefined) {
    throw new Error(
      "useAuthStateContext must be used within an auth context provider"
    );
  }
  return authDispatch;
};

export { AuthProvider, useAuthStateContext, useAuthDispatchContext };
