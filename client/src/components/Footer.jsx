import { Container } from "react-bootstrap";

function Footer() {
  return (
    <footer className="bg-dark text-white-50 py-3 mt-auto">
      <Container fluid className="text-center">
        <p className="m-0 small">
          &copy; 2026 The Last Race: The Game. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

export default Footer;