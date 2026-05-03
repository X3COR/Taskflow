import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login     from './pages/Login';
import Signup    from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects  from './pages/Projects';
import Tasks     from './pages/Tasks';
import Board     from './pages/Board';
import Members   from './pages/Members';

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={
            <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
          }/>
          <Route path="/projects" element={
            <ProtectedRoute><AppLayout><Projects /></AppLayout></ProtectedRoute>
          }/>
          <Route path="/tasks" element={
            <ProtectedRoute><AppLayout><Tasks /></AppLayout></ProtectedRoute>
          }/>
          <Route path="/board" element={
            <ProtectedRoute><AppLayout><Board /></AppLayout></ProtectedRoute>
          }/>
          <Route path="/members" element={
            <ProtectedRoute adminOnly><AppLayout><Members /></AppLayout></ProtectedRoute>
          }/>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}