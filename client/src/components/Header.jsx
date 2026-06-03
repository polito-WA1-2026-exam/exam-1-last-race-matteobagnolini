import { useContext } from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom"; // Assuming react-router-dom for v6+

import UserContext from "../contexts/UserContext";

function Header() {
  const user = useContext(UserContext);
  const destination = user?.id ? "/home" : "/";

  return (
    <Navbar bg="dark" variant="dark" expand="md" className="py-3 shadow-sm">
      <Container fluid className="px-4">
        {/* Navbar.Brand is the Bootstrap standard for titles/logos */}
        <Navbar.Brand 
          as={Link} 
          to={destination} 
          className="fs-3 fw-bold text-uppercase tracking-wide"
        >
          Last Race: The Game
        </Navbar.Brand>
        
        {/* Flexbox utilities to align the auth section to the right */}
        <div className="d-flex align-items-center ms-auto">
          {user?.username ? <UserInfo name={user.username} /> : <LoginButton />}
        </div>
      </Container>
    </Navbar>
  );
}

function LoginButton() {
  const navigate = useNavigate();

  return (
    <Button 
      variant="primary" 
      className="px-4 fw-semibold"
      onClick={() => navigate("/login")}
    >
      Log In
    </Button>
  );
}

function UserInfo({ name }) {
  return (
    <div className="d-flex align-items-center gap-3">
      <Navbar.Text className="text-light m-0">
        Signed in as: <strong className="text-white">{name}</strong>
      </Navbar.Text>
      
      {/* Styling the Link as a Bootstrap outline button */}
      <Link to="/logout" className="btn btn-outline-light btn-sm px-3">
        Logout
      </Link>
    </div>
  );
}

export default Header;