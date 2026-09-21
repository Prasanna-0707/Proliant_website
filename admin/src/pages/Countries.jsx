import { useMemo, useState } from "react";
import {
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  Plus,
} from "lucide-react";

const initialCountries = [
  {
    id: 1,
    country: "United States",
    code: "US",
    company: "Proliant Data LLC",
    state: "Massachusetts",
    city: "Boston",
    location: "75 State Street",
    address: "75 State Street, Boston, MA 01803",
    latitude: "",
    longitude: "",
    phone: "+1-617-955-2070",
    email: "info@proliantdatallc.com",
  },
  {
    id: 2,
    country: "Germany",
    code: "DE",
    company: "Proliant Data GmbH",
    state: "Bavaria",
    city: "Erlangen",
    location: "Würzburger Ring 39",
    address: "Würzburger Ring 39, Erlangen, 91056",
    latitude: "",
    longitude: "",
    phone: "+49-15158005363",
    email: "info@proliantdatallc.com",
  },
  {
    id: 3,
    country: "India",
    code: "IN",
    company: "Roliant Data Pvt. Ltd.",
    state: "Telangana",
    city: "Kothaguda",
    location: "Pranava Vaishnoi Business Park",
    address:
      "Pranava Vaishnoi Business Park, Kothaguda, Telangana, India",
    latitude: "",
    longitude: "",
    phone: "+91 80008199903",
    email: "info@proliantdatallc.com",
  },
  {
    id: 4,
    country: "United Arab Emirates",
    code: "AE",
    company: "Proliant Data FZCO",
    state: "Dubai",
    city: "Dubai",
    location: "IFZA Business Park",
    address: "IFZA Business Park, Dubai, United Arab Emirates",
    latitude: "",
    longitude: "",
    phone: "+971 505 185363",
    email: "info@proliantdatallc.com",
  },
];

const emptyForm = {
  country: "",
  company: "",
  state: "",
  city: "",
  location: "",
  address: "",
  latitude: "",
  longitude: "",
  phone: "",
  email: "",
};

function Countries() {
  const [countries, setCountries] = useState(initialCountries);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filteredCountries = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return countries;
    }

    return countries.filter(
      (item) =>
        item.country.toLowerCase().includes(value) ||
        item.code.toLowerCase().includes(value) ||
        item.company.toLowerCase().includes(value)
    );
  }, [countries, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCountry = (event) => {
    event.preventDefault();

    if (!form.country.trim()) {
      return;
    }

    const countryCodeMap = {
      "United States": "US",
      Germany: "DE",
      India: "IN",
      "United Arab Emirates": "AE",
    };

    const newCountry = {
      id: Date.now(),
      country: form.country,
      code:
        countryCodeMap[form.country] ||
        form.country
          .split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 3)
          .toUpperCase(),
      company: form.company || "—",
      ...form,
    };

    setCountries((prev) => [...prev, newCountry]);
    setForm(emptyForm);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setCountries((prev) => prev.filter((item) => item.id !== id));
    setOpenMenu(null);
  };

  return (
    <section className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900 transition-colors dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Countries
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage countries and company locations available across your
            organization.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
        >
          <Plus size={18} />
          Add Country
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by country..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/20"
          />
        </div>
      </div>

      {/* Country List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold">Country List</h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filteredCountries.length}{" "}
            {filteredCountries.length === 1 ? "country" : "countries"} found
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-max table-fixed text-left">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[14%]" />
              <col className="w-[36%]" />
              <col className="w-[20%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Country
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Code
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Company
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCountries.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No countries found.
                  </td>
                </tr>
              ) : (
                filteredCountries.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 last:border-b-0 dark:border-gray-800"
                  >
                    {/* Country */}
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.country}
                      </div>

                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {item.city}
                        {item.state ? `, ${item.state}` : ""}
                      </div>
                    </td>

                    {/* Code */}
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {item.code}
                    </td>

                    {/* Company */}
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.company}
                      </div>

                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {item.phone}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="relative px-6 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(
                            openMenu === item.id ? null : item.id
                          )
                        }
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenu === item.id && (
                        <div className="absolute left-6 top-11 z-20 w-36 rounded-lg border border-gray-200 bg-white py-1 text-left shadow-lg dark:border-gray-700 dark:bg-gray-800">
                          <button
                            type="button"
                            onClick={() => setOpenMenu(null)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Country Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Country
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add a country and its company location details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setForm(emptyForm);
                }}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleAddCountry}
              className="overflow-y-auto px-6 py-5"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Country */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Country
                  </label>

                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Enter country name"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                  />
                </div>

                {/* Company */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company
                  </label>

                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                  />
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter complete address"
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                  />
                </div>

                {/* Latitude */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Latitude
                  </label>

                  <input
                    type="text"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="Enter latitude"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Longitude
                  </label>

                  <input
                    type="text"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="Enter longitude"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setForm(emptyForm);
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Add Country
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Countries;