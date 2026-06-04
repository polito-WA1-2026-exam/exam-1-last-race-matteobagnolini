import { useContext } from "react";
import { Button, Container, Navbar, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import UserContext from "../contexts/UserContext";

function Header() {
  const user = useContext(UserContext);
  const homePageDestination = "/";

  return (
    <Navbar bg="dark" variant="dark" expand="md" sticky="top" className="py-3 mb-4 shadow-sm">
      <Container fluid className="px-4">
        <Navbar.Brand 
          as={Link} 
          to={homePageDestination}
          className="fs-3 fw-bold text-uppercase tracking-wide"
        >
          Last Race: The Game
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto ms-4">
            {user.id && (
              <Nav.Link as={Link} to="/ranking" className="text-light fw-semibold">
                Rankings
              </Nav.Link>
            )}
          </Nav>
          
          <div className="d-flex align-items-center ms-auto mt-3 mt-md-0">
            {user?.username ? <UserInfo name={user.username} /> : <LoginButton />}
          </div>
        </Navbar.Collapse>
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
        Hi,  <strong className="text-white">{name}</strong>
      </Navbar.Text>
      
      <Link to="/logout" className="btn btn-outline-light btn-sm px-3">
        Logout
      </Link>
    </div>
  );
}

export default Header;