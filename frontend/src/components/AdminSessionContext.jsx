import { createContext, useContext } from 'react';

export const AdminSessionContext = createContext({ signOut: async () => {} });

export const useAdminSession = () => useContext(AdminSessionContext);
