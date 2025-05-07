// src/components/AdminPanel.tsx

import React, { useState, useEffect } from 'react';
import { api, Egresso } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Table, Button, Modal, Row, Col, Alert, InputGroup } from 'react-bootstrap'; // Import InputGroup
import { useAppContext } from '../AppContext';

interface AdminPanelProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ showAlert }) => {
    // ... (rest of your component - states, useEffect, etc.) ...
    const [egressos, setEgressos] = useState<Egresso[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEgressos, setFilteredEgressos] = useState<Egresso[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [inviteCode, setInviteCode] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    //const [loading, setLoading] = useState(true); // Loading is in context
    const navigate = useNavigate();
    // const { adminUser, loading, setLoading } = useAppContext(); // Now using context for loading
    const { adminUser, loading, setLoading, setCourses, courses } = useAppContext();
    // Course Management States
    // const [courses, setCourses] = useState<string[]>([]);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [courseAction, setCourseAction] = useState<'add' | 'edit'>('add');
    const [currentCourse, setCurrentCourse] = useState('');
    const [courseInput, setCourseInput] = useState('');

    useEffect(() => {
        if (!adminUser?.id) {
            navigate('/admin-login');
            return;
        }

        const fetchEgressosAndCourses = async () => {
            //No loading state here
            try {
                const allEgressos = await api.getEgressos();
                setEgressos(allEgressos);
                setFilteredEgressos(allEgressos);

                // Fetch courses using api.getCourses()
                const fetchedCourses = await api.getCourses();  // Use the API function
                setCourses(fetchedCourses); // Update context

            } catch (err) {
                console.error("Error fetching data:", err);
                showAlert('Failed to load data.', 'danger');
            }
        };

        fetchEgressosAndCourses();
        fetchInvites();
    }, [adminUser?.id]); // Add setCourses to deps


    // --- Course Management Functions (Now using api.saveCourses) ---

    const fetchCourses = async (): Promise<string[]> => { //No needed anymore as we have api.getCourses
        return await api.getCourses(); //uses api
    };

    const saveCourses = async (updatedCourses: string[]): Promise<void> => { //No needed anymore as we have api.save
        await api.saveCourses(updatedCourses); // Use the API function
        // setCourses is in context
    };

    const handleAddCourse = async () => {
        if (courseInput.trim() && !courses.includes(courseInput.trim())) {
            const updatedCourses = [...courses, courseInput.trim()];
            await api.saveCourses(updatedCourses); // Use the API
            setCourses(updatedCourses); // Update context
            setCourseInput('');
            setShowCourseModal(false);
        } else {
            alert('O curso já existe ou é inválido.');
        }
    };

    const handleEditCourse = async () => {
        if (courseInput.trim()) {
            const updatedCourses = courses.map(course =>
                course === currentCourse ? courseInput.trim() : course
            );
            await api.saveCourses(updatedCourses);  // Use the API
            setCourses(updatedCourses); // Update context
            setCourseInput('');
            setCurrentCourse('');
            setShowCourseModal(false);
        }
    };

    const handleDeleteCourse = async (courseToDelete: string) => {
        if (window.confirm(`Tem certeza que deseja deletar o curso "${courseToDelete}"?`)) {
            const updatedCourses = courses.filter(course => course !== courseToDelete);
            await api.saveCourses(updatedCourses); // Use the API
            setCourses(updatedCourses); // Update context

        }
    };
    // --- End Course Management ---

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const results = egressos.filter(egresso =>
            egresso.name.toLowerCase().includes(term) ||
            egresso.username.toLowerCase().includes(term) ||
            egresso.course?.toLowerCase().includes(term)
        );
        setFilteredEgressos(results);
    };

    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja deletar este usuário?")) {
            setIsDeleting(id);
            try {
                const success = await api.deleteEgresso(id);
                if (success) {
                    setEgressos(prevEgressos => prevEgressos.filter(egresso => egresso.id !== id));
                    setFilteredEgressos(prevFiltered => prevFiltered.filter(egresso => egresso.id !== id));
                    showAlert('Usuário deletado com sucesso.');
                } else {
                    showAlert('Falha ao deletar usuário.', 'danger');
                }
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const [isVerifying, setIsVerifying] = useState<string | null>(null);
    const handleVerify = async (id: string, currentVerifiedStatus: boolean) => {
        setIsVerifying(id);
        try {
            const success = await api.updateEgresso(id, { verified: !currentVerifiedStatus });
            if (success) {
                // @ts-ignore
                setEgressos(prevEgressos =>
                    prevEgressos.map(egresso =>
                        egresso.id === id ? { ...egresso, verified: !currentVerifiedStatus } : egresso
                    )
                );
                // @ts-ignore
                setFilteredEgressos(prevFiltered =>
                    prevFiltered.map(egresso =>
                        egresso.id === id ? { ...egresso, verified: !currentVerifiedStatus } : egresso
                    )
                );
                showAlert(`Usuário ${currentVerifiedStatus ? 'não verificado' : 'verificado'} com sucesso.`);
            } else {
                showAlert('Falha ao atualizar o status de verificação.', 'danger');
            }
        } finally {
            setIsVerifying(null);
        }
    };



    const [isCreatingInvite, setIsCreatingInvite] = useState(false);
    const handleCreateInvite = async () => {
        if (adminUser && adminUser.id) {
            setIsCreatingInvite(true);
            try {
                const code = await api.createInvite(adminUser.id);
                if (code) {
                    setInviteCode(code);
                    const inviteLink = `${window.location.origin}/create-account?invite=${code}`;
                    setInviteMessage(`Código de convite gerado: ${code} \n Link: ${inviteLink}`);
                } else {
                    setInviteMessage("Erro ao gerar o código de convite.");
                    showAlert("Erro ao gerar o código de convite.", 'danger');
                }
            } finally {
                setIsCreatingInvite(false);
            }
        } 
    };


    const fetchInvites = async () => {
        try {
            const fetchedInvites = await api.getInvites();
            // Fetch admin names for each invite
            const invitesWithAdminNames = await Promise.all(
                fetchedInvites.map(async (invite: any) => {
                    const admin = await api.getAdmin(invite.createdBy);
                    return { ...invite, createdByName: admin ? admin.name : 'Unknown' }; // Add createdByName
                })
            );
            setInvites(invitesWithAdminNames);

        } catch (error) {
            console.error("Error fetching invites:", error);
            showAlert("Erro ao buscar convites.", 'danger')
        }

    };

    const [isCancellingInvite, setIsCancellingInvite] = useState<string | null>(null);
    const handleCancelInvite = async (code: string) => {
        if (window.confirm("Tem certeza que deseja cancelar este convite?")) {
            setIsCancellingInvite(code);
            try {
                const success = await api.cancelInvite(code);
                if (success) {
                    await fetchInvites();
                    showAlert("Convite cancelado com sucesso.", "success");
                } else {
                    showAlert("Falha ao cancelar convite.", "danger");
                }
            } catch (error) {
                console.error("Error canceling invite:", error);
                showAlert("Erro ao cancelar convite.", "danger");
            } finally {
                setIsCancellingInvite(null);
            }
        }
    };

    const handleCopyInviteLink = () => {
        const inviteLink = `${window.location.origin}/create-account?invite=${inviteCode}`;
        navigator.clipboard.writeText(inviteLink)
            .then(() => {
                showAlert("Link de convite copiado para a área de transferência!", "success");
            })
            .catch(err => {
                console.error("Failed to copy invite link:", err);
                showAlert("Erro ao copiar o link. Copie manualmente.", "warning");
            });
    };

    const handleCopyInviteCode = (code: string) => {
        const inviteLink = `${window.location.origin}/create-account?invite=${code}`;
        navigator.clipboard.writeText(inviteLink)
            .then(() => {
                showAlert("Link de convite copiado para a área de transferência!", "success");
            })
            .catch(err => {
                console.error("Failed to copy invite link:", err);
                showAlert("Erro ao copiar o link. Copie manualmente.", "warning");
            });
    };

    return (
        <>

            <Container className="p-4">
                <h2>Painel de Administração - Gerenciar Egressos</h2>

                {/* Invite Code Generation - Improved Display */}
                <div className="mb-3">
                    <Button variant="info" onClick={handleCreateInvite} disabled={isCreatingInvite}>
                        {isCreatingInvite ? 'Gerando...' : 'Gerar Código de Convite'}
                    </Button>
                    {inviteMessage && (
                        <Alert variant="info" className="mt-2">
                            <p>Código de convite gerado:</p>
                            <pre><code>{inviteCode}</code></pre>
                            <p>Link de convite:</p>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={`${window.location.origin}/create-account?invite=${inviteCode}`}
                                    readOnly
                                    style={{ marginRight: "10px" }}
                                />
                                <button className="btn btn-outline-secondary" type="button" onClick={handleCopyInviteLink}>
                                    Copiar Link
                                </button>
                            </div>
                        </Alert>
                    )}
                </div>

                {/* Course Management */}
                <div className="mb-3">
                    <h4>Gerenciar Cursos</h4>
                    <Button variant="primary" size="sm" onClick={() => { setShowCourseModal(true); setCourseAction('add'); setCourseInput(''); }}>
                        Adicionar Curso
                    </Button>
                    <Table striped bordered hover responsive size="sm" className="mt-2">
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course}>
                                    <td>{course}</td>
                                    <td>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="me-1"
                                            onClick={() => {
                                                setShowCourseModal(true);
                                                setCourseAction('edit');
                                                setCurrentCourse(course);
                                                setCourseInput(course);
                                            }}
                                        >
                                            Editar
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteCourse(course)}>
                                            Deletar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>


                <div>
                    <h4>Convites Válidos</h4>
					<Table striped bordered hover responsive>
						<thead>
							<tr>
								<th>Código</th>
								<th>Criado Por</th>
								<th>Usado</th>
								<th>Criado Em</th>
								<th>Ações</th>
							</tr>
						</thead>
						<tbody>
							{invites.map((invite: any) => (
								<tr key={invite.code}>
									<td>
										<InputGroup>
											<Form.Control
												value={invite.code}
												readOnly
												aria-label="Invite code"
											/>
											<Button
												variant="outline-secondary"
												onClick={() => handleCopyInviteCode(invite.code)}
												id={`copy-button-${invite.code}`}
											>
												Copiar
											</Button>
										</InputGroup>
									</td>
									<td>{invite.createdByName}</td>
									<td>{invite.used ? 'Sim' : 'Não'}</td>
									<td>{new Date(invite.createdAt).toLocaleString()}</td>
									<td>
										<Button
											variant="danger"
											size="sm"
											onClick={() => handleCancelInvite(invite.code)}
											disabled={invite.used || isCancellingInvite === invite.code}
										>
											{isCancellingInvite === invite.code ? 'Cancelando...' : 'Cancelar'}
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</Table>
                </div>

                <Form.Control
                    type="text"
                    placeholder="Buscar por nome, nome de usuário ou curso"
                    className="mb-3"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Nome de Usuário</th>
                            <th>Curso</th>
                            <th>Verificado</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEgressos.map(egresso => (
                            <tr key={egresso.id}>
                                <td><Link to={`/profile/${egresso.id}`}>{egresso.name}</Link></td>
                                <td>{egresso.username}</td>
                                <td>{egresso.course || 'N/A'}</td>
                                <td>{egresso.verified ? 'Sim' : 'Não'}</td>
                                <td>
                                    <Button
                                        variant={egresso.verified ? 'warning' : 'success'}
                                        className="me-2"
                                        onClick={() => handleVerify(egresso.id!, egresso.verified)}
                                        size="sm"
                                        disabled={isVerifying === egresso.id}
                                    >
                                        {isVerifying === egresso.id ? (egresso.verified ? "Removendo..." : "Verificando...") : (egresso.verified ? 'Remover Verificação' : 'Verificar')}
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDelete(egresso.id!)}
                                        size="sm"
                                        disabled={isDeleting === egresso.id}
                                    >
                                        {isDeleting === egresso.id ? 'Deletando...' : 'Deletar'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {filteredEgressos.length === 0 && searchTerm && (
                            <tr><td colSpan={5} className="text-center text-muted py-3">Nenhum egresso encontrado com a sua busca.</td></tr>
                        )}
                        {egressos.length === 0 && !searchTerm && (
                            <tr><td colSpan={5} className="text-center text-muted py-3">Nenhum dado de egresso disponível.</td></tr>
                        )}
                    </tbody>
                </Table>
            </Container>


            {/* Course Management Modal */}
            <Modal show={showCourseModal} onHide={() => setShowCourseModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{courseAction === 'add' ? 'Adicionar Curso' : 'Editar Curso'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        type="text"
                        placeholder={courseAction === 'add' ? "Novo curso" : "Editar curso"}
                        value={courseInput}
                        onChange={(e) => setCourseInput(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCourseModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={courseAction === 'add' ? handleAddCourse : handleEditCourse}>
                        {courseAction === 'add' ? 'Adicionar' : 'Salvar'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AdminPanel;