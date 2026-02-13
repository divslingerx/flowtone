import * as Tone from "tone";

interface StartupModalProps {
  onStart: () => void;
}

export function StartupModal({ onStart }: StartupModalProps) {
  const handleNewProject = async () => {
    await Tone.start();
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
      <div
        className="
          w-full max-w-md mx-4 p-8 rounded-2xl
          bg-gray-900/70 backdrop-blur-lg
          border border-gray-700/50
          shadow-2xl
          flex flex-col items-center gap-8
        "
      >
        {/* Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Flowtone
          </h1>
          <p className="text-gray-400 text-sm">
            Visual audio programming in the browser
          </p>
        </div>

        {/* New Project Button */}
        <button
          onClick={handleNewProject}
          className="
            w-full py-3 px-6 rounded-lg
            bg-blue-600 hover:bg-blue-500
            text-white font-semibold text-base
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500/50
          "
        >
          New Project
        </button>

        {/* Recent Tracks */}
        <div className="w-full">
          <h2 className="text-sm font-medium text-gray-400 mb-3">
            Recent Tracks
          </h2>
          <div
            className="
              rounded-lg py-6
              bg-gray-800/40
              border border-gray-700/30
              text-center
            "
          >
            <p className="text-gray-500 text-sm">
              No recent tracks yet.
              <br />
              Create a new project to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
