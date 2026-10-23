// ============================================================
// App.tsx – Application Routing & Protected Layout
// ============================================================
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './contexts/AppContext';
import AppLayout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CompanyManagement from './pages/CompanyManagement';
import { CompanyForm } from './pages/CompanyForm';
import { EmployeeManagement } from './pages/EmployeeManagement';
import { BatchUpload } from './pages/BatchUpload';
import { LetterheadList } from './pages/LetterheadList';
import { LetterheadDesigner } from './pages/LetterheadDesigner';
import { TemplateLibrary } from './pages/TemplateLibrary';
import { TemplateEditor } from './pages/TemplateEditor';
import { DocumentGenerator } from './pages/DocumentGenerator';
import { DocumentHistory } from './pages/DocumentHistory';
import { DocumentPreview } from './pages/DocumentPreview';
import { ApprovalWorkflow } from './pages/ApprovalWorkflow';
import { TerminationWorkflowPage } from './pages/TerminationWorkflow';
import { AbsenceManagement } from './pages/AbsenceManagement';
import { AuditLogs } from './pages/AuditLogs';
import { Settings } from './pages/Settings';
import { Spin } from 'antd';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, currentCompanyId, switchCompany, user, logout } = useApp();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Spin size="large" tip="Initializing Universal HR System..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <AppLayout
      currentCompanyId={currentCompanyId}
      onCompanyChange={switchCompany}
      userName={user?.name || 'HR Administrator'}
      onLogout={logout}
    >
      {children}
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/companies"
        element={
          <ProtectedRoute>
            <CompanyManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/companies/new"
        element={
          <ProtectedRoute>
            <CompanyForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/companies/:id/edit"
        element={
          <ProtectedRoute>
            <CompanyForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <EmployeeManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/batch-upload"
        element={
          <ProtectedRoute>
            <BatchUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/letterheads"
        element={
          <ProtectedRoute>
            <LetterheadList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/letterheads/new"
        element={
          <ProtectedRoute>
            <LetterheadDesigner />
          </ProtectedRoute>
        }
      />
      <Route
        path="/letterheads/:id/edit"
        element={
          <ProtectedRoute>
            <LetterheadDesigner />
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <TemplateLibrary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates/new"
        element={
          <ProtectedRoute>
            <TemplateEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates/:id/edit"
        element={
          <ProtectedRoute>
            <TemplateEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/generate"
        element={
          <ProtectedRoute>
            <DocumentGenerator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <DocumentHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents/:id"
        element={
          <ProtectedRoute>
            <DocumentPreview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/approvals"
        element={
          <ProtectedRoute>
            <ApprovalWorkflow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/termination"
        element={
          <ProtectedRoute>
            <TerminationWorkflowPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/absence"
        element={
          <ProtectedRoute>
            <AbsenceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute>
            <AuditLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
