import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Academic & Master Data Pages
import TahunAjaranPage from "./pages/Academic/TahunAjaranPage";
import ClassesPage from "./pages/Academic/ClassesPage";
import SiswaPage from "./pages/Master/SiswaPage";
import GuruPage from "./pages/Master/GuruPage";
import PegawaiPage from "./pages/Master/PegawaiPage";
import UsersPage from "./pages/Master/UsersPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Protected Dashboard & App Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              {/* Akademik Routes */}
              <Route
                path="/academic/tahun-ajaran"
                element={<TahunAjaranPage />}
              />
              <Route path="/academic/classes" element={<ClassesPage />} />

              {/* Master Data Routes */}
              <Route path="/master/siswa" element={<SiswaPage />} />
              <Route path="/master/guru" element={<GuruPage />} />
              <Route path="/master/pegawai" element={<PegawaiPage />} />
              <Route path="/master/users" element={<UsersPage />} />

              {/* Utility Pages */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />
            </Route>
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
