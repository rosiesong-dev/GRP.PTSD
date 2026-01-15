import { Routes, Route } from "react-router-dom";
import ClientList from "./ClientList";
import ClientDetail from "./ClientDetail";
import FamilyList from "./FamilyList";
import AddClient from "./AddClient";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ClientList />} />
      <Route path="/clients/:id" element={<ClientDetail />} />
      <Route path="/families/:id" element={<FamilyList />} />
      <Route path="/AddClient" element={<AddClient />} />
    </Routes>
  );
}

export default App;