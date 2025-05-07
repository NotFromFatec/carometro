// src/components/NavbarComponent.tsx

import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Button, Container, Form } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../AppContext';

interface NavbarComponentProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

const NavbarComponent: React.FC<NavbarComponentProps> = ({ showAlert }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const { isLoggedIn, isAdminLoggedIn, logout } = useAppContext();



    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const q = searchParams.get('q');
        if (q) {
            setSearchQuery(q);
        }
    }, [location.search]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery) {
            const searchPath = isAdminLoggedIn ? `/admin-search?q=${encodeURIComponent(trimmedQuery)}` : `/search?q=${encodeURIComponent(trimmedQuery)}`;
            navigate(searchPath);
        } else {
            if (isAdminLoggedIn) {
                navigate('/admin');
            }
            else {
                navigate('/search'); // Always navigate to /search for public search
            }

        }
        setSearchQuery('');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleHomeClick = () => {
        if (isAdminLoggedIn) {
            navigate('/admin');
        } else if (isLoggedIn) {
            navigate('/home');
        } else {
            navigate('/'); // Redirect to public home if not logged in
        }
    };


    return (
        <Navbar expand="lg" className="bg-body-tertiary" fixed="top">
            <Container>
                {/* Change:  Brand always links to / (public home or redirect) */}
                <Navbar.Brand as={Link} to="/" onClick={handleHomeClick}>
                    Carometro ☠️
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {/* Change:  Home link uses handleHomeClick */}
                        <Nav.Link as={Link} to="/" onClick={handleHomeClick}>
                            Início
                        </Nav.Link>
                        {/* Change:  Search link always goes to /search */}
                        <Nav.Link as={Link} to={isAdminLoggedIn ? '/admin-search' : '/search'}>Buscar</Nav.Link>
                    </Nav>
                    <Form onSubmit={handleSearchSubmit} className="d-flex">
                        <Form.Control
                            type="search"
                            placeholder="Buscar..."
                            className="me-2"
                            aria-label="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button variant="outline-success" type="submit">Buscar</Button>
                    </Form>
                    <Nav>
                        {/* Conditionally show login/logout */}
                        {isLoggedIn || isAdminLoggedIn ? (
                            <Button variant="outline-secondary" onClick={handleLogout}>
                                Sair
                            </Button>
                        ) : (
                            <Nav.Link as={Link} to="/login">Entrar</Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;