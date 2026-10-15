import { lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./layout/AppLayout";

// Halaman auth & error
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/AuthPages/NotFound";

// Dashboard per role (Lazy loaded)
const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard"));
const GuruDashboard = lazy(() => import("./pages/Dashboard/GuruDashboard"));
const SiswaDashboard = lazy(() => import("./pages/Dashboard/SiswaDashboard"));

// Halaman akademik (Lazy loaded)
const TahunAjaranPage = lazy(() => import("./pages/Academic/TahunAjaranPage"));
const SemesterPage = lazy(() => import("./pages/Academic/SemesterPage"));
const ClassesPage = lazy(() => import("./pages/Academic/ClassesPage"));
const AbsensiPage = lazy(() => import("./pages/Academic/AbsensiPage"));
const MataPelajaranPage = lazy(() => import("./pages/Academic/MataPelajaranPage"));
const JadwalPage = lazy(() => import("./pages/Academic/JadwalPage"));
const KonselingPage = lazy(() => import("./pages/Academic/KonselingPage"));

// Halaman master data (Lazy loaded)
const SiswaPage = lazy(() => import("./pages/Master/SiswaPage"));
const GuruPage = lazy(() => import("./pages/Master/GuruPage"));
const PegawaiPage = lazy(() => import("./pages/Master/PegawaiPage"));
const UsersPage = lazy(() => import("./pages/Master/UsersPage"));
const RolesPage = lazy(() => import("./pages/Master/RolesPage"));
const PermissionsPage = lazy(() => import("./pages/Master/PermissionsPage"));

// Halaman profil (Lazy loaded)
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman auth */}
        <Route path="/signin" element={<SignIn />} />

        {/* Halaman dilindungi */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Dashboard berdasarkan role */}
            <Route path="/" element={<RoleBasedDashboard />} />
            <Route
              path="/guru/dashboard"
              element={
                <RoleBasedDashboard role="guru">
                  <GuruDashboard />
                </RoleBasedDashboard>
              }
            />
            <Route
              path="/siswa/dashboard"
              element={
                <RoleBasedDashboard role="siswa">
                  <SiswaDashboard />
                </RoleBasedDashboard>
              }
            />

            {/* Halaman akademik */}
            <Route element={<AdminOnlyRoute />}>
              <Route path="/academic/tahun-ajaran" element={<TahunAjaranPage />} />
              <Route path="/academic/semester" element={<SemesterPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission={["classes.view", "kelas.list"]} />}>
              <Route path="/academic/classes" element={<ClassesPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission={["subjects.view", "guru.list"]} />}>
              <Route path="/academic/mata-pelajaran" element={<MataPelajaranPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission={["schedules.view", "jadwal.list"]} />}>
              <Route path="/academic/jadwal" element={<JadwalPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission={["student_attendance.view", "absensi.list", "laporan.absensi"]} />}>
              <Route path="/academic/absensi" element={<AbsensiPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission={["counseling.view", "counseling.view_own", "konseling.list", "siswa.list"]} />}>
              <Route path="/academic/konseling" element={<KonselingPage />} />
            </Route>

            {/* Halaman master data */}
            <Route element={<ProtectedRoute requiredPermission="students.view" />}>
              <Route path="/master/siswa" element={<SiswaPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="teachers.view" />}>
              <Route path="/master/guru" element={<GuruPage />} />
              <Route path="/master/pegawai" element={<PegawaiPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="users.view" />}>
              <Route path="/master/users" element={<UsersPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="roles.manage" />}>
              <Route path="/master/roles" element={<RolesPage />} />
              <Route path="/master/permissions" element={<PermissionsPage />} />
            </Route>

            {/* Halaman profil */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function RoleBasedDashboard({
  children,
  role,
}: {
  children?: React.ReactNode;
  role?: string;
}) {
  const { user } = useAuth();
  const userRoles = (user?.roles || []).map((r: any) =>
    typeof r === "string" ? r : r.code || r.name || "",
  );
  const isAdmin =
    userRoles.includes("admin") || userRoles.includes("super_admin");

  if (!role) {
    if (isAdmin) {
      return <AdminDashboard />;
    }
    if (userRoles.includes("guru") || userRoles.includes("guru_bk") || userRoles.includes("bk")) {
      return <GuruDashboard />;
    }
    if (userRoles.includes("siswa")) {
      return <SiswaDashboard />;
    }
    return <Navigate to="/signin" replace />;
  }

  if (!userRoles.includes(role) && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AdminOnlyRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const roles = (user?.roles || []).map((r: any) =>
    typeof r === "string" ? r : r.code || r.name || "",
  );

  if (isLoading) return <ProtectedRoute requiredPermission={["classes.view", "kelas.list"]} />;
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (!roles.includes("admin") && !roles.includes("super_admin")) {
    return <Navigate to="/" replace />;
  }
  return <ProtectedRoute requiredPermission={["classes.view", "kelas.list"]} />;
}
