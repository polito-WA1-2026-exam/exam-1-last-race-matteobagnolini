import { useState, useEffect } from "react"
import { checkSession, doLogin, doLogout } from "../api/auth"
import { useNavigate } from "react-router"
import { Form, Button, Container, Alert } from "react-bootstrap"

function LoginForm(props) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [errormsg, setErrormsg] = useState('')

    const doSubmit = async (ev) => {
        ev.preventDefault()
        setErrormsg('')

        try {
            const user = await doLogin(username, password)
            props.doLogin(user)
        } catch (ex) {
            setErrormsg(ex.message)
        }
    }

    return (
        <Container>
            <h2>Please login</h2>

            {errormsg && (
                <Alert variant="danger" dismissible onClose={() => setErrormsg('')}>
                    {errormsg}
                </Alert>
            )}

            <Form onSubmit={doSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" placeholder="Enter username" value={username} onChange={(ev) => setUsername(ev.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" value={password} onChange={(ev) => setPassword(ev.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Log in
                </Button>
            </Form>
        </Container>
    );


}

function Logout(props) {
    const navigate = useNavigate()

    useEffect(() => {
        doLogout().then(() => {
            props.doLogin({ id: undefined, username: undefined })
            navigate('/')
        })
    }, [])

    return "Logging out..."

}

export { LoginForm, Logout }