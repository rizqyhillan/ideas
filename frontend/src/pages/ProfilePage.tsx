import { useAuth } from "../context/AuthContext";
import PageBreadcrumb from "../components/common/PageBreadCrumb";

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <>
      <PageBreadcrumb pageTitle="Profil Saya" />
      <div className="max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-brand-500 text-white flex items-center justify-center text-2xl font-bold">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {user.namaLengkap || user.username}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Informasi Akun</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Username</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{user.username}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="font-medium">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.status === "aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {user.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Peran</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {user.roles?.map((r: any) => r.name || r.code).join(", ") || "Tidak ada"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>
    </>
  );
}
