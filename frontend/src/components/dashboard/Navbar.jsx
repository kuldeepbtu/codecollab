import { useAuth } from "../../contexts/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-8 py-4">

      <h1 className="text-2xl font-bold text-blue-500">
        CodeCollab
      </h1>

      <div className="flex items-center gap-5">

        <span className="text-slate-300">
          {user?.name}
        </span>

        <button
          onClick={logout}
          className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
        >
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;