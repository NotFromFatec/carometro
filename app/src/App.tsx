// src/App.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import Home from './components/Home';
import PublicHome from './components/PublicHome';
import Search from './components/Search';
import ProfileView from './components/ProfileView';
import EditProfile from './components/EditProfile';
import AdminPanel from './components/AdminPanel';
import NavbarComponent from './components/NavbarComponent';
import Alert from './components/Alert';
import AdminLogin from './components/AdminLogin';
import CreateAdmin from './components/CreateAdmin';
import { useAppContext } from './AppContext';


const App: React.FC = () => {
    const [alert, setAlert] = useState<{ message: string; variant: 'success' | 'danger' | string } | null>(null);
    const { isLoggedIn, isAdminLoggedIn, loading, setLoading, firstLogin  } = useAppContext(); // Get loading and setLoading

    const showAlert = (message: string, variant: 'success' | 'danger' | string = 'success') => {
        setAlert({ message, variant });
        setTimeout(() => setAlert(null), 5000);
    };

    const hideAlert = () => {
        setAlert(null);
    };

    // Initial loading check.  We *must* have a separate loading state
    // *specifically* for the initial authentication check.
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        // Simulate the authentication check (this is already done in AppContext,
        // but we need to *wait* for it here).
        const checkAuth = async () => {
            setLoading(true); //set loading on context
            try {
                const storedEgressoUser = localStorage.getItem('egressoUser');
                const storedAdminUser = localStorage.getItem('adminUser');
                //Simplified check (already done by AppContext)
                if (storedEgressoUser || storedAdminUser) {
                    //AppContext handles the login logic
                }
            }
            finally {
                setInitialLoading(false);
                setLoading(false); // Set loading to false after fetching
            }
        };
        checkAuth();
    }, [setLoading]);


    if (initialLoading) {
        return <div>Loading...</div>; // Show loading *only* during initial check
    }


    return (
        <Router>
			{/* Navbar for logged-in users */}
            {(isLoggedIn || isAdminLoggedIn) && <NavbarComponent showAlert={showAlert} />}

            <div className={(isLoggedIn || isAdminLoggedIn) ? "mt-5 pt-3" : ""}>
                {alert && (
                    <Alert
                        message={alert.message}
                        // @ts-ignore
                        variant={alert.variant}
                        onClose={hideAlert}
                    />
                )}
                <Routes>
					{/* Public Routes (now with conditional Navbar) */}
					<Route path="/" element={isLoggedIn || isAdminLoggedIn ? <Navigate to="/home" /> : <PublicHome />} />
					<Route path="/search" element={isLoggedIn || isAdminLoggedIn ? <Search /> : <Search />} />
					<Route path="/profile/:id" element={isLoggedIn || isAdminLoggedIn ? <ProfileView /> : <ProfileView />} />

					{/* Conditionally redirect based on firstLogin */}
					<Route
						path="/login"
						element={
							isLoggedIn ? (
								firstLogin ? (
									<Navigate to="/edit-profile" />
								) : (
									<Navigate to="/home" />
								)
							) : isAdminLoggedIn ? (
								<Navigate to="/admin" />
							) : (
								<Login showAlert={showAlert} />
							)
						}
					/>
					<Route path="/create-account" element={isLoggedIn ? <Navigate to="/home" /> : <CreateAccount showAlert={showAlert} />} />
					{/* Protected Egresso Routes */}
                    <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
                    <Route path="/edit-profile" element={isLoggedIn ? <EditProfile showAlert={showAlert} /> : <Navigate to="/login" />} />

					{/* Admin Routes */}
                    <Route path="/admin-login" element={isAdminLoggedIn ? <Navigate to="/admin" /> : <AdminLogin showAlert={showAlert} />} />
                    <Route path="/admin" element={isAdminLoggedIn ? <AdminPanel showAlert={showAlert} /> : <Navigate to="/admin-login" />} />
                    <Route path="/admin-search" element={isAdminLoggedIn ? <Search isAdmin={true} /> : <Navigate to="/admin-login" />} />
                    <Route path="/create-admin" element={!isAdminLoggedIn ? <CreateAdmin showAlert={showAlert} /> : <Navigate to="/admin" />} />

					<Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;