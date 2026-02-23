import { Routes, Route, Navigate } from "react-router-dom";
import ClientList from "./ClientList";
import ClientDetail from "./ClientDetail";
import FamilyList from "./FamilyList";
import AddClient from "./AddClient";
import CounselRecords from "./CounselRecords";
import CounselRecords2 from "./CounselRecords2";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import PclAdult from "./PclAdult";
import PclChild from "./PclChild";
import CounselingSessions from "./CounselingSessions";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* 보호된 라우트 */}
      <Route path="/clients" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
      <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
      <Route path="/families/:id" element={<ProtectedRoute><FamilyList /></ProtectedRoute>} />
      <Route path="/add-client" element={<ProtectedRoute><AddClient /></ProtectedRoute>} />
      <Route path="/counseling/:id" element={<ProtectedRoute><CounselRecords /></ProtectedRoute>} />
      <Route path="/counseling2/:id" element={<ProtectedRoute><CounselRecords2 /></ProtectedRoute>} />
      <Route path="/pcl-adult/:id" element={<ProtectedRoute><PclAdult /></ProtectedRoute>} />
      <Route path="/pcl-child/:id" element={<ProtectedRoute><PclChild /></ProtectedRoute>} />
      <Route path="/counseling-sessions/:id" element={<ProtectedRoute><CounselingSessions /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;