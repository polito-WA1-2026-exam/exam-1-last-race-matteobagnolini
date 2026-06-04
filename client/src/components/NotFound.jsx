import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Container className="py-5 text-center mt-5">
      <h1 className="display-1 fw-bold text-danger">404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="lead text-muted mb-5">
        Oops! You've gone off the tracks. The station you are looking for does not exist in our network.
      </p>
      <Button 
        variant="primary" 
        size="lg" 
        className="px-4 shadow-sm"
        onClick={() => navigate('/')}
      >
        Return to Home Station
      </Button>
    </Container>
  );
}

export default NotFound;