import { Routes, Route } from "react-router-dom";
import ClientList from "./ClientList";
import ClientDetail from "./ClientDetail";
import FamilyList from "./FamilyList";
import AddClient from "./AddClient";
import CounselRecords from "./CounselRecords";
import CounselRecords2 from "./CounselRecords2";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ClientList />} />
      <Route path="/clients/:id" element={<ClientDetail />} />
      <Route path="/families/:id" element={<FamilyList />} />
      <Route path="/AddClient" element={<AddClient />} />
      <Route path="/counseling/:id" element={<CounselRecords />} />
      <Route path="/counseling2/:id" element={<CounselRecords2 />} />
    </Routes>
  );
}

export default App;