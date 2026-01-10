import { Routes, Route } from "react-router-dom";
import ClientList from "./ClientList";
import ClientDetail from "./ClientDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ClientList />} />
      <Route path="/clients/:id" element={<ClientDetail />} />
    </Routes>
  );
}

export default App;