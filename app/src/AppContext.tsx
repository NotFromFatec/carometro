// src/AppContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Egresso, Admin, EgressoData } from './api';

interface AppContextProps {
    isLoggedIn: boolean;
    isAdminLoggedIn: boolean;
    egressoUser: Egresso | null;
    adminUser: Admin | null;
    loginEgresso: (user: Egresso, firstLogin?: boolean) => void; // Add firstLogin parameter
    loginAdmin: (admin: Admin) => void;
    logout: () => void;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    courses: string[];
    setCourses: React.Dispatch<React.SetStateAction<string[]>>;
    firstLogin: boolean; // Add firstLogin state
    setFirstLogin: React.Dispatch<React.SetStateAction<boolean>>; // Add setFirstLogin
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [egressoUser, setEgressoUser] = useState<Egresso | null>(null);
    const [adminUser, setAdminUser] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<string[]>([]);
    const [firstLogin, setFirstLogin] = useState(false); // Initialize firstLogin

    useEffect(() => {
        const storedEgressoUser = localStorage.getItem('egressoUser');
        const storedAdminUser = localStorage.getItem('adminUser');
        const storedFirstLogin = localStorage.getItem('firstLogin'); // Get from localStorage

        if (storedEgressoUser && storedAdminUser) {
            localStorage.removeItem('adminUser');
            setEgressoUser(new Egresso(JSON.parse(storedEgressoUser)));
            setIsLoggedIn(true);
            if (storedFirstLogin) {
                setFirstLogin(JSON.parse(storedFirstLogin)); // Set from localStorage
            }
        } else if (storedEgressoUser) {
            setEgressoUser(new Egresso(JSON.parse(storedEgressoUser)));
            setIsLoggedIn(true);
            if (storedFirstLogin) {
                setFirstLogin(JSON.parse(storedFirstLogin)); // Set from localStorage
            }
        } else if (storedAdminUser) {
            setAdminUser(new Admin(JSON.parse(storedAdminUser)));
            setIsAdminLoggedIn(true);
        }
    }, []);

    const loginEgresso = useCallback((user: Egresso, firstLogin: boolean = false) => {
        if (adminUser) {
            setAdminUser(null);
            setIsAdminLoggedIn(false);
            localStorage.removeItem('adminUser');
        }
        setEgressoUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('egressoUser', JSON.stringify(user.toJson()));
        setFirstLogin(firstLogin); // Set firstLogin
        localStorage.setItem('firstLogin', JSON.stringify(firstLogin)); // Store in localStorage
    }, [adminUser]);

    const loginAdmin = useCallback((admin: Admin) => {
        if (egressoUser) {
            setEgressoUser(null);
            setIsLoggedIn(false);
            localStorage.removeItem('egressoUser');
        }
        setAdminUser(admin);
        setIsAdminLoggedIn(true);
        localStorage.setItem('adminUser', JSON.stringify(admin.toJson()));
    }, [egressoUser]);

    const logout = useCallback(() => {
        setEgressoUser(null);
        setAdminUser(null);
        setIsLoggedIn(false);
        setIsAdminLoggedIn(false);
        setFirstLogin(false); // Reset firstLogin
        localStorage.removeItem('egressoUser');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('firstLogin'); // Clear from localStorage
    }, []);

    const contextValue: AppContextProps = {
        isLoggedIn,
        isAdminLoggedIn,
        egressoUser,
        adminUser,
        loginEgresso,
        loginAdmin,
        logout,
        loading,
        setLoading,
        courses,
        setCourses,
        firstLogin, // Provide firstLogin
        setFirstLogin, // Provide setFirstLogin
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};