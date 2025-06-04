import { BrowserRouter, Routes, Route } from 'react-router-dom';


import {Home, Movies, Tickets, Screenings, Messages} from './pages';
import AddMovie from './pages/Movies/AddMovie';

import Footer from './components/Footer';
import TopNavBar from './components/TopNavBar';

import './assets/global.css';

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
      </Routes>
      <Footer />
    </BrowserRouter>
    </div>
  );
}

export default App;
