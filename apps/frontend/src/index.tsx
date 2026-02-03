import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./ui/Navbar";
import { Login } from "./pages/Login";
import { QuizList } from "./ui/QuizList";
import { CreateQuizForm } from "./ui/CreateQuizForm";
import { Results } from "./pages/Results";
import { Missions } from "./pages/Missions";
import { Modal } from "./ui/Modal"; 
import { useAuth } from "./context/AuthContext";
import { QuizPlayer } from "./ui/QuizPlayer";
import { SharedQuiz } from "./pages/SharedQuiz";
import { SharedWithMe } from "./ui/SharedWithMe";
import { DashboardOverview } from "./ui/DashboardOverview";

// --- Dashboard Komponens ---
const Dashboard = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  
  // Tab state (csak diákoknak)
  const [activeTab, setActiveTab] = useState<'own' | 'shared'>('own');

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

  const isStudent = user?.role === 'student';

  return (
    <div className="dashboard active">
      <div className="main-content">
        <DashboardOverview />

        <div className="section-header">
          <h2 className="section-title">{isStudent ? "Kvízeim" : "Saját kvízeim"}</h2>
          
          {!isStudent && (
            <button className="btn btn-primary" onClick={handleCreateClick}>
              + Új Kvíz
            </button>
          )}
        </div>

        {/* TAB SWITCHER - csak diákoknak */}
        {isStudent && (
          <div className="tabs">
            <button
              onClick={() => setActiveTab('own')}
              className={`tab ${activeTab === 'own' ? "active" : ""}`}
            >
              📚 Saját Kvízek
            </button>
            <button
              onClick={() => setActiveTab('shared')}
              className={`tab ${activeTab === 'shared' ? "active" : ""}`}
            >
              👨‍🏫 Velem Megosztva
            </button>
          </div>
        )}

        {/* CONTENT - diákoknál tab-based, tanároknál csak lista */}
        {isStudent ? (
          activeTab === 'own' ? (
            <QuizList key={refreshKey} onEdit={handleEditClick} />
          ) : (
            <SharedWithMe key={`shared-${refreshKey}`} />
          )
        ) : (
          <QuizList key={refreshKey} onEdit={handleEditClick} />
        )}

        {/* Modal - csak tanároknak */}
        {!isStudent && (
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
        )}
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
        
        {/* PUBLIC ROUTE - Nincs védelem! */}
        <Route path="/shared/:token" element={<SharedQuiz />} />
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/missions"
          element={
            <ProtectedRoute>
              <Missions />
            </ProtectedRoute>
          }
        />
        
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
