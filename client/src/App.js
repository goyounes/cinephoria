import { BrowserRouter, Routes, Route } from 'react-router-dom';


import {Home, Movies, Tickets, Screenings, Messages} from './pages';
import Footer from './components/Footer';
import TopNavBar from './components/TopNavBar';

import './assets/global.css';

function App() {
  return (
    <div className="App">
    <BrowserRouter>
      <TopNavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />}>
            <Route path=":id" element={<Movies />} />
            <Route path="create" element={<Movies />} />
          </Route>
          <Route path="/screenings" element={<Screenings />} >
            <Route path=":id" element={<Screenings />} />
            <Route path="create" element={<Screenings />} />
          </Route>
          <Route path="/tickets" element={<Tickets />} >
            <Route path=":id" element={<Tickets />} />
            <Route path="create" element={<Tickets />} />
          </Route>
          <Route path="/messages" element={<Messages />} />
        </Routes>
      <Footer />
    </BrowserRouter>
    </div>
  );
}

export default App;
