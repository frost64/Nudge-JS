import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "user";

export const AuthContext = createContext({
  token: null,
  user: null,
  setUser: () => {},
  login: () => {},
  logout: () => {},
});

/**
 * Safely reads the stored user from localStorage.
 *
 * @returns {object|null}
 */
function getStoredUser() {
  try {
    const storedUser = localStorage.getItem(
      USER_STORAGE_KEY
    );

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Failed to parse stored user.",
      error
    );

    localStorage.removeItem(USER_STORAGE_KEY);

    return null;
  }
}

/**
 * Provides authentication state and actions
 * throughout the application.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY)
  );

  const [user, setUserState] = useState(
    getStoredUser
  );

  const setUser = useCallback((nextUser) => {
    setUserState((currentUser) => {
      const resolvedUser =
        typeof nextUser === "function"
          ? nextUser(currentUser)
          : nextUser;

      if (resolvedUser) {
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(resolvedUser)
        );
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }

      return resolvedUser;
    });
  }, []);

  const login = useCallback(
    (jwt, userData) => {
      localStorage.setItem(
        TOKEN_STORAGE_KEY,
        jwt
      );

      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(userData)
      );

      setToken(jwt);
      setUserState(userData);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    setToken(null);
    setUserState(null);
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (
        event.key !== TOKEN_STORAGE_KEY &&
        event.key !== USER_STORAGE_KEY
      ) {
        return;
      }

      setToken(
        localStorage.getItem(TOKEN_STORAGE_KEY)
      );

      setUserState(getStoredUser());
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      token,
      user,
      setUser,
      login,
      logout,
    }),
    [
      token,
      user,
      setUser,
      login,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}