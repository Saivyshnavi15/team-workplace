import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Workspace = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [channelForm, setChannelForm] = useState({ name: '', description: '', type: 'public' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [channels, setChannels] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [addingMember, setAddingMember] = useState(false);
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/workspaces/${workspaceId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setWorkspace(data.workspace);
        }
      } catch (error) {
        console.error('Error fetching workspace:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setAddingMember(true);
    const token = localStorage.getItem('token');

    try {
      // First, find the user by email
      const userResponse = await fetch(`/api/auth/find-user?email=${encodeURIComponent(memberEmail)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const userData = await userResponse.json();

      if (!userData.success) {
        toast.error('User not found with this email');
        return;
      }

      const userId = userData.user.id;

      // Add the user to the workspace
      const addResponse = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      const addData = await addResponse.json();

      if (addData.success) {
        toast.success('Member added successfully!');
        setMemberEmail('');
        setShowAddMemberModal(false);

        // Refresh workspace data
        const workspaceResponse = await fetch(`/api/workspaces/${workspaceId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const workspaceData = await workspaceResponse.json();
        if (workspaceData.success) {
          setWorkspace(workspaceData.workspace);
        }
      } else {
        toast.error(addData.message || 'Failed to add member');
      }
    } catch (error) {
      toast.error('Error adding member');
      console.error('Error:', error);
    } finally {
      setAddingMember(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/channels/workspace/${workspaceId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setChannels(data.channels);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/workspace/${workspaceId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!channelForm.name.trim()) {
      toast.error('Please enter a channel name');
      return;
    }

    setCreatingChannel(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...channelForm,
          workspaceId
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Channel created successfully!');
        setChannelForm({ name: '', description: '', type: 'public' });
        setShowCreateChannelModal(false);
        fetchChannels(); // Refresh channels list
      } else {
        toast.error(data.message || 'Failed to create channel');
      }
    } catch (error) {
      toast.error('Error creating channel');
      console.error('Error:', error);
    } finally {
      setCreatingChannel(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    setCreatingTask(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...taskForm,
          workspaceId
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Task created successfully!');
        setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
        setShowCreateTaskModal(false);
        fetchTasks(); // Refresh tasks list
      } else {
        toast.error(data.message || 'Failed to create task');
      }
    } catch (error) {
      toast.error('Error creating task');
      console.error('Error:', error);
    } finally {
      setCreatingTask(false);
    }
  };

  useEffect(() => {
    if (workspace) {
      fetchChannels();
      fetchTasks();
    }
  }, [workspace]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-135">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-135">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">Workspace not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="button"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-135">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
              <p className="text-gray-600 mt-1">{workspace.description}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Channels Section */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Channels</h3>
            {channels.length > 0 ? (
              <div className="mb-4 space-y-2">
                {channels.map((channel) => (
                  <div key={channel._id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div>
                      <span className="font-medium text-gray-900">#{channel.name}</span>
                      {channel.description && (
                        <p className="text-sm text-gray-600">{channel.description}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      channel.type === 'public' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {channel.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mb-4">No channels yet</p>
            )}
            <button
              onClick={() => setShowCreateChannelModal(true)}
              className="button w-full text-sm"
            >
              + Create Channel
            </button>
          </div>

          {/* Members Section */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Members</h3>
            <div className="mb-4">
              <p className="text-gray-600">
                {workspace.members ? workspace.members.length : 1} member(s)
              </p>
              {workspace.members && workspace.members.length > 0 && (
                <div className="mt-2 space-y-2">
                  {workspace.members.map((member, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700">
                        {member.user?.name || 'Unknown User'}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="button w-full text-sm"
            >
              + Add Members
            </button>
          </div>

          {/* Tasks Section */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Tasks</h3>
            {tasks.length > 0 ? (
              <div className="mb-4 space-y-2">
                {tasks.map((task) => (
                  <div key={task._id} className="bg-gray-50 p-3 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{task.title}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mb-4">No tasks yet</p>
            )}
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="button w-full text-sm"
            >
              + Create Task
            </button>
          </div>
        </div>

        {/* Workspace Info */}
        <div className="card mt-6">
          <h3 className="text-xl font-bold mb-6">Workspace Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workspace ID
              </label>
              <input
                type="text"
                value={workspaceId}
                disabled
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created
              </label>
              <input
                type="text"
                value={workspace.createdAt ? new Date(workspace.createdAt).toLocaleDateString() : 'N/A'}
                disabled
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Add Member to Workspace</h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the email address of the user you want to add to this workspace.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMember}
                  className="flex-1 button disabled:opacity-50"
                >
                  {addingMember ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateChannelModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Create New Channel</h3>
              <button
                onClick={() => setShowCreateChannelModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Name
                </label>
                <input
                  type="text"
                  placeholder="Enter channel name"
                  value={channelForm.name}
                  onChange={(e) => setChannelForm({...channelForm, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Describe what this channel is for"
                  value={channelForm.description}
                  onChange={(e) => setChannelForm({...channelForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Type
                </label>
                <select
                  value={channelForm.type}
                  onChange={(e) => setChannelForm({...channelForm, type: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                >
                  <option value="public">Public - Anyone in workspace can join</option>
                  <option value="private">Private - Invite only</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateChannelModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingChannel}
                  className="flex-1 button disabled:opacity-50"
                >
                  {creatingChannel ? 'Creating...' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Create New Task</h3>
              <button
                onClick={() => setShowCreateTaskModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Describe the task details"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="flex-1 button disabled:opacity-50"
                >
                  {creatingTask ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;