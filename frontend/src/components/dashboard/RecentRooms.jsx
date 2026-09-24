import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRooms } from "../../services/roomService";

function RecentRooms() {
  const [rooms, setRooms] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await getMyRooms();
      setRooms(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (rooms.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-800 p-6">
        <h2 className="mb-4 text-2xl font-bold">My Rooms</h2>
        <p className="text-slate-400">
          No rooms created yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-800 p-6">

      <h2 className="mb-5 text-2xl font-bold">
        My Rooms
      </h2>

      {rooms.map((room) => (
        <div
          key={room.roomId}
          className="mb-4 rounded-lg border border-slate-700 p-4"
        >
          <p>
            <strong>Room ID:</strong> {room.roomId}
          </p>

          <p>
            <strong>Language:</strong> {room.language}
          </p>

          <p>
            <strong>Mode:</strong> {room.accessMode}
          </p>

          <button
            onClick={() => navigate(`/room/${room.roomId}`)}
            className="mt-3 rounded bg-blue-600 px-4 py-2 hover:bg-blue-700"
          >
            Open Room
          </button>
        </div>
      ))}
    </div>
  );
}

export default RecentRooms;