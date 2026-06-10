import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import DashboardLayout from '../layouts/DashboardLayout';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import SelectWorkspace from '../pages/SelectWorkspace';
import Dashboard from '../pages/Dashboard';
import Inventory from '../pages/Inventory';
import Customers from '../pages/Customers';
import Vendors from '../pages/Vendors';
import Receivables from '../pages/Receivables';
import Payables from '../pages/Payables';
import Reports from '../pages/Reports';
import Expenses from '../pages/Expenses';
import Goals from '../pages/Goals';
import PersonalReports from '../pages/PersonalReports';
import CopilotWorkspace from '../pages/CopilotWorkspace';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import FloatingPanel from '../components/ai/FloatingPanel';

interface GuardProps {
  children: React.ReactNode;
}

function AuthGuard({ children }: GuardProps) {
  const { isAuthenticated } = useAppStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  const { isAuthenticated } = useAppStore();

  return (
    <>
      <Routes>
        {/* Public Landing */}
        <Route path="/" element={<Landing />} />

        {/* Auth Gates */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Workspace Selector */}
        <Route 
          path="/select-workspace" 
          element={
            <AuthGuard>
              <SelectWorkspace />
            </AuthGuard>
          } 
        />

        {/* Authenticated Application Shell */}
        <Route 
          path="/dashboard" 
          element={
            <AuthGuard>
              <DashboardLayout><Dashboard /></DashboardLayout>
            </AuthGuard>
          } 
        />
        <Route 
          path="/inventory" 
          element={
            <AuthGuard>
              <DashboardLayout><Inventory /></DashboardLayout>
            </AuthGuard>
          } 
        />
        <Route 
          path="/customers" 
          element={
            <AuthGuard>
              <DashboardLayout><Customers /></DashboardLayout>
            </AuthGuard>
          } 
        />
        <Route 
          path="/vendors" 
          element={
            <AuthGuard>
              <DashboardLayout><Vendors /></DashboardLayout>
            </AuthGuard>
          } 
        />
        <Route 
          path="/receivables" 
          element={
            <AuthGuard>
              <DashboardLayout><Receivables /></DashboardLayout>
            </AuthGuard>
          } 
        />
        <Route 
          path="/payables" 
          element={
            <AuthGuard>
              <DashboardLayout><Payables /></DashboardLayout>
            </AuthGuard>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <AuthGuard>
              <DashboardLayout><Reports /></DashboardLayout>
            </AuthGuard>
          } 
        />
        <Route 
          path="/expenses" 
          element={
            <AuthGuard>
              <DashboardLayout><Expenses /></DashboardLayout>
            </AuthGuard>
          } 
        />
        <Route 
          path="/goals" 
          element={
            <AuthGuard>
              <DashboardLayout><Goals /></DashboardLayout>
            </AuthGuard>
          } 
        />
        <Route 
          path="/personal-reports" 
          element={
            <AuthGuard>
              <DashboardLayout><PersonalReports /></DashboardLayout>
            </AuthGuard>
          } 
        />
        <Route 
          path="/copilot" 
          element={
            <AuthGuard>
              <DashboardLayout><CopilotWorkspace /></DashboardLayout>
            </AuthGuard>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <AuthGuard>
              <DashboardLayout><Profile /></DashboardLayout>
            </AuthGuard>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <AuthGuard>
              <DashboardLayout><Settings /></DashboardLayout>
            </AuthGuard>
          } 
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating AI Panel mounted globally on authenticated screens */}
      {isAuthenticated && <FloatingPanel />}
    </>
  );
}
