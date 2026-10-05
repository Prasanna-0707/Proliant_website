import { useState } from "react";
import {
  UsersRound,
  Minus,
  Plus,
  Save,
  Info,
} from "lucide-react";

function EmployeesTemp() {
  const [employeeCount, setEmployeeCount] = useState(101);
  const [savedCount, setSavedCount] = useState(101);
  const [message, setMessage] = useState("");

  const decreaseCount = () => {
    setEmployeeCount((count) => Math.max(0, (Number(count) || 0) - 1));
    setMessage("");
  };

  const increaseCount = () => {
    setEmployeeCount((count) => (Number(count) || 0) + 1);
    setMessage("");
  };

  const handleSave = () => {
    if (
      employeeCount === "" ||
      !Number.isInteger(Number(employeeCount)) ||
      Number(employeeCount) < 0
    ) {
      setMessage("Please enter a valid employee count.");
      return;
    }

    const count = Number(employeeCount);

    localStorage.setItem("proliantEmployeeCount", String(count));
    setEmployeeCount(count);
    setSavedCount(count);
    setMessage("Employee count saved successfully.");
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 text-gray-900 sm:p-6 lg:p-8">
      <div className="relative mx-auto min-h-[650px] max-w-[1500px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        {/* Bottom-right decorative icon */}
        <div className="pointer-events-none absolute bottom-8 right-10 hidden opacity-30 sm:block">
          <UsersRound size={150} strokeWidth={1.5} />
        </div>

        {/* Main content */}
        <div className="relative z-10 p-5 sm:p-8 lg:p-12">
          {/* Heading */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 shadow-sm">
              <UsersRound size={42} strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                Employees <span className="text-red-600">Count</span>
              </h1>

              <p className="mt-3 text-base text-gray-500 sm:text-lg">
                Set the total number of employees for Proliant.
              </p>
            </div>
          </div>

          {/* Counter */}
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="text-center">
              <h2 className="text-sm font-bold tracking-[0.25em] text-gray-600 sm:text-base">
                TOTAL EMPLOYEES
              </h2>

              <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-red-600" />
            </div>

            <div className="mt-6 grid grid-cols-[1fr_1.2fr_1fr] items-stretch overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-[0_12px_35px_rgba(239,59,58,0.18)]">
              {/* Decrease button */}
              <button
                type="button"
                onClick={decreaseCount}
                disabled={Number(employeeCount) === 0}
                aria-label="Decrease employee count"
                className="m-2 flex min-h-28 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-36"
              >
                <Minus size={48} strokeWidth={3} />
              </button>

              {/* Editable number */}
              <div className="flex min-w-0 items-center justify-center border-x border-gray-200 px-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={employeeCount}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "") {
                      setEmployeeCount("");
                      setMessage("");
                    } else if (/^\d+$/.test(value)) {
                      setEmployeeCount(Number(value));
                      setMessage("");
                    }
                  }}
                  onBlur={() => {
                    if (
                      employeeCount === "" ||
                      !Number.isInteger(Number(employeeCount))
                    ) {
                      setEmployeeCount(0);
                    } else {
                      setEmployeeCount(Math.max(0, Number(employeeCount)));
                    }
                  }}
                  aria-label="Employee count"
                  className="employee-count-input w-full min-w-0 appearance-none border-0 bg-transparent p-0 text-center !text-[80px] !font-black !leading-none tracking-tight text-gray-900 outline-none focus:border-0 focus:outline-none focus:ring-0"
                />
              </div>

              {/* Increase button */}
              <button
                type="button"
                onClick={increaseCount}
                aria-label="Increase employee count"
                className="m-2 flex min-h-28 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition hover:bg-red-100 sm:min-h-36"
              >
                <Plus size={48} strokeWidth={3} />
              </button>
            </div>

            <p className="mt-5 text-center text-sm text-gray-500 sm:text-base">
              Use the + and − buttons to adjust the total number of employees.
            </p>

            {/* Information panel */}
            <div className="mt-7 flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50/90 p-4 sm:p-5">
              <Info size={34} className="shrink-0 text-red-600" />

              <div className="border-l-2 border-red-200 pl-4">
                <p className="font-bold text-red-600">
                  Minimum: 0 employees
                </p>

                <p className="mt-1 text-sm text-gray-500 sm:text-base">
                  Update the count and click save to apply changes.
                </p>
              </div>
            </div>

            {/* Save button */}
            <div className="mt-8 flex flex-col items-center">
              <button
                type="button"
                onClick={handleSave}
                disabled={
                  employeeCount === "" ||
                  Number(employeeCount) === savedCount
                }
                className="flex w-full max-w-sm items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-4 text-base font-bold text-white shadow-[0_8px_20px_rgba(239,59,58,0.3)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
              >
                <Save size={24} />
                Save Employee Count
              </button>

              {message && (
                <p
                  role="status"
                  className={`mt-4 text-center text-sm font-medium ${
                    message.includes("successfully")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hide browser number input arrows */}
      <style>{`
        .employee-count-input::-webkit-inner-spin-button,
        .employee-count-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .employee-count-input {
          -moz-appearance: textfield;
          appearance: textfield;
        }
      `}</style>
    </div>
  );
}

export default EmployeesTemp;
