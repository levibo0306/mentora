import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./ui/Navbar";
import { Login } from "./pages/Login";
import { QuizList } from "./ui/QuizList";
import { CreateQuizForm } from "./ui/CreateQuizForm";
import { MetricsPanel } from "./ui/MetricsPanel";
import { Modal } from "./ui/Modal"; 
import { useAuth } from "./context/AuthContext";
import { QuizPlayer } from "./ui/QuizPlayer";

// --- Dashboard Komponens ---
const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  const handleCreateClick = () => {
    setEditingQuizId(null);
    setShowModal(true);
  };

  const handleEditClick = (id: string) => {
    setEditingQuizId(id);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setRefreshKey(prev => prev + 1);
    setEditingQuizId(null);
  };

  return (
    <div className="dashboard active">
      <div className="main-content">
        <div className="section-header">
          <h2 className="section-title">Saját Projektek</h2>
          <button className="btn btn-primary" onClick={handleCreateClick}>
            + Új Kvíz
          </button>
        </div>

        <QuizList key={refreshKey} onEdit={handleEditClick} />

        <div style={{ marginTop: "40px" }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowMetrics((v) => !v)}
            style={{ padding: '12px 24px' }}
          >
            {showMetrics ? "Metrikák elrejtése" : "Metrikák megjelenítése"}
          </button>
          {showMetrics && <MetricsPanel />}
        </div>
        
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          title={editingQuizId ? "Kvíz Szerkesztése" : "Új Kvíz Létrehozása"}
        >
          <CreateQuizForm 
            quizId={editingQuizId} 
            onSuccess={handleSuccess} 
          />
        </Modal>
      </div>
    </div>
  );
};

// --- Protected Route ---
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Betöltés...
      </div>
    ); 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// --- Main App Component ---
export default function App() {
  const { user } = useAuth();

  return (
    <div>
      {user && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/play/:id"
          element={
            <ProtectedRoute>
              <QuizPlayer />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}