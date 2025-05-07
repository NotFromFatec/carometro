// src/components/Search.tsx
import React, { useState, useEffect } from 'react';
import { api, Egresso } from '../api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Form, Card, Row, Col } from 'react-bootstrap';
import Alert from './Alert';
import PublicHeader from './PublicHeader';
//import placeholderImage from '../assets/placeholder.png'; // Import - NO! Use direct path

interface SearchProps {
    isAdmin?: boolean;
}

const Search: React.FC<SearchProps> = ({ isAdmin = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCourse, setSearchCourse] = useState('');
    const [searchGraduationYear, setSearchGraduationYear] = useState('');
    const [searchResults, setSearchResults] = useState<Egresso[]>([]);
    const [initialResults, setInitialResults] = useState<Egresso[]>([]);  // Keep initial results
    const [loading, setLoading] = useState(true); // Local loading state
    const [alert, setAlert] = useState<{ message: string; variant: 'success' | 'danger' | string } | null>(null);

    const showAlert = (message: string, variant: 'success' | 'danger' | string = 'success') => {
        setAlert({ message, variant });
        setTimeout(() => setAlert(null), 5000);
    };

    const hideAlert = () => {
        setAlert(null);
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get('q');
        const course = searchParams.get('course');
        const year = searchParams.get('year');

        setSearchTerm(query || '');
        setSearchCourse(course || '');
        setSearchGraduationYear(year || '');

        const fetchEgressos = async () => {
            setLoading(true); // Local loading - only during initial fetch
            try {
                const egressos = await api.getEgressos();
                let filtered = egressos;
                //Admin filter
                if (!isAdmin) {
                    filtered = egressos.filter(e => e.verified);
                }
                setInitialResults(filtered); // Store *all* fetched results initially


                // Apply filters *after* fetching and storing initial results
                handleSearch(query || '', course || '', year || '', filtered); // Pass initialResults

            } catch (error) {
                console.error("Error fetching egressos:", error);
                showAlert("Erro ao buscar egressos.", "danger");
            } finally {
                setLoading(false); // Local loading
            }
        };

        fetchEgressos();
    }, [location.search, isAdmin]); //  isAdmin dependency is important

    // Separate search logic into a function
    const handleSearch = (term: string, course: string, year: string, initialResultsParam: Egresso[]) => {
        // Use initialResultsParam (passed from useEffect or handleInputChange)
        let filteredResults = [...initialResultsParam]; // *Copy* the array

        // if (
        //     initialResults.length > 0 &&
        //     term.trim().length == 0 &&
        //     course.trim().length == 0 &&
        //     year.trim().length == 0
        // ) {
        //     setSearchResults(initialResults);
        //     return;
        // }

        // Apply filters *only* if the corresponding term is not empty
        if (term) {
            const lowerTerm = term.toLowerCase(); // For case-insensitivity
            filteredResults = filteredResults.filter(egresso =>
                egresso.name.toLowerCase().includes(lowerTerm)
            );
        }
        if (course) {
            const lowerCourse = course.toLowerCase();
            filteredResults = filteredResults.filter(egresso =>
                egresso.course?.toLowerCase().includes(lowerCourse)
            );
        }
        if (year) {
            const lowerYear = year.toLowerCase();
            filteredResults = filteredResults.filter(egresso =>
                egresso.graduationYear?.toLowerCase().includes(lowerYear)
            );
        }

        setSearchResults(filteredResults); // Update searchResults
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        switch (name) {
            case 'searchTerm':
                setSearchTerm(value);
                break;
            case 'searchCourse':
                setSearchCourse(value);
                break;
            case 'searchGraduationYear':
                setSearchGraduationYear(value);
                break;
        }
        // Call handleSearch with *current* state values and initialResults
        handleSearch(searchTerm, searchCourse, searchGraduationYear, initialResults);

    };



    return (<>
        <PublicHeader />
        <Container className="p-4">
            <h2>{isAdmin ? "Buscar Egressos (Admin)" : "Buscar Egressos"}</h2>
            {alert && (
                <Alert
                    message={alert.message}
                    // @ts-ignore
                    variant={alert.variant}
                    onClose={hideAlert}
                />
            )}
            <Form.Control
                type="text"
                placeholder="Buscar por nome"
                className="mb-3"
                value={searchTerm}
                name="searchTerm"
                onChange={handleInputChange} // Use new handler
            />
            <Row>
                <Col>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por curso"
                        className="mb-3"
                        value={searchCourse}
                        name="searchCourse"
                        onChange={handleInputChange} // Use new handler
                    />
                </Col>
                <Col>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por ano de formatura"
                        className="mb-3"
                        value={searchGraduationYear}
                        name="searchGraduationYear"
                        onChange={handleInputChange} // Use new handler

                    />
                </Col>
            </Row>


            {loading ? (
                <div>Carregando...</div>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {searchResults.map(egresso => (
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
                    {/* Show "no results" *only* if a search has been performed */}
                    {searchResults.length === 0 && (searchTerm || searchCourse || searchGraduationYear) && (
                        <Col>
                            <p className="text-muted text-center">Nenhum resultado encontrado.</p>
                        </Col>
                    )}
                    {/* Show "no egressos" only if there are no initial results */}
                    {searchResults.length === 0 && !loading && initialResults.length === 0 && !(searchTerm || searchCourse || searchGraduationYear) && (
                        <Col>
                            <p className="text-muted text-center">Nenhum egresso encontrado.</p>
                        </Col>
                    )}
                </Row>
            )}

        </Container>
    </>);
};

export default Search;