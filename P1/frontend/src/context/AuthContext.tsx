import { createContext, useContext } from "react";

export const MOCK_USER = { id: 1, name: "홍길동", email: "user1@example.com" };

const AuthContext = createContext(MOCK_USER);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContext.Provider value={MOCK_USER}>{children}</AuthContext.Provider>;
}
