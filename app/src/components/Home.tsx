// src/components/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Stack, Alert } from 'react-bootstrap';
import { useAppContext } from '../AppContext';
import { api } from '../api';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { egressoUser, logout } = useAppContext();
    const [loading, setLoading] = React.useState(false); // Local loading

    if (!egressoUser) {
        navigate('/login');
        return null;
    }
    const handleDeleteAccount = async () => {
        if (window.confirm("Tem certeza que deseja deletar sua conta? Esta ação é irreversível.")) {
            setLoading(true);
            if (egressoUser && egressoUser.id) {

                try {
                    const success = await api.deleteEgresso(egressoUser.id);
                    if (success) {
                        logout(); // Log out the user
                        navigate('/login'); // Redirect to login
                        alert('Sua conta foi deletada com sucesso.'); // Use a standard alert
                    } else {
                        alert('Falha ao deletar a conta. Tente novamente.');// Use a standard alert
                    }
                }
                finally {
                    setLoading(false);
                }
            }
        }
    };


    return (
        <Container className="p-4">
            <h2>Bem-vindo(a), {egressoUser.name}!</h2>
            <p className="mb-4">Esta é a sua página inicial. Você está logado como {egressoUser.username}.</p>

            {/* User Buttons */}
            <Stack direction="horizontal" gap={3} className="flex-wrap justify-content-center mb-4">
                <Button variant="primary" onClick={() => navigate('/search')}>
                    Buscar Egressos
                </Button>
                <Button variant="primary" onClick={() => navigate(`/profile/${egressoUser.id}`)}>
                    Ver Meu Perfil
                </Button>
                <Button variant="primary" onClick={() => navigate('/edit-profile')}>
                    Editar Meu Perfil
                </Button>
                <Button variant="danger" onClick={handleDeleteAccount} disabled={loading}>
                    {loading ? "Deletando..." : "Deletar Minha Conta"}
                </Button>
                <Button variant="secondary" onClick={() => { logout(); navigate('/login'); }}>
                    Sair
                </Button>
            </Stack>
        </Container>
    );
};

export default Home;