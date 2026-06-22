import { createContext, useState } from "react";

export const AuthContext =
createContext();

export const AuthProvider = ({
children
}) => {

const [token, setToken] =
useState(
localStorage.getItem("token") || null
);

const [user, setUser] =
  useState(() => {

    try {

      const storedUser =
        localStorage.getItem(
          "user"
        );

      return storedUser
        ? JSON.parse(
            storedUser
          )
        : null;

    } catch {

      return null;

    }

  });

const login = (
jwt,
userData
) => {

   
localStorage.setItem(
  "token",
  jwt
);

localStorage.setItem(
  "user",
  JSON.stringify(userData)
);

setToken(jwt);
setUser(userData);
   

};

const logout = () => {

   
localStorage.removeItem(
  "token"
);

localStorage.removeItem(
  "user"
);

setToken(null);
setUser(null);
   

};

return (
<AuthContext.Provider
value={{
token,
user,
setUser,
login,
logout
}}
>
{children}
</AuthContext.Provider>
);
};
