import { BrowserRouter, Routes, Route } from 'react-router-dom';


import { Home, Movies, Tickets, Screenings, Messages } from './pages';
import { Signin, Signup } from './pages/Auth';
import AddMovie from './pages/Movies/AddMovie';

import Footer from './components/Footer';
import TopNavBar from './components/TopNavBar';

import './assets/global.css';
import AddUser from './pages/Users/AddUser';
import Users from './pages/Users/Users';


function App() {
  return (
    <div className="App">
    <BrowserRouter>
      <TopNavBar />
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />
        {/* Movies */}
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/create" element={<AddMovie />} />
        <Route path="/movies/:id" element={<Movies />} />
        {/* Screenings */}
        <Route path="/screenings" element={<Screenings />} />
        <Route path="/screenings/create" element={<Screenings />} />
        <Route path="/screenings/:id" element={<Screenings />} />
        {/* Tickets */}
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/create" element={<Tickets />} />
        <Route path="/tickets/:id" element={<Tickets />} />
        {/* Messages */}
        <Route path="/messages" element={<Messages />} />
        {/* Users */}
        <Route path="/users" element={<Users />} />



        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/users/create" element={<AddUser />} />

      </Routes>
      <Footer />
    </BrowserRouter>
    </div>
  );
}

export default App;
