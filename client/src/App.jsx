import 'bootstrap/dist/css/bootstrap.min.css';

import { useContext, useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';

import UserContext from './contexts/UserContext.js';

import { doLogin, doLogout, checkSession } from './api/auth.js';

import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import { LoginForm, Logout } from './components/LoginForm.jsx';

function App() {
  
  const navigate = useNavigate();

  const [user, setUser] = useState( { id: undefined, username: undefined } );

  // try to restore the login session
  // useEffect(() => {
  //   checkSession().then(result => {
  //     if (result) {
  //       setUser({ id: result.id, email: result.username, name: result.name });
  //     }
  //   })
  // }, []);

  // Login action handler
  const doLogin = (newUser) => {
    setUser({ id: newUser.id, username: newUser.username });
    navigate('/');
  };

  return (
    <UserContext.Provider value={user}>
      <Container>
        <Routes>
          <Route path='/' element={<MainLayout doLogin={doLogin} />}>
            <Route index element={<LoginView />} />
            <Route path='login' element={<LoginForm doLogin={doLogin} />} />
            <Route path='logout' element={<Logout doLogin={doLogin} />} />
          </Route>
        </Routes>
      </Container>
    </UserContext.Provider>
  )

}

function MainLayout(props) {
  return <>
    <Header doLogin={props.doLogin}></Header>
    <Outlet />
    <Footer></Footer>
  </>
}

function LoginView(props) {
  // if user.id is not undefined, navigate to /home
  const user = useContext(UserContext)
  if (user.id)
    return <Navigate to='/home' />

  return "Login View : main welcome page for anonymous users"
}


export default App;