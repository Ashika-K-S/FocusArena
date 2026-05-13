import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import SessionsPage from "./pages/SessionsPage";
import JoinRoom from "./pages/JoinRoom";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Layout from "./components/Layout";

import CreateRoom from "./pages/CreateRoom";
import RoomLobby from "./pages/RoomLobby";
import BattleRoom from "./pages/BattleRoom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <Layout>
                <SessionsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-room"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateRoom />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/join-room"
          element={
            <ProtectedRoute>
              <Layout>
                <JoinRoom />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/room/:roomCode"
          element={
            <ProtectedRoute>
              <Layout>
                <RoomLobby />
              </Layout>
            </ProtectedRoute>
          }
        />
                <Route
          path="/battle/:roomCode"
          element={
            <ProtectedRoute>
              <BattleRoom />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;