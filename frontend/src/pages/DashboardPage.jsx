import Navbar from "../components/dashboard/Navbar";
import CreateRoomCard from "../components/dashboard/CreateRoomCard";
import JoinRoomCard from "../components/dashboard/JoinRoomCard";
import RecentRooms from "../components/dashboard/RecentRooms";

function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950">

      <Navbar />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 p-8 lg:grid-cols-2">

        <CreateRoomCard />

        <JoinRoomCard />

      </div>

      <div className="mx-auto max-w-7xl px-8 pb-8">

        <RecentRooms />

      </div>

    </div>
  );
}

export default DashboardPage;