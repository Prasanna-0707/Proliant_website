import { useState } from "react";

export default function InterviewerProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Profile API integration can be added when the backend endpoint is available.
    alert("Profile form validated locally. Saving is not connected to the API yet.");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Interviewer Profile</h1>
      <p className="mt-2">View and update your profile details.</p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
        <div>
          <label htmlFor="name" className="block font-medium">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-medium">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="department" className="block font-medium">
            Department
          </label>
          <input
            id="department"
            name="department"
            value={profile.department}
            onChange={handleChange}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="designation" className="block font-medium">
            Designation
          </label>
          <input
            id="designation"
            name="designation"
            value={profile.designation}
            onChange={handleChange}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-red-600 px-5 py-2 text-white"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}