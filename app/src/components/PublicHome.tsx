// src/components/PublicHome.tsx

import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { api, Egresso } from '../api';
import PublicHeader from './PublicHeader';
//import { useAppContext } from '../AppContext'; // Removed context

const PublicHome: React.FC = () => {
    const [recentEgressos, setRecentEgressos] = useState<Egresso[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    //const {loading, setLoading} = useAppContext(); // Removed context loading
    const [loading, setLoading] = useState(true); // Local loading state
    const navigate = useNavigate();


    useEffect(() => {
        const fetchRecentEgressos = async () => {
            setLoading(true); // Use local loading
            try {
                const allEgressos = await api.getEgressos();
                const verifiedEgressos = allEgressos.filter(e => e.verified);
                verifiedEgressos.sort((a, b) => (b.id! > a.id!) ? 1 : -1);
                setRecentEgressos(verifiedEgressos.slice(0, 6));
            } catch (error) {
                console.error("Error fetching recent egressos:", error);
            } finally {
                setLoading(false); // Use local loading
            }
        };

        fetchRecentEgressos();
    }, []); // Remove setLoading from dependencies

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = searchTerm.trim(); // Trim whitespace
        if (trimmedQuery) { // Only navigate if there's a non-empty query
            navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`); // Use navigate
        }
    };


    return (<>
        <PublicHeader />
        <Container className="p-4">
            <h1 className="text-center mb-4">Bem-vindo ao Carometro ☠️</h1>

            {/* Search Bar */}
            <Form onSubmit={handleSearchSubmit} className="mb-4">
                <Row className="justify-content-center">
                    <Col xs={12} md={8} lg={6}>
                        <Form.Control
                            type="text"
                            placeholder="Buscar egressos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="lg"
                        />
                    </Col>
                    <Col xs="auto">
                        <Button variant="primary" type="submit" size="lg">
                            Buscar
                        </Button>
                    </Col>
                </Row>
            </Form>

            {loading && <div className="loading-overlay">Carregando...</div>}
            {!loading && (
                <>
                    {/* Recent Egressos */}
                    <h2>Egressos Verificados Recentemente</h2>
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {recentEgressos.map(egresso => (
                            <Col key={egresso.id}>
                                <Card as={Link} to={`/profile/${egresso.id}`} className="text-decoration-none">
                                    <Card.Img variant="top" src={egresso.profileImage || "/placeholder.png"} style={{ 
                                        maxHeight: "300px",
                                        objectFit: "cover"
                                    }} />
                                    <Card.Body>
                                        <Card.Title>{egresso.name}</Card.Title>
                                        <Card.Text className="text-muted">
                                            {egresso.course || 'Curso não especificado'} - {egresso.graduationYear || "Ano de formatura não especificado"}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                        {recentEgressos.length === 0 && (
                            <Col>
                                <p className="text-muted text-center">Nenhum egresso verificado recentemente.</p>
                            </Col>
                        )}
                    </Row>
                </>
            )}
        </Container>
    </>);
};

export default PublicHome;