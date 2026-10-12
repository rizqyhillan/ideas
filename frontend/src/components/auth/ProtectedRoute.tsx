import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "../icons/ideas-icon";

interface ProtectedRouteProps {
  requiredPermission?: string | string[];
}

export default function ProtectedRoute({ requiredPermission }: ProtectedRouteProps = {}) {
  const { isAuthenticated, isLoading, hasAnyPermission, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Memuat sesi...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  // Check required permission if specified
  if (requiredPermission) {
    const isAllowed = Array.isArray(requiredPermission)
      ? hasAnyPermission(...requiredPermission)
      : hasPermission(requiredPermission);

    if (!isAllowed) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
          <div className="w-16 h-16 mb-4 rounded-lg bg-error-50 text-error-500 dark:bg-error-500/10 flex items-center justify-center">
            <Icon name="shield-alert" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Akses Ditolak (403 Forbidden)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
            Akun peran Anda tidak memiliki hak akses (*permission*) untuk membuka modul ini. Silakan hubungi Administrator jika Anda memerlukan akses.
          </p>
          <Link
            to="/"
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors shadow-sm"
          >
            Kembali ke Dashboard Utama
          </Link>
        </div>
      );
    }
  }

  return <Outlet />;
}
