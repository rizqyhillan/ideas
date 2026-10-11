import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/AuthPages/NotFound";

// Dashboard per role
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import GuruDashboard from "./pages/Dashboard/GuruDashboard";
import SiswaDashboard from "./pages/Dashboard/SiswaDashboard";

// Halaman akademik
import TahunAjaranPage from "./pages/Academic/TahunAjaranPage";
import SemesterPage from "./pages/Academic/SemesterPage";
import ClassesPage from "./pages/Academic/ClassesPage";
import AbsensiPage from "./pages/Academic/AbsensiPage";
import MataPelajaranPage from "./pages/Academic/MataPelajaranPage";
import JadwalPage from "./pages/Academic/JadwalPage";
import KonselingPage from "./pages/Academic/KonselingPage";

// Halaman master data
import SiswaPage from "./pages/Master/SiswaPage";
import GuruPage from "./pages/Master/GuruPage";
import PegawaiPage from "./pages/Master/PegawaiPage";
import UsersPage from "./pages/Master/UsersPage";
import RolesPage from "./pages/Master/RolesPage";
import PermissionsPage from "./pages/Master/PermissionsPage";

// Halaman profil
import ProfilePage from "./pages/ProfilePage";

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
            <Route
              path="/"
              element={
                <RoleBasedDashboard>
                  <AdminDashboard />
                </RoleBasedDashboard>
              }
            />
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
            <Route element={<ProtectedRoute requiredPermission={["classes.view", "classes.create"]} />}>
              <Route path="/academic/tahun-ajaran" element={<TahunAjaranPage />} />
              <Route path="/academic/semester" element={<SemesterPage />} />
              <Route path="/academic/classes" element={<ClassesPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="subjects.view" />}>
              <Route path="/academic/mata-pelajaran" element={<MataPelajaranPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="schedules.view" />}>
              <Route path="/academic/jadwal" element={<JadwalPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission={["student_attendance.view", "student_attendance.view_own", "duty_attendance.view", "duty_attendance.view_own"]} />}>
              <Route path="/academic/absensi" element={<AbsensiPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission={["counseling.view", "counseling.view_own"]} />}>
              <Route path="/academic/konseling" element={<KonselingPage />} />
            </Route>

            {/* Halaman master data */}
            <Route element={<ProtectedRoute requiredPermission={["students.view", "students.view_own"]} />}>
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
  children: React.ReactNode;
  role?: string;
}) {
  const { user } = useAuth();
  const userRoles = user?.roles || [];
  const targetRole = role || "admin";

  if (!userRoles.includes(targetRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
