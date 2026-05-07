import { useEffect, useState } from "react";
import api from "../api/axios";

const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await api.get("auth/sessions/");
      setSessions(res.data);
    } catch (err) {
      console.log("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleLogoutAll = async () => {
    try {
      await api.post("auth/logout-all/");
      window.location.href = "/login";
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogoutCurrent = async () => {
    try {
      await api.post("auth/logout/");
      window.location.href = "/login";
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <p>Loading sessions...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Active Sessions</h2>

        {sessions.length === 0 ? (
          <p>No active sessions</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <div
                key={index}
                className="flex justify-between items-center border p-4 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{session.device}</p>
                  <p className="text-sm text-gray-500">{session.ip}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(session.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  {session.current ? (
                    <button
                      onClick={handleLogoutCurrent}
                      className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                      Logout (Current)
                    </button>
                  ) : (
                    <span className="text-green-600 font-medium">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleLogoutAll}
          className="mt-6 w-full bg-black text-white py-3 rounded-lg"
        >
          Logout All Devices
        </button>
      </div>
    </div>
  );
};

export default SessionsPage;