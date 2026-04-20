import { Check, X, Clock, Circle } from "lucide-react";
import { STATUS_META } from "../constants";

// 4 steps in the pipeline matching our 5 statuses
const STEPS = [
  { key:"PENDING_FACULTY", label:"Faculty"  },
  { key:"PENDING_SDW",     label:"SDW"      },
  { key:"PENDING_HOD",     label:"HoD"      },
  { key:"APPROVED",        label:"Live ✓"   },
];

function stepState(stepIdx, status) {
  if (status === "APPROVED")  return stepIdx <= 3 ? "done" : "pending";
  if (status === "REJECTED")  return "pending"; // handled separately below

  // Which step index is currently active (waiting)
  const activeAt = {
    PENDING_FACULTY: 0,
    PENDING_SDW:     1,
    PENDING_HOD:     2,
  };
  // Steps before the active one are done
  const doneUpTo = {
    PENDING_FACULTY: -1,
    PENDING_SDW:      0,
    PENDING_HOD:      1,
  };

  const active = activeAt[status] ?? -1;
  const done   = doneUpTo[status] ?? -1;

  if (stepIdx <= done)    return "done";
  if (stepIdx === active) return "active";
  return "pending";
}

export default function WorkFlowBadge({ status }) {
  const meta      = STATUS_META[status] || { label: status, color: "badge-gray" };
  const isRejected = status === "REJECTED";

  return (
    <div className="w-full">
      {isRejected ? (
        // Rejected — show a single red banner instead of pipeline
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
          <X size={14} className="text-red-500 shrink-0"/>
          <span className="text-xs font-semibold text-red-600">
            Rejected — organizer must edit and resubmit
          </span>
        </div>
      ) : (
        <div className="flex items-center">
          {STEPS.map((step, i) => {
            const state = stepState(i, status);
            return (
              <div key={step.key}
                className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${state === "done"   ? "bg-indigo-500 shadow-sm shadow-indigo-200"
                    : state === "active" ? "bg-amber-400 shadow-sm shadow-amber-200 animate-pulse"
                    :                      "bg-slate-200"}`}>
                    {state === "done"   ? <Check size={11} className="text-white"/>
                    : state === "active"? <Clock size={10} className="text-white"/>
                    :                     <Circle size={8} className="text-slate-400"/>}
                  </div>
                  <span className={`text-[9px] mt-1 whitespace-nowrap font-medium
                    ${state === "done"   ? "text-indigo-600"
                    : state === "active" ? "text-amber-600"
                    :                      "text-slate-400"}`}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 mx-1 transition-all duration-500
                    ${state === "done" ? "bg-indigo-400" : "bg-slate-200"}`}/>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}