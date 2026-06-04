import { useContext } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate, Navigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import heroImg from '../assets/hero.png';

function Home() {
  const user = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <Container>
      <Row className="align-items-center">
        <Col lg={6} className="mb-5 mb-lg-0">
          <h1 className="display-4 fw-bold mb-3">Welcome to Last Race!</h1>
          <p className="lead text-muted mb-4">
            A thrilling, fast-paced single-player strategy game inspired by the board game "Race the Rails".
          </p>
          
          <Card className="shadow-sm border-0 bg-light mb-4">
            <Card.Body className="p-4">
              <Card.Title className="fs-4 mb-3 text-primary">Game Instructions</Card.Title>
              <ul className="mb-0">
                <li className="mb-2"><strong>The Mission:</strong> You will be assigned a random starting station and a destination in our fictional underground network.</li>
                <li className="mb-2"><strong>The Clock is Ticking:</strong> You have exactly <strong>90 seconds</strong> to mentally reconstruct the network and plan a valid route segment by segment.</li>
                <li className="mb-2"><strong>Expect the Unexpected:</strong> You start with <strong>20 coins</strong>. As you execute your route, random events at each step will cause you to gain or lose coins.</li>
                <li><strong>The Goal:</strong> Reach your final destination with the highest possible score!</li>
              </ul>
            </Card.Body>
          </Card>

          <div className="d-grid gap-2 d-md-flex justify-content-md-start">
            <Button 
              variant="primary" 
              size="lg" 
              className="px-5 shadow-sm"
              onClick={() => navigate('/login')}
            >
              Log In to Play
            </Button>
          </div>
        </Col>
        
        <Col lg={6} className="text-center">
          <img 
            src={heroImg}       // TODO: modify the image here
            alt="Last Race Hero Graphic" 
            className="img-fluid rounded shadow" 
            style={{ maxHeight: '450px', objectFit: 'cover' }}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default Home;