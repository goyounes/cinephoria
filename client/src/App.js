import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Movies from './pages/Movies';
import Tickets from './pages/Tickets';
import Screenings from './pages/Screenings'; 
import Messages from './pages/Messages';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
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
      </BrowserRouter>
    </div>
  );
}

export default App;
