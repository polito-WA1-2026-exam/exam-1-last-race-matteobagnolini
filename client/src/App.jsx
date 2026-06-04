import 'bootstrap/dist/css/bootstrap.min.css';

import { useContext, useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';

import UserContext from './contexts/UserContext.js';

import { doLogin, doLogout, checkSession } from './api/auth.js';

import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import { LoginForm, Logout } from './components/LoginForm.jsx';
import Home from './components/Home.jsx'
import Ranking from './components/Ranking.jsx';
import NotFound from './components/NotFound.jsx';
import Play from './components/Play.jsx';

function App() {
  
  const navigate = useNavigate();

  const [user, setUser] = useState( { id: undefined, username: undefined } );

  const doLogin = (newUser) => {
    setUser({ id: newUser.userId, username: newUser.username });
    navigate('/');
  };

  return (
    <UserContext.Provider value={user}>
        <Routes>
          <Route path='/' element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path='login' element={<LoginForm doLogin={doLogin} />} />
            <Route path='logout' element={<Logout doLogin={doLogin} />} />
            <Route path='ranking' element={<Ranking />} />
            <Route path='play' element={<Play />} />
            <Route path='*' element={<NotFound />} />
          </Route>
        </Routes>
    </UserContext.Provider>
  )

}

function MainLayout(props) {
  return (
  <div className="d-flex flex-column min-vh-100">
    <Header doLogin={props.doLogin} />
    <main className="flex-grow-1">
      <Outlet />
    </main>
    <Footer />
  </div>
  );
}


export default App;