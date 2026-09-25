import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-100">
      <div className="rounded-full bg-red-500/10 p-4 mb-4 border border-red-500/20">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">404 - Room Not Found</h1>
      <p className="max-w-md text-sm text-slate-400 mb-8">
        The collaborative session or page you are looking for does not exist or may have been deleted by the admin.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}