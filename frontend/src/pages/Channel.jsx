import { useParams } from 'react-router-dom';

const Channel = () => {
  const { workspaceId, channelId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Channel {channelId}</h1>
          <p className="mt-2 text-gray-600">Channel page - Chat and tasks will be displayed here.</p>
          <p className="text-sm text-gray-500">Workspace: {workspaceId}</p>
        </div>
      </div>
    </div>
  );
};

export default Channel;