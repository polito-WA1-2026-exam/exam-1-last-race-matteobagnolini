import { useState, useEffect, useContext } from 'react';
import { Container, Table, Alert, Spinner, Card } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';

import UserContext from '../contexts/UserContext';
import { getScores } from '../api/api.js';

function Ranking() {
    const user = useContext(UserContext);
    
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user.id) {
            getScores()
                .then(data => {
                    const sortedData = data.sort((a, b) => b.bestScore - a.bestScore);
                    setRankings(sortedData);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [user]);

    if (!user.id) {
        return <Navigate to="/login" />;
    }

    return (
        <Container className="py-5 max-w-md">
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    <h2 className="mb-4 text-center text-primary fw-bold">General Ranking</h2>
                    
                    {loading && (
                        <div className="text-center my-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Loading scores...</p>
                        </div>
                    )}

                    {error && <Alert variant="danger">{error}</Alert>}

                    {!loading && !error && (
                        <Table striped bordered hover responsive className="text-center mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th className="py-3">Rank</th>
                                    <th className="py-3">Player (Username)</th>
                                    <th className="py-3">Best Score (Coins)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankings.map((entry, index) => (
                                    <tr key={index} className={entry.username === user.username ? "table-success" : ""}>
                                        <td className="align-middle fw-bold">
                                            {index + 1}
                                        </td>
                                        <td className="align-middle">
                                            {entry.username} {entry.username === user.username && "(You)"}
                                        </td>
                                        <td className="align-middle fw-semibold">
                                            {entry.bestScore}
                                        </td>
                                    </tr>
                                ))}
                                {rankings.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="py-4 text-muted">
                                            No scores have been recorded yet. Be the first to play!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Ranking;