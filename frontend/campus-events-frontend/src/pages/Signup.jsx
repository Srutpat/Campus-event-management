import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Zap, Check, ChevronRight, ChevronLeft } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   ALL CONSTANTS AND HELPER COMPONENTS ARE DEFINED *OUTSIDE* THE MAIN
   COMPONENT. If they were inside, React would recreate them on every
   re-render, unmount + remount the inputs, and destroy focus mid-typing.
───────────────────────────────────────────────────────────────────────── */

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Chemical Engineering",
  "Instrumentation Engineering",
  "Artificial Intelligence & Data Science",
  "First Year Engineering",
];

const CLUBS = {
  "Computer Science & Engineering":   ["CSI","GDSC","CodeChef Campus","Cybersecurity Club"],
  "Information Technology":           ["IT Association","Web Dev Club","Open Source Club"],
  "Electronics & Telecommunication":  ["IEEE","ISTE","Electronics Club"],
  "Mechanical Engineering":           ["MESA","SAE India","CAD/CAM Club"],
  "Civil Engineering":                ["Civil Association","Structural Club"],
  "Electrical Engineering":           ["IETE","Power Systems Club"],
  "First Year Engineering":           ["First Year Council"],
  "central":                          ["NSS","Cultural Committee","Sports Committee","NCC","Entrepreneurship Cell"],
};

const ALL_CLUBS = [...new Set(Object.values(CLUBS).flat())].sort();
const YEARS     = ["FE","SE","TE","BE"];
const DIVISIONS = ["A","B","C","D","E"];

const ROLES = [
  { value:"STUDENT",         label:"Student",            desc:"Register for events, track registrations",   emoji:"🎓" },
  { value:"ORGANIZER",       label:"Event Organizer",    desc:"Create and manage club events",              emoji:"🎯" },
  { value:"FACULTY_ADVISOR", label:"Faculty Advisor",    desc:"Review and approve event proposals",         emoji:"👨‍🏫" },
  { value:"SDW_COORDINATOR", label:"SDW Coordinator",    desc:"Budget review and HoD forwarding",           emoji:"📋" },
  { value:"HOD",             label:"Head of Department", desc:"Final event approval authority",             emoji:"👑" },
];

/* ── Shared field UI ────────────────────────────────────────────── */
function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ label, required, id, ...rest }) {
  return (
    <div>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <input id={id} required={required} {...rest}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white
          focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          transition-all placeholder-slate-400" />
    </div>
  );
}

function DropDown({ label, required, options, placeholder, id, ...rest }) {
  return (
    <div>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <select id={id} required={required} {...rest}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white
          focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          transition-all appearance-none cursor-pointer">
        <option value="">{placeholder || "Select…"}</option>
        {options.map(o => {
          const val = typeof o === "string" ? o : o.value;
          const lbl = typeof o === "string" ? o : o.label;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
    </div>
  );
}

/* ── Step dot indicator ─────────────────────────────────────────── */
function StepDots({ total, current }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`transition-all duration-300 rounded-full
          ${i === current ? "w-6 h-2 bg-indigo-500"
          : i < current   ? "w-2 h-2 bg-indigo-300"
          :                  "w-2 h-2 bg-slate-200"}`}/>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STEP COMPONENTS — defined at module level, NOT inside Signup().
   This is the critical fix. React sees these as stable component
   references across renders, so it never unmounts/remounts inputs.
══════════════════════════════════════════════════════════════════ */

/* Step 0 — Role selector */
function RoleStep({ role, onRoleChange }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-1">Who are you?</h2>
      <p className="text-slate-400 text-sm mb-5">Select your role to get started</p>
      <div className="space-y-3">
        {ROLES.map(r => (
          <button key={r.value} type="button"
            onClick={() => onRoleChange(r.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
              ${role === r.value
                ? "border-indigo-500 bg-indigo-50 shadow-md"
                : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"}`}>
            <span className="text-2xl">{r.emoji}</span>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${role === r.value ? "text-indigo-700" : "text-slate-800"}`}>
                {r.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
            </div>
            {role === r.value && (
              <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                <Check size={12} className="text-white"/>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Step 1 — Common fields (name, email, password, mobile) */
function CommonStep({ form, setField }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Your Details</h2>
        <p className="text-slate-400 text-sm mb-4">Basic information for your account</p>
      </div>

      <TextInput
        id="sig-name"
        label="Full Name"
        required
        placeholder="e.g. Shraddha Patil"
        value={form.name || ""}
        onChange={setField("name")}
      />
      <TextInput
        id="sig-email"
        label="Email Address"
        type="email"
        required
        placeholder="you@college.edu"
        value={form.email || ""}
        onChange={setField("email")}
      />
      <TextInput
        id="sig-pass"
        label="Password"
        type="password"
        required
        minLength={6}
        placeholder="Min 6 characters"
        value={form.password || ""}
        onChange={setField("password")}
      />
      <TextInput
        id="sig-mob"
        label="Mobile Number"
        type="tel"
        required
        placeholder="10-digit mobile number"
        value={form.mobileNumber || ""}
        onChange={setField("mobileNumber")}
      />
    </div>
  );
}

/* Step 2 — Student specific */
function StudentStep({ form, setField }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Student Info</h2>
        <p className="text-slate-400 text-sm mb-4">Your academic details</p>
      </div>
      <TextInput
        id="sig-prn"
        label="PRN (Permanent Registration Number)"
        required
        placeholder="e.g. 1234567890"
        value={form.prn || ""}
        onChange={setField("prn")}
      />
      <DropDown
        id="sig-dept"
        label="Department"
        required
        placeholder="Select your department"
        options={DEPARTMENTS}
        value={form.department || ""}
        onChange={setField("department")}
      />
      <div className="grid grid-cols-2 gap-3">
        <DropDown
          id="sig-year"
          label="Year"
          required
          placeholder="Select year"
          options={YEARS}
          value={form.year || ""}
          onChange={setField("year")}
        />
        <DropDown
          id="sig-div"
          label="Division"
          required
          placeholder="Division"
          options={DIVISIONS}
          value={form.division || ""}
          onChange={setField("division")}
        />
      </div>
    </div>
  );
}

/* Step 2 — Organizer specific */
function OrganizerStep({ form, setField, setMulti }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Organizer Info</h2>
        <p className="text-slate-400 text-sm mb-4">Your club and department details</p>
      </div>
      <DropDown
        id="sig-orgdept"
        label="Your Department"
        required
        placeholder="Select your department"
        options={DEPARTMENTS}
        value={form.department || ""}
        onChange={setField("department")}
      />
      <div>
        <FieldLabel required>Club Type</FieldLabel>
        <div className="flex gap-2">
          {[
            { val:"department", label:"🏢 Department Club" },
            { val:"central",    label:"🏫 Central Level Club" },
          ].map(opt => (
            <button key={opt.val} type="button"
              onClick={() => setMulti({ _clubType: opt.val, clubDepartment: opt.val === "central" ? "central" : "", clubName: "" })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all
                ${form._clubType === opt.val
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {form._clubType === "central" && (
        <DropDown
          id="sig-cclub"
          label="Club Name"
          required
          placeholder="Select central club"
          options={CLUBS.central}
          value={form.clubName || ""}
          onChange={e => setMulti({ clubName: e.target.value, clubDepartment: "central" })}
        />
      )}

      {form._clubType === "department" && (
        <>
          <DropDown
            id="sig-clubdept"
            label="Club's Department"
            required
            placeholder="Select club's department"
            options={DEPARTMENTS}
            value={form.clubDepartment || ""}
            onChange={e => setMulti({ clubDepartment: e.target.value, clubName: "" })}
          />
          {form.clubDepartment && (
            <DropDown
              id="sig-dclub"
              label="Club Name"
              required
              placeholder="Select club"
              options={[...(CLUBS[form.clubDepartment] || []), "Other"]}
              value={form.clubName || ""}
              onChange={setField("clubName")}
            />
          )}
          {form.clubName === "Other" && (
            <TextInput
              id="sig-customclub"
              label="Enter Club Name"
              required
              placeholder="Type your club name"
              value={form._customClub || ""}
              onChange={e => setMulti({ _customClub: e.target.value, clubName: e.target.value })}
            />
          )}
        </>
      )}

      {!form._clubType && (
        <p className="text-xs text-amber-500">↑ Please select club type first</p>
      )}
    </div>
  );
}

/* Step 2 — Faculty Advisor specific */
function FacultyStep({ form, setField, setMulti }) {
  const selected = (form.clubNames || "").split(",").map(c => c.trim()).filter(Boolean);

  const toggleClub = (club, checked) => {
    const updated = checked
      ? [...selected, club]
      : selected.filter(c => c !== club);
    setMulti({ clubNames: updated.join(", ") });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Faculty Info</h2>
        <p className="text-slate-400 text-sm mb-4">Your department and club advisory details</p>
      </div>
      <DropDown
        id="sig-facdept"
        label="Department"
        required
        placeholder="Select your department"
        options={DEPARTMENTS}
        value={form.department || ""}
        onChange={setField("department")}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          id="sig-subj"
          label="Subject"
          required
          placeholder="e.g. Data Structures"
          value={form.subject || ""}
          onChange={setField("subject")}
        />
        <TextInput
          id="sig-spec"
          label="Specialization"
          required
          placeholder="e.g. AI/ML"
          value={form.specialization || ""}
          onChange={setField("specialization")}
        />
      </div>
      <div>
        <FieldLabel required>Club(s) you advise</FieldLabel>
        <p className="text-xs text-slate-400 mb-2">Tick all clubs you are faculty advisor for</p>
        <div className="space-y-1 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2">
          {ALL_CLUBS.map(club => (
            <label key={club}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={selected.includes(club)}
                onChange={e => toggleClub(club, e.target.checked)}
                className="rounded border-slate-300 accent-indigo-500"
              />
              <span className="text-sm text-slate-700">{club}</span>
            </label>
          ))}
        </div>
        {form.clubNames && (
          <p className="text-xs text-indigo-600 mt-1.5 font-medium">
            ✓ Selected: {form.clubNames}
          </p>
        )}
      </div>
    </div>
  );
}

/* Step 2 — SDW Coordinator specific */
function SDWStep({ form, setField }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">SDW Coordinator Info</h2>
        <p className="text-slate-400 text-sm mb-4">Your role in the student welfare division</p>
      </div>
      <div>
        <FieldLabel>Department</FieldLabel>
        <p className="text-xs text-amber-600 mb-2 font-medium bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          ⚠ Leave blank if you are the <strong>SDW Dean</strong> — you will see ALL
          departments including central events (NSS etc.)
        </p>
        <DropDown
          id="sig-sdwdept"
          placeholder="Leave blank if SDW Dean / Overall coordinator"
          options={DEPARTMENTS}
          value={form.department || ""}
          onChange={setField("department")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          id="sig-sdwsubj"
          label="Subject"
          required
          placeholder="e.g. Management"
          value={form.subject || ""}
          onChange={setField("subject")}
        />
        <TextInput
          id="sig-sdwspec"
          label="Specialization"
          required
          placeholder="e.g. Event Mgmt"
          value={form.specialization || ""}
          onChange={setField("specialization")}
        />
      </div>
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700 space-y-1">
        <p><strong>Dept SDW Coordinator:</strong> Select your department above — you see only that dept's events.</p>
        <p><strong>SDW Dean:</strong> Leave department blank — you see all events including central (NSS, NCC etc).</p>
      </div>
    </div>
  );
}

/* Step 2 — HoD specific */
function HoDStep({ form, setField }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Head of Department Info</h2>
        <p className="text-slate-400 text-sm mb-4">Final approval authority for your department</p>
      </div>
      <DropDown
        id="sig-hoddept"
        label="Department"
        required
        placeholder="Select your department"
        options={DEPARTMENTS}
        value={form.department || ""}
        onChange={setField("department")}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          id="sig-hodsubj"
          label="Subject"
          required
          placeholder="e.g. Computer Networks"
          value={form.subject || ""}
          onChange={setField("subject")}
        />
        <TextInput
          id="sig-hodspec"
          label="Specialization"
          required
          placeholder="e.g. Systems"
          value={form.specialization || ""}
          onChange={setField("specialization")}
        />
      </div>
      <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700">
        You are the final approval authority. Events in your department require
        your sign-off before going live to students.
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT — only state + submit logic here, no JSX helpers
══════════════════════════════════════════════════════════════════ */
export default function Signup() {
  const navigate = useNavigate();

  const [step,    setStep]    = useState(0);
  const [role,    setRole]    = useState("");
  const [form,    setForm]    = useState({});
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  /* Single-field updater — stable reference, no recreation on every render */
  const setField = (key) => {
  return (e) => {
    const value = e.target.value;

    setForm(prev => {
      // 🔥 prevent unnecessary re-render (THIS fixes cursor jump)
      if (prev[key] === value) return prev;

      return { ...prev, [key]: value };
    });
  };
};

  /* Multi-field updater for buttons/checkboxes */
  const setMulti = (fields) => {
    setForm(prev => ({ ...prev, ...fields }));
  };

  const canProceed = () => {
    if (step === 0) return !!role;
    if (step === 1) return !!(form.name && form.email && form.password && form.mobileNumber);
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");

    if (role === "STUDENT" && (!form.prn || !form.department || !form.year)) {
      setError("PRN, Department and Year are required."); setLoading(false); return;
    }
    if (role === "ORGANIZER" && (!form.clubName || !form.clubDepartment)) {
      setError("Club name and club department are required."); setLoading(false); return;
    }
    if (role === "FACULTY_ADVISOR" && (!form.department || !form.clubNames || !form.subject)) {
      setError("Department, Subject and at least one Club are required."); setLoading(false); return;
    }
    if ((role === "SDW_COORDINATOR" || role === "HOD") && !form.subject) {
      setError("Subject and Specialization are required."); setLoading(false); return;
    }
    if (role === "HOD" && !form.department) {
      setError("Department is required for HoD."); setLoading(false); return;
    }

    try {
      await api.post("/auth/signup", { ...form, role });
      navigate("/login", { state: { message: "Account created! Please sign in." } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || "Signup failed. Please try again.");
    } finally { setLoading(false); }
  };

  const renderStep = () => {
    if (step === 0) return <RoleStep role={role} onRoleChange={r => { setRole(r); setError(""); }} />;
    if (step === 1) return <CommonStep form={form} setField={setField} />;
    if (step === 2) {
      if (role === "STUDENT")         return <StudentStep   form={form} setField={setField} setMulti={setMulti} />;
      if (role === "ORGANIZER")       return <OrganizerStep form={form} setField={setField} setMulti={setMulti} />;
      if (role === "FACULTY_ADVISOR") return <FacultyStep   form={form} setField={setField} setMulti={setMulti} />;
      if (role === "SDW_COORDINATOR") return <SDWStep       form={form} setField={setField} />;
      if (role === "HOD")             return <HoDStep       form={form} setField={setField} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background:"linear-gradient(135deg,#f0f2f8 0%,#e8e4f8 100%)" }}>

      <div className="w-full max-w-lg">

        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <Zap size={18} className="text-white"/>
          </div>
          <span className="font-bold text-2xl text-slate-800 tracking-tight"
            style={{ fontFamily:"'Outfit',sans-serif" }}>EventPulse</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          <div className="px-7 pt-7 pb-2">
            <StepDots total={3} current={step}/>
            <p className="text-xs text-slate-400 text-center mb-4">
              Step {step + 1} of 3
            </p>
          </div>

          <div className="px-7 pb-7">
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Render the current step */}
            {renderStep()}

            {/* Nav buttons */}
            <div className="flex gap-3 mt-7">
              {step > 0 && (
                <button type="button"
                  onClick={() => { setStep(s => s - 1); setError(""); }}
                  className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-slate-200
                    bg-white text-slate-600 font-semibold text-sm hover:border-slate-300 transition-all">
                  <ChevronLeft size={16}/> Back
                </button>
              )}

              {step < 2 ? (
                <button type="button"
                  disabled={!canProceed()}
                  onClick={() => { if (canProceed()) { setStep(s => s + 1); setError(""); } }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl
                    font-semibold text-sm text-white transition-all
                    disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
                  Next <ChevronRight size={16}/>
                </button>
              ) : (
                <button type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                    font-semibold text-sm text-white transition-all disabled:opacity-50"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> Creating…</>
                    : <><Check size={16}/> Create Account</>}
                </button>
              )}
            </div>

            <p className="text-center text-sm text-slate-400 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}