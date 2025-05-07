// src/components/PublicHeader.tsx

import React, { useState } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

const PublicHeader: React.FC = () => {
    const [ isLoggedIn, isAdminLoggedIn] = useState(true); // Local loading state
    const navigate = useNavigate();

    if (
        !isLoggedIn &&
        !isAdminLoggedIn
    ) {
        return (<></>);
    }

    return (<>
        <Navbar expand="lg" className="bg-body-tertiary" fixed="top">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    Carometro ☠️
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav-unlogged" />
                <Navbar.Collapse id="basic-navbar-nav-unlogged">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Início</Nav.Link>
                        <Nav.Link as={Link} to="/search">Buscar</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link as={Link} to="/login">Entrar</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        <div style={{ marginBottom: 50 }}></div>
    </>);
};

export default PublicHeader;