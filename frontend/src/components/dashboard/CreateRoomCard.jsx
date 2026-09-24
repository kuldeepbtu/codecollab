import { useState } from "react";
import toast from "react-hot-toast";
import { createRoom } from "../../services/roomService";

function CreateRoomCard() {
  const [loading, setLoading] = useState(false);

  const [accessMode, setAccessMode] = useState("open");
  const [language, setLanguage] = useState("cpp");

  const create = async () => {
    try {
      setLoading(true);

      const res = await createRoom({
        accessMode,
        language,
      });

      await navigator.clipboard.writeText(res.room.roomId);

      toast.success(`Room Created (${res.room.roomId})`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }

    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-slate-800 p-6 shadow-lg">

      <h2 className="mb-6 text-2xl font-bold">
        Create Room
      </h2>

      <label className="mb-2 block">Access Mode</label>

      <select
        value={accessMode}
        onChange={(e) => setAccessMode(e.target.value)}
        className="mb-5 w-full rounded-lg border border-slate-700 bg-slate-900 p-3"
      >
        <option value="open">Open</option>
        <option value="approval">Approval Required</option>
      </select>

      <label className="mb-2 block">Language</label>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="mb-6 w-full rounded-lg border border-slate-700 bg-slate-900 p-3"
      >
        <option value="cpp">C++</option>
        <option value="java">Java</option>
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
      </select>

      <button
        onClick={create}
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3 hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create Room"}
      </button>

    </div>
  );
}

export default CreateRoomCard;