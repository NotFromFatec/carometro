// src/components/Login.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { useAppContext } from '../AppContext';

interface LoginProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

const Login: React.FC<LoginProps> = ({ showAlert }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const { loginEgresso, loading, setLoading, firstLogin } = useAppContext(); // Get firstLogin
    const [isSubmitting, setIsSubmitting] = useState(false);



    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        setLoading(true);
        try {
            const user = await api.loginUser(username, password);
            if (user) {
                // Check for 'firstLogin' query parameter
                const searchParams = new URLSearchParams(location.search);
                const isFirstLogin = searchParams.get('firstLogin') === 'true';
                loginEgresso(user, isFirstLogin); // Pass firstLogin to loginEgresso

                if (isFirstLogin) {
                    navigate('/edit-profile', { replace: true });
                } else {
                    const from = location.state?.from?.pathname || '/home';
                    navigate(from, { replace: true });
                }


            } else {
                setError('Falha no login. Nome de usuário ou senha inválidos.');
                showAlert('Falha no login. Nome de usuário ou senha inválidos.', 'danger');
            }
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    // No useEffect needed here anymore

    return (
        // ... (rest of your Login component's JSX) ...
        <Container className="d-flex justify-content-center align-items-center vh-100">
            {loading ? (
                <div>Carregando...</div>
            ) : (
                <Row className="justify-content-center w-100">
                    <Col xs={12} sm={10} md={8} lg={6}>
                        <Card>
                            <Card.Body>
                                <h2 className="text-center mb-4">Entrar</h2>
                                {error && <p className="text-danger text-center">{error}</p>}
                                <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-3" controlId="formBasicUsername">
                                        <Form.Label>Nome de Usuário</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Digite seu nome de usuário"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label>Senha</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Senha"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? "Ocultar" : "Mostrar"}
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    <div className="d-grid gap-2">
                                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Entrando...' : 'Entrar'}
                                        </Button>
                                        {/* @ts-ignore */}
                                        <Button variant="link" as={Link} to="/create-account" className="text-center">
                                            Criar Conta
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Login;