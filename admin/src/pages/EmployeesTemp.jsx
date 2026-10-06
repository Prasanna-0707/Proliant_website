import { useEffect, useState } from "react";
import {
  UsersRound,
  Minus,
  Plus,
  Save,
  Info,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

function EmployeesTemp() {
  const [employeeCount, setEmployeeCount] =
    useState(0);

  const [savedCount, setSavedCount] =
    useState(0);

  const [message, setMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  /*
   * =========================================================
   * AUTH HELPERS
   * =========================================================
   */

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("adminToken");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    window.location.href = "/login";
  };

  /*
   * =========================================================
   * FETCH EMPLOYEE COUNT
   * =========================================================
   */

  const fetchEmployeeCount = async () => {
    const token =
      localStorage.getItem("adminToken");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/settings/employee-count`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to load employee count."
        );
      }

      const count = Number(
        result.employeeCount
      );

      setEmployeeCount(count);
      setSavedCount(count);
    } catch (error) {
      console.error(
        "Failed to fetch employee count:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load employee count. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * =========================================================
   * LOAD EMPLOYEE COUNT
   * =========================================================
   */

  useEffect(() => {
    fetchEmployeeCount();
  }, []);

  /*
   * =========================================================
   * DECREASE COUNT
   * =========================================================
   */

  const decreaseCount = () => {
    setEmployeeCount((count) =>
      Math.max(
        0,
        (Number(count) || 0) - 1
      )
    );

    setMessage("");
  };

  /*
   * =========================================================
   * INCREASE COUNT
   * =========================================================
   */

  const increaseCount = () => {
    setEmployeeCount(
      (count) =>
        (Number(count) || 0) + 1
    );

    setMessage("");
  };

  /*
   * =========================================================
   * SAVE COUNT
   * =========================================================
   */

  const handleSave = async () => {
    if (
      employeeCount === "" ||
      !Number.isInteger(
        Number(employeeCount)
      ) ||
      Number(employeeCount) < 0
    ) {
      setMessage(
        "Please enter a valid employee count."
      );

      return;
    }

    const token =
      localStorage.getItem("adminToken");

    if (!token) {
      handleUnauthorized();
      return;
    }

    const count =
      Number(employeeCount);

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/settings/employee-count`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            employeeCount: count,
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to update employee count."
        );
      }

      const updatedCount =
        Number(result.employeeCount);

      setEmployeeCount(updatedCount);
      setSavedCount(updatedCount);

      setMessage(
        "Employee count saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update employee count:",
        error
      );

      setMessage(
        error.message ||
          "Unable to save employee count. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <div
      className="
        relative
        p-5
        text-gray-900
        transition-colors
        dark:text-gray-100

        bg-gray-100
        dark:bg-gray-950

        sm:p-6
      "
    >
      {/* =====================================================
          PAGE HEADER
          Same structure/size as Employees page.
      ====================================================== */}

      <div className="mb-6">
        <h1
          className="
            text-2xl
            font-bold
            tracking-tight
            text-gray-900

            dark:text-white
          "
        >
          Employees{" "}
          <span className="text-[#EF3B3A]">
            Count
          </span>
        </h1>

        <p
          className="
            mt-1
            text-sm
            text-gray-500

            dark:text-gray-400
          "
        >
          Set the total number of
          employees for Proliant.
        </p>
      </div>

      {/* =====================================================
          MAIN RECTANGULAR CARD

          Height adjusted because the page heading
          is now outside the rectangle.
      ====================================================== */}

      <div
        className="
          relative
          h-[calc(100vh-248px)]
          w-full
          overflow-hidden
          rounded-xl
          border
          border-gray-200
          bg-white
          shadow-sm
          transition-colors

          dark:border-gray-800
          dark:bg-gray-900
        "
      >
        {/* ===================================================
            DECORATIVE BOTTOM-RIGHT ICON
        ==================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-6
            right-8
            hidden
            text-gray-900
            opacity-[0.06]

            dark:text-white
            dark:opacity-[0.05]

            sm:block
          "
        >
          <UsersRound
            size={95}
            strokeWidth={1.5}
          />
        </div>

        {/* ===================================================
            CARD CONTENT
        ==================================================== */}

        <div
          className="
            relative
            z-10
            p-5
            sm:p-6
          "
        >
          {/* =================================================
              COUNTER AREA
          ================================================== */}

          <div
            className="
              mx-auto
              mt-10
              max-w-xl
            "
          >
            {/* Counter Heading */}

            <div className="text-center">
              <h2
                className="
                  text-xs
                  font-bold
                  tracking-[0.2em]
                  text-gray-500

                  dark:text-gray-400

                  sm:text-sm
                "
              >
                TOTAL EMPLOYEES
              </h2>

              <div
                className="
                  mx-auto
                  mt-3
                  h-0.5
                  w-10
                  rounded-full
                  bg-[#EF3B3A]
                "
              />
            </div>

            {/* =================================================
                COUNTER
            ================================================== */}

            <div
              className="
                mt-5
                grid
                grid-cols-[1fr_1.2fr_1fr]
                items-stretch
                overflow-hidden
                rounded-2xl
                border
                border-red-100
                bg-white
                shadow-[0_8px_25px_rgba(239,59,58,0.12)]
                transition-colors

                dark:border-red-900/40
                dark:bg-gray-900
              "
            >
              {/* Decrease */}

              <button
                type="button"
                onClick={decreaseCount}
                disabled={
                  isLoading ||
                  isSaving ||
                  Number(employeeCount) ===
                    0
                }
                aria-label="Decrease employee count"
                className="
                  m-2
                  flex
                  min-h-20
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-50
                  text-[#EF3B3A]
                  transition-colors
                  hover:bg-red-100
                  disabled:cursor-not-allowed
                  disabled:opacity-40

                  dark:bg-red-950/30
                  dark:hover:bg-red-950/50

                  sm:min-h-24
                "
              >
                <Minus
                  size={30}
                  strokeWidth={2.5}
                />
              </button>

              {/* Number */}

              <div
                className="
                  flex
                  min-w-0
                  items-center
                  justify-center
                  border-x
                  border-gray-200
                  px-2

                  dark:border-gray-700
                "
              >
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    isLoading
                      ? ""
                      : employeeCount
                  }
                  disabled={
                    isLoading ||
                    isSaving
                  }
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    if (value === "") {
                      setEmployeeCount("");
                      setMessage("");
                    } else if (
                      /^\d+$/.test(
                        value
                      )
                    ) {
                      setEmployeeCount(
                        Number(value)
                      );

                      setMessage("");
                    }
                  }}
                  onBlur={() => {
                    if (
                      employeeCount ===
                        "" ||
                      !Number.isInteger(
                        Number(
                          employeeCount
                        )
                      )
                    ) {
                      setEmployeeCount(0);
                    } else {
                      setEmployeeCount(
                        Math.max(
                          0,
                          Number(
                            employeeCount
                          )
                        )
                      );
                    }
                  }}
                  aria-label="Employee count"
                  className="
                    employee-count-input
                    w-full
                    min-w-0
                    appearance-none
                    border-0
                    bg-transparent
                    p-0
                    text-center
                    !text-[52px]
                    !font-bold
                    !leading-none
                    tracking-tight
                    text-gray-900
                    outline-none
                    focus:border-0
                    focus:outline-none
                    focus:ring-0
                    disabled:cursor-not-allowed
                    disabled:opacity-60

                    dark:text-white

                    sm:!text-[58px]
                  "
                />
              </div>

              {/* Increase */}

              <button
                type="button"
                onClick={increaseCount}
                disabled={
                  isLoading ||
                  isSaving
                }
                aria-label="Increase employee count"
                className="
                  m-2
                  flex
                  min-h-20
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-50
                  text-[#EF3B3A]
                  transition-colors
                  hover:bg-red-100
                  disabled:cursor-not-allowed
                  disabled:opacity-40

                  dark:bg-red-950/30
                  dark:hover:bg-red-950/50

                  sm:min-h-24
                "
              >
                <Plus
                  size={30}
                  strokeWidth={2.5}
                />
              </button>
            </div>

            {/* =================================================
                HELPER TEXT
            ================================================== */}

            <p
              className="
                mt-4
                text-center
                text-xs
                text-gray-500

                dark:text-gray-400

                sm:text-sm
              "
            >
              Use the + and − buttons to
              adjust the total number of
              employees.
            </p>

            {/* =================================================
                INFORMATION PANEL
            ================================================== */}

            <div
              className="
                mt-6
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-red-100
                bg-red-50/80
                p-3.5
                transition-colors

                dark:border-red-900/40
                dark:bg-red-950/20

                sm:p-4
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-white
                  text-[#EF3B3A]

                  dark:bg-gray-800
                "
              >
                <Info size={18} />
              </div>

              <div
                className="
                  border-l
                  border-red-200
                  pl-3

                  dark:border-red-900/60
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold
                    text-red-600

                    dark:text-red-400
                  "
                >
                  Minimum: 0 employees
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-gray-500

                    dark:text-gray-400

                    sm:text-sm
                  "
                >
                  Update the count and click
                  save to apply changes.
                </p>
              </div>
            </div>

            {/* =================================================
                SAVE BUTTON
            ================================================== */}

            <div
              className="
                mt-6
                flex
                flex-col
                items-center
              "
            >
              <button
                type="button"
                onClick={handleSave}
                disabled={
                  isLoading ||
                  isSaving ||
                  employeeCount ===
                    "" ||
                  Number(
                    employeeCount
                  ) === savedCount
                }
                className="
                  flex
                  w-full
                  max-w-xs
                  items-center
                  justify-center
                  gap-2.5
                  rounded-lg
                  bg-[#EF3B3A]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-colors
                  hover:bg-red-600
                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  sm:text-base
                "
              >
                <Save size={19} />

                {isSaving
                  ? "Saving..."
                  : "Save Employee Count"}
              </button>

              {message && (
                <p
                  role="status"
                  className={`mt-3 text-center text-sm font-medium ${
                    message.includes(
                      "successfully"
                    )
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          HIDE NUMBER INPUT ARROWS
      ====================================================== */}

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