import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../../services/roomService";

function JoinRoomCard() {
  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();

  const join = async () => {
    if (!roomId.trim()) {
      toast.error("Please enter a Room ID");
      return;
    }

    try {
      const res = await joinRoom(roomId.trim());

      toast.success(res.message);

      navigate(`/room/${roomId}`);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Join Failed"
      );
    }
  };

  return (
    <div className="rounded-2xl bg-slate-800 p-6">

      <h2 className="mb-3 text-2xl font-bold">
        Join Room
      </h2>

      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
        className="mb-5 w-full rounded-lg border border-slate-700 bg-slate-900 p-3"
      />

      <button
        onClick={join}
        className="w-full rounded-xl bg-green-600 py-3 hover:bg-green-700"
      >
        Join Room
      </button>

    </div>
  );
}

export default JoinRoomCard;