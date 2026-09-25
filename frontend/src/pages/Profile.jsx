import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/dashboard/Navbar";
import { User, Mail, Calendar, ArrowLeft } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.name || "Developer"}</h2>
              <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                SDE Member
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-4 border border-slate-800/80">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Email Address</p>
                <p className="text-sm font-medium text-white">{user?.email || "Not specified"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-4 border border-slate-800/80">
              <User className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Account ID</p>
                <p className="font-mono text-xs text-slate-300">{user?.id || user?._id || "Active session"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-4 border border-slate-800/80">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Platform Skills</p>
                <p className="text-sm font-medium text-emerald-400">MERN Stack • Java • JavaScript • DSA</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}