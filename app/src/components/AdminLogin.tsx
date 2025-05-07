// src/components/AdminLogin.tsx
import React, { useState } from 'react';
import { api } from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { useAppContext } from '../AppContext';

interface AdminLoginProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ showAlert }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false); // Add isSubmitting

    const { loginAdmin, loading, setLoading } = useAppContext();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true); // Disable button
        setLoading(true);
        try {
            const admin = await api.loginAdmin(username, password);

            if (admin) {
                loginAdmin(admin);
                const from = location.state?.from?.pathname || '/admin';
                navigate(from);
            } else {
                setError('Login de administrador falhou. Verifique nome de usuário e senha.');
                showAlert('Login de administrador falhou. Verifique nome de usuário e senha.', 'danger')
            }
        } finally {
            setIsSubmitting(false); // Re-enable button
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            {loading ? (
                <div>Carregando...</div>
            ) : (
                <Row className="justify-content-center w-100">
                    <Col xs={12} sm={10} md={8} lg={6}>
                        <Card>
                            <Card.Body>
                                <h2 className="text-center mb-4">Admin Login</h2>
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

export default AdminLogin;