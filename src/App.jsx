// =====================================================
// App.jsx — Roteamento e Estrutura Principal
// Configura as rotas e o contexto de autenticação.
// =====================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import UserFeedback from './pages/UserFeedback';
import Login from './pages/Login';
import AdminManagement from './pages/AdminManagement';
import AdminEvaluation from './pages/AdminEvaluation';
import AssessmentWizard from './pages/AssessmentWizard';
import { AuthProvider, useAuth } from './context/AuthContext';

/**
 * RotaPrivada
 * Protege rotas que exigem autenticação.
 */
const RotaPrivada = ({ children, papelExigido }) => {
  const { usuario, carregando } = useAuth();

  if (carregando) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Carregando...</div>;

  if (!usuario) return <Navigate to="/login" />;

  if (papelExigido && usuario.papel !== papelExigido) {
    return <Navigate to={usuario.papel === 'ADMIN' ? '/admin' : '/feedback'} />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950">
          <Routes>
            {/* Rota Pública */}
            <Route path="/login" element={<Login />} />

            {/* Rotas Protegidas - Admin */}
            <Route
              path="/admin"
              element={
                <RotaPrivada papelExigido="ADMIN">
                  <AdminDashboard />
                </RotaPrivada>
              }
            />
            <Route
              path="/admin/gestao"
              element={
                <RotaPrivada papelExigido="ADMIN">
                  <AdminManagement />
                </RotaPrivada>
              }
            />

            <Route
              path="/admin/avaliar"
              element={
                <RotaPrivada papelExigido="ADMIN">
                  <AdminEvaluation />
                </RotaPrivada>
              }
            />

            {/* Rotas Protegidas - Colaborador */}
            <Route
              path="/feedback"
              element={
                <RotaPrivada>
                  <UserFeedback />
                </RotaPrivada>
              }
            />
            <Route
              path="/avaliar"
              element={
                <RotaPrivada>
                  <AssessmentWizard />
                </RotaPrivada>
              }
            />

            {/* Redirecionamento Padrão */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<div className="text-white p-10 text-center">404 - Página não encontrada</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
