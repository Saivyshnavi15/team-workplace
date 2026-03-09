import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setWorkspaces(data.user.workspaces || []);
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Workspace created successfully!');
        setFormData({ name: '', description: '' });
        setShowCreateForm(false);
        // Fetch updated user data
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const userData = await userResponse.json();
        if (userData.success) {
          setUser(userData.user);
          setWorkspaces(userData.user.workspaces || []);
        }
      } else {
        toast.error(data.message || 'Failed to create workspace');
      }
    } catch (error) {
      toast.error('Error creating workspace');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-135">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Team Workspace
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome to Team Workspace
            </h2>
            <p className="text-gray-100">
              Create or manage workspaces to collaborate with your team.
            </p>
          </div>

          {workspaces.length === 0 ? (
            <div className="card text-center py-12">
              <h3 className="text-2xl font-semibold mb-4">No workspaces yet</h3>
              <p className="text-gray-600 mb-8">
                Create your first workspace to get started collaborating with your team.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="button"
              >
                + Create Your First Workspace
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Your Workspaces</h3>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="button"
                >
                  + New Workspace
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaces.map((workspace) => (
                  <div key={workspace._id} className="card hover:shadow-xl transition-all">
                    <h4 className="text-xl font-bold mb-2">{workspace.name}</h4>
                    <p className="text-gray-600 mb-6 min-h-12">
                      {workspace.description || 'No description'}
                    </p>
                    <Link
                      to={`/workspace/${workspace._id}`}
                      className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                    >
                      Open Workspace →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Workspace Modal */}
      {showCreateForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Create New Workspace</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter workspace name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter workspace description (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 button disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;