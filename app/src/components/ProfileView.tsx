// src/components/ProfileView.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Egresso } from '../api';
import { Container, Row, Col, Image, ListGroup, Badge, Button } from 'react-bootstrap'; // Import Button
import { useAppContext } from '../AppContext';
import PublicHeader from './PublicHeader';

const ProfileView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [egresso, setEgresso] = useState<Egresso | null>(null);
    const [error, setError] = useState('');
    const { egressoUser, adminUser } = useAppContext(); // Remove loading, setLoading
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(false);
    const [loading, setLoading] = useState(true);  // Local loading state


    useEffect(() => {
        const fetchEgresso = async () => {
            setLoading(true); // Local loading
            try {
                if (id) {
                    const fetchedEgresso = await api.getEgresso(id);
                    if (fetchedEgresso) {
                        if (fetchedEgresso.verified ||
                            (egressoUser && fetchedEgresso.id === egressoUser.id) ||
                            adminUser) {
                            setEgresso(fetchedEgresso);
                        } else {
                            setError('Você não tem permissão para ver este perfil.');
                            navigate('/search');
                        }
                    } else {
                        setError('Perfil não encontrado.');
                        navigate('/search');
                    }
                } else {
                    setError('ID de perfil inválido.');
                    navigate('/search');
                }
            } catch (error) {
                setError('Erro ao carregar o perfil.');

            } finally {
                setLoading(false); // Local loading
            }
        };

        fetchEgresso();
    }, [id, egressoUser, adminUser, navigate]); // Remove setLoading

    const handleVerifyUnverify = async () => {
        if (adminUser && egresso) {
            setIsVerifying(true);
            try {
                const success = await api.updateEgresso(egresso.id!, { verified: !egresso.verified });
                if (success) {
                    // @ts-ignore
                    setEgresso(prevEgresso => prevEgresso ? ({ ...prevEgresso, verified: !prevEgresso.verified }) : null);
                } else {
                    alert('Falha ao verificar/remover verificação.');
                }
            } finally {
                setIsVerifying(false);
            }
        }
    };


    if (loading) {
        return <div>Carregando perfil...</div>;
    }

    if (error) {
        return <div className="text-danger">{error}</div>;
    }

    if (!egresso) {
        return <div>Erro ao carregar o perfil.</div>;
    }


    return (<>
        <PublicHeader />
        <Container className="p-4">
            <Row className="mb-4 align-items-center">
                <Col xs={12} md={4} className="text-center">
                    <Image
                        src={egresso.profileImage || "/placeholder.png"} // Use imported image
                        roundedCircle
                        fluid
                        style={{ width: 'auto', height: 'auto', objectFit: 'cover' }}
                    />
                </Col>
                <Col xs={12} md={8}>
                    <h2>{egresso.name}</h2>
                    <p className="text-muted">
                        {egresso.course || "Curso não especificado"} -{" "}
                        {egresso.graduationYear || "Ano de formatura não especificado"}
                    </p>
                    <Badge pill bg={egresso.verified ? 'success' : 'danger'}>
                        Verificado: {egresso.verified ? 'Sim' : 'Não'}
                    </Badge>
                    {/* Admin Verify/Unverify Button */}
                    {adminUser && (
                        <Button
                            variant={egresso.verified ? 'warning' : 'success'}
                            className="ms-2"
                            onClick={handleVerifyUnverify}
                            disabled={isVerifying}
                        >
                            {isVerifying ? (egresso.verified ? "Removendo..." : "Verificando...") : (egresso.verified ? 'Remover Verificação' : 'Verificar')}
                        </Button>
                    )}
                </Col>
            </Row>
            <div className="mb-4">
                <h4>Descrição Pessoal</h4>
                <p>{egresso.personalDescription || 'Nenhuma descrição pessoal fornecida.'}</p>
            </div>

            <div className="mb-4">
                <h4>Descrição da Carreira</h4>
                <p>{egresso.careerDescription || 'Nenhuma descrição de carreira fornecida.'}</p>
            </div>

            {egresso.contactLinks && egresso.contactLinks.length > 0 && (
                <div className="mb-4">
                    <h4>Links de Contato</h4>
                    <ListGroup>
                        {egresso.contactLinks.map((link, index) => (
                            <ListGroup.Item key={index} action href={link} target="_blank" rel="noopener noreferrer">
                                {link}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>
            )}
            {!egresso.contactLinks || egresso.contactLinks.length === 0 && (
                <div className="mb-4">
                    <h4>Links de Contato</h4>
                    <p>Nenhum link de contato fornecido.</p>
                </div>
            )}

        </Container>
    </>);
};

export default ProfileView;