import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login    from "./pages/Login";
import Signup   from "./pages/Signup";

import StudentDashboard     from "./pages/student/StudentDashboard";
import StudentEvents        from "./pages/student/StudentEvents";
import StudentRegistrations from "./pages/student/StudentRegistrations";

import OrganizerDashboard    from "./pages/organizer/OrganizerDashboard";
import CreateEvent           from "./pages/organizer/CreateEvent";
import OrganizerParticipants from "./pages/organizer/Organizerparticipants";
import SubmitBudget          from "./pages/organizer/SubmitBudget";
import PostEventReport       from "./pages/organizer/PostEventReport";

import FacultyDashboard  from "./pages/faculty/FacultyDashboard";
import FacultyApprovals  from "./pages/faculty/FacultyApprovals";
import FacultyReports    from "./pages/faculty/FacultyReports";

import SDWDashboard  from "./pages/sdw/SDWDashboard";
import SDWApprovals  from "./pages/sdw/SDWApprovals";

import HoDDashboard  from "./pages/hod/HoDDashboard";
import HoDApprovals  from "./pages/hod/HoDApprovals";

import Analytics from "./pages/analytics/Analytics";

function Guard({ user, roles, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role?.toUpperCase().trim())) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  });

  const login  = (u) => { localStorage.setItem("user", JSON.stringify(u)); setUser(u); };
  const logout = ()  => { localStorage.removeItem("user"); setUser(null); };

  const S   = ["STUDENT"];
  const O   = ["ORGANIZER"];
  const FA  = ["FACULTY_ADVISOR"];
  const SW  = ["SDW_COORDINATOR"];
  const H   = ["HOD"];

  const wrap = (roles, el) => <Guard user={user} roles={roles}>{el}</Guard>;

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC — home page shows live events without login */}
        <Route path="/"       element={<HomePage />} />
        <Route path="/login"  element={<Login  onLogin={login} />} />
        <Route path="/signup" element={<Signup />} />

        {/* Student */}
        <Route path="/student"               element={wrap(S,  <StudentDashboard     onLogout={logout}/>)}/>
        <Route path="/student/events"        element={wrap(S,  <StudentEvents        onLogout={logout}/>)}/>
        <Route path="/student/registrations" element={wrap(S,  <StudentRegistrations onLogout={logout}/>)}/>

        {/* Organizer */}
        <Route path="/organizer"              element={wrap(O,  <OrganizerDashboard    onLogout={logout}/>)}/>
        <Route path="/organizer/create"       element={wrap(O,  <CreateEvent           onLogout={logout}/>)}/>
        <Route path="/organizer/edit/:id"     element={wrap(O,  <CreateEvent           onLogout={logout}/>)}/>
        <Route path="/organizer/participants" element={wrap(O,  <OrganizerParticipants onLogout={logout}/>)}/>
        <Route path="/organizer/budget/:id"   element={wrap(O,  <SubmitBudget          onLogout={logout}/>)}/>
        <Route path="/organizer/report/:id"   element={wrap(O,  <PostEventReport       onLogout={logout}/>)}/>

        {/* Faculty Advisor */}
        <Route path="/faculty"           element={wrap(FA, <FacultyDashboard onLogout={logout}/>)}/>
        <Route path="/faculty/approvals" element={wrap(FA, <FacultyApprovals onLogout={logout}/>)}/>
        <Route path="/faculty/reports"   element={wrap(FA, <FacultyReports   onLogout={logout}/>)}/>

        {/* SDW */}
        <Route path="/sdw"           element={wrap(SW, <SDWDashboard onLogout={logout}/>)}/>
        <Route path="/sdw/approvals" element={wrap(SW, <SDWApprovals onLogout={logout}/>)}/>

        {/* HoD */}
        <Route path="/hod"           element={wrap(H,  <HoDDashboard onLogout={logout}/>)}/>
        <Route path="/hod/approvals" element={wrap(H,  <HoDApprovals onLogout={logout}/>)}/>

        {/* Analytics — staff only */}
        <Route path="/analytics" element={wrap(
          ["ORGANIZER","FACULTY_ADVISOR","SDW_COORDINATOR","HOD"],
          <Analytics onLogout={logout}/>
        )}/>

        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </BrowserRouter>
  );
}
