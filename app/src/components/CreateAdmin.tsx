// src/components/CreateAdmin.tsx
import React, { useState } from 'react';
import { api, AdminData } from '../api';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { useAppContext } from '../AppContext';

interface CreateAdminProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}
const CreateAdmin: React.FC<CreateAdminProps> = ({ showAlert }) => {
    const [formData, setFormData] = useState<AdminData>({
        name: '',
        username: '',
        role: '',
        passwordHash: '',
    });
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { loading, setLoading } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false); // Add isSubmitting


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordConfirmation(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true); // Disable button
        setLoading(true);
        try {
            if (!formData.name || !formData.username || !formData.role || !formData.passwordHash) {
                setError("Todos os campos são obrigatórios.");
                showAlert("Todos os campos são obrigatórios.", 'danger');
                return;
            }

            if (formData.passwordHash !== passwordConfirmation) {
                setError("As senhas não coincidem.");
                showAlert("As senhas não coincidem.", 'danger');
                return;
            }
            const newAdmin = await api.createAdmin(formData);
            if (newAdmin) {

                showAlert("Administrador criado com sucesso!", 'success');
                navigate('/admin');

            } else {
                setError('Falha ao criar administrador.');
                showAlert('Falha ao criar administrador. ', 'danger');
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
                                <h2 className="text-center mb-4">Criar Conta de Administrador</h2>
                                {error && <p className="text-danger text-center">{error}</p>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" controlId="formAdminName">
                                        <Form.Label>Nome</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            placeholder="Nome do Administrador"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formAdminUsername">
                                        <Form.Label>Nome de Usuário</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            placeholder="Nome de Usuário do Administrador"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formAdminRole">
                                        <Form.Label>Cargo</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="role"
                                            placeholder="Cargo do Administrador"
                                            value={formData.role}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formAdminPassword">
                                        <Form.Label>Senha</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                name="passwordHash"
                                                placeholder="Senha"
                                                value={formData.passwordHash}
                                                onChange={handleChange}
                                                required
                                            />
                                            <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? "Ocultar" : "Mostrar"}
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formAdminConfirmPassword">
                                        <Form.Label>Confirmar Senha</Form.Label>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="Confirmar Senha"
                                            value={passwordConfirmation}
                                            onChange={handlePasswordConfirmationChange}
                                            required
                                        />

                                    </Form.Group>

                                    <div className="d-grid gap-2">
                                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Criando...' : 'Criar Administrador'}
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

export default CreateAdmin;