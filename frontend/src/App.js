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
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import ManageChallenges from "./pages/admin/ManageChallenges";
import ManageRooms from "./pages/admin/ManageRooms";
import SubmissionsPage from "./pages/admin/SubmissionsPage";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminChallengeDetail from "./pages/admin/AdminChallengeDetail";
import AdminRoomDetail from "./pages/admin/AdminRoomDetail";
import ContestFeedback from "./pages/ContestFeedback";
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
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/challenges"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <ManageChallenges />
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <ManageRooms />
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <SubmissionsPage />
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <AdminAnalytics />
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/challenges/:id"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <AdminChallengeDetail />
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rooms/:id"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <AdminRoomDetail />
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
            <Route
      path="/feedback/:roomId"
      element={
        <ProtectedRoute>
          <Layout>
            <ContestFeedback />
          </Layout>
        </ProtectedRoute>
      }
/>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
