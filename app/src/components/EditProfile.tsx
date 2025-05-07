// src/components/EditProfile.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Egresso, EgressoData } from '../api';
import { Container, Form, Row, Col, Button, Image, } from 'react-bootstrap';
import { useAppContext } from '../AppContext';
import placeholderImage from '../assets/placeholder.png'; // Import

interface EditProfileProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ showAlert }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Partial<EgressoData>>({});
    const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);
    const [error, setError] = useState('');
    const { egressoUser, courses, setCourses } = useAppContext(); // Get courses from context - NOW CORRECTLY PLACED
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!egressoUser?.id) {
            navigate('/login');
            return;
        }
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const egresso = await api.getEgresso(egressoUser.id!);
                if (egresso) {
                    setFormData(egresso.toJson());
                    setProfileImageBase64(egresso.profileImage || null);
                } else {
                    setError('Falha ao carregar o perfil para edição.');
                    showAlert('Falha ao carregar o perfil para edição.', 'danger')
                }

                const courses = await api.getCourses();
                if (courses) {
                    setCourses(courses);
                } else {
                    setError('Falha ao carregar os cursos disponiveis.');
                    showAlert('Falha ao carregar os cursos disponiveis.', 'danger')
                }
            }
            finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate, egressoUser?.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContactLinkChange = (index: number, value: string) => {
        const currentLinks = formData.contactLinks || [];
        const newLinks = [...currentLinks];
        newLinks[index] = value;
        setFormData({ ...formData, contactLinks: newLinks });
    };

    const addContactLink = () => {
        const currentLinks = formData.contactLinks || [];
        setFormData({ ...formData, contactLinks: [...currentLinks, ''] });
    };

    const removeContactLink = (index: number) => {
        const currentLinks = formData.contactLinks || [];
        const newLinks = currentLinks.filter((_, i) => i !== index);
        setFormData({ ...formData, contactLinks: newLinks });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Image size check
            if (file.size > 1048487) {
                showAlert('A imagem é muito grande. O tamanho máximo permitido é 1MB.', 'danger');
                // Clear the input
                e.target.value = ''; // This is important to allow re-selecting the same file
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProfileImageBase64(base64String);
                setFormData({ ...formData, profileImage: base64String, faceImage: base64String });
            };
            reader.readAsDataURL(file);
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!egressoUser?.id) return;

        setIsSubmitting(true); // Disable button
        // No setLoading(true) here!
        try {
            const updatedEgresso = await api.updateEgresso(egressoUser.id, formData);
            if (updatedEgresso) {
                showAlert('Perfil atualizado com sucesso!');
                navigate(`/profile/${egressoUser.id}`);
            } else {
                setError('Falha ao atualizar o perfil.');
                showAlert('Falha ao atualizar o perfil.', 'danger');
            }

        } catch (err) {
            console.error("Error updating profile:", err);
            setError('Erro ao atualizar o perfil.');
            showAlert('Erro ao atualizar o perfil', 'danger');
        } finally {
            //setLoading(false); // Don't touch global loading
            setIsSubmitting(false); // Re-enable button
        }
    };


    return (
        <>
            {loading && <div className="loading-overlay">Carregando...</div>}
            {!loading && (
                <Container className="p-4">
                    <h2>Editar Perfil</h2>
                    {error && <p className="text-danger mb-2">{error}</p>}
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3" controlId="formBasicName">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        placeholder="Seu Nome"
                                        value={formData.name || ''}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                {/* Course Selection */}
                                <Form.Group className="mb-3" controlId="formBasicCourse">
                                    <Form.Label>Curso</Form.Label>
                                    <Form.Select
                                        name="course"
                                        value={formData.course || ''}
                                        onChange={handleChange}
                                    >
                                        <option value="">Selecione um curso</option>
                                        {courses.map((courseOption) => (
                                            <option key={courseOption} value={courseOption}>
                                                {courseOption}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3" controlId="formBasicGraduationYear">
                                    <Form.Label>Ano de Formatura</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="graduationYear"
                                        placeholder="Ano de Formatura"
                                        value={formData.graduationYear || ''}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3" controlId="formBasicProfileImage">
                                    <Form.Label>Imagem de Perfil</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {profileImageBase64 && (
                                        <Image src={profileImageBase64 || "/placeholder.png"} thumbnail className="mt-2" style={{ maxWidth: '150px' }} />
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Career Description */}
                        <Form.Group className="mb-3" controlId="formBasicCareerDescription">
                            <Form.Label>Descrição da Carreira</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="careerDescription"
                                placeholder="Descreva sua experiência profissional"
                                value={formData.careerDescription || ''}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicDescription">
                            <Form.Label>Descrição Pessoal</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="personalDescription"
                                placeholder="Descrição Pessoal"
                                value={formData.personalDescription || ''}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicContactLinks">
                            <Form.Label>Links de Contato</Form.Label>
                            {formData.contactLinks?.map((link, index) => (
                                <Row className="mb-2" key={index}>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            placeholder="Link de Contato"
                                            value={link}
                                            onChange={(e) => handleContactLinkChange(index, e.target.value)}
                                        />
                                    </Col>
                                    <Col xs="auto">
                                        <Button variant="danger" onClick={() => removeContactLink(index)}>
                                            Remover
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
                            <Button variant="secondary" onClick={addContactLink}>
                                Adicionar Link de Contato
                            </Button>
                        </Form.Group>
                        <div className="d-flex justify-content-between">
                            <Button variant="primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Salvar Perfil'}
                            </Button>
                            <Button variant="secondary" onClick={() => navigate(`/profile/${egressoUser?.id}`)}>
                                Cancelar
                            </Button>
                        </div>
                    </Form>
                </Container>
            )}
        </>
    );
};

export default EditProfile;