
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  Plus,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Building2,
  Navigation,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

// ---------------------------------------------------------
// EMPTY FORM
// ---------------------------------------------------------

const emptyForm = {
  country: "",
  companyName: "",
  state: "",
  city: "",
  address: "",
  latitude: "",
  longitude: "",
  phone: "",
  email: "",
};

// ---------------------------------------------------------
// COUNTRY CODE HELPER
// ---------------------------------------------------------

const getCountryCode = (country = "") => {
  const countryCodeMap = {
    "United States": "US",
    Germany: "DE",
    India: "IN",
    "United Arab Emirates": "AE",
    "United Kingdom": "UK",
    Canada: "CA",
    Australia: "AU",
    Singapore: "SG",
  };

  if (countryCodeMap[country]) {
    return countryCodeMap[country];
  }

  return country
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
};

// ---------------------------------------------------------
// REUSABLE INPUT CLASS
// ---------------------------------------------------------

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/20";

// ---------------------------------------------------------
// COUNTRIES COMPONENT
// ---------------------------------------------------------

function Countries() {
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // -------------------------------------------------------
  // AUTH TOKEN
  // -------------------------------------------------------

  const getToken = () => {
    return localStorage.getItem("adminToken");
  };

  // -------------------------------------------------------
  // GET ALL LOCATIONS
  // -------------------------------------------------------

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/locations`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to fetch locations."
        );
      }

      const locations = Array.isArray(result)
        ? result
        : result?.data || result?.locations || [];

      setCountries(locations);
    } catch (err) {
      console.error("Fetch locations error:", err);

      setError(
        err.message || "Failed to load countries."
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // INITIAL FETCH
  // -------------------------------------------------------

  useEffect(() => {
    fetchLocations();
  }, []);

  // -------------------------------------------------------
  // SEARCH AND FILTER
  // -------------------------------------------------------

  const filteredCountries = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return countries;
    }

    return countries.filter((item) => {
      const country = item.country || "";
      const company = item.companyName || "";
      const state = item.state || "";
      const city = item.city || "";
      const code = getCountryCode(country);

      return (
        country.toLowerCase().includes(value) ||
        company.toLowerCase().includes(value) ||
        state.toLowerCase().includes(value) ||
        city.toLowerCase().includes(value) ||
        code.toLowerCase().includes(value)
      );
    });
  }, [countries, search]);

  // -------------------------------------------------------
  // FORM CHANGE
  // -------------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -------------------------------------------------------
  // OPEN ADD MODAL
  // -------------------------------------------------------

  const handleOpenAdd = () => {
    setEditingCountry(null);
    setForm({ ...emptyForm });
    setError("");
    setShowModal(true);
    setOpenMenu(null);
  };

  // -------------------------------------------------------
  // OPEN EDIT MODAL
  // -------------------------------------------------------

  const handleOpenEdit = (item) => {
    setEditingCountry(item);

    setForm({
      country: item.country || "",
      companyName: item.companyName || "",
      state: item.state || "",
      city: item.city || "",
      address: item.address || "",
      latitude:
        item.latitude !== undefined &&
        item.latitude !== null
          ? String(item.latitude)
          : "",
      longitude:
        item.longitude !== undefined &&
        item.longitude !== null
          ? String(item.longitude)
          : "",
      phone: item.phone || "",
      email: item.email || "",
    });

    setError("");
    setShowModal(true);
    setOpenMenu(null);
  };

  // -------------------------------------------------------
  // CLOSE MODAL
  // -------------------------------------------------------

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCountry(null);
    setForm({ ...emptyForm });
    setError("");
  };

  // -------------------------------------------------------
  // CREATE / UPDATE LOCATION
  // -------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.country.trim()) {
      setError("Country is required.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Your session has expired. Please login again."
      );
      return;
    }

    // Validate numeric coordinates if provided
    if (
      form.latitude.trim() !== "" &&
      !Number.isFinite(Number(form.latitude))
    ) {
      setError("Please enter a valid latitude.");
      return;
    }

    if (
      form.longitude.trim() !== "" &&
      !Number.isFinite(Number(form.longitude))
    ) {
      setError("Please enter a valid longitude.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        country: form.country.trim(),
        companyName: form.companyName.trim(),
        state: form.state.trim(),
        city: form.city.trim(),
        address: form.address.trim(),

        latitude:
          form.latitude.trim() === ""
            ? undefined
            : Number(form.latitude),

        longitude:
          form.longitude.trim() === ""
            ? undefined
            : Number(form.longitude),

        phone: form.phone.trim(),
        email: form.email.trim(),
      };

      const url = editingCountry
        ? `${API_BASE_URL}/locations/${editingCountry._id}`
        : `${API_BASE_URL}/locations`;

      const method = editingCountry ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Failed to ${
              editingCountry ? "update" : "add"
            } location.`
        );
      }

      await fetchLocations();

      handleCloseModal();
    } catch (err) {
      console.error(
        editingCountry
          ? "Update location error:"
          : "Create location error:",
        err
      );

      setError(
        err.message ||
          `Failed to ${
            editingCountry ? "update" : "add"
          } location.`
      );
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------
  // DELETE LOCATION
  // -------------------------------------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this location?"
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setOpenMenu(null);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/locations/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to delete location."
        );
      }

      setCountries((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (err) {
      console.error("Delete location error:", err);

      setError(
        err.message || "Failed to delete location."
      );
    }
  };

  // -------------------------------------------------------
  // LOADING STATE
  // -------------------------------------------------------

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900 transition-colors dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <Loader2
              size={20}
              className="animate-spin"
            />
            Loading locations...
          </div>
        </div>
      </section>
    );
  }

  // -------------------------------------------------------
  // MAIN UI
  // -------------------------------------------------------

  return (
    <section className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900 transition-colors dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">

      {/* ===================================================
          HEADER
      ==================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Countries
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage countries and company locations available
            across your organization.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 sm:w-auto"
        >
          <Plus size={18} />
          Add Country
        </button>
      </div>

      {/* ===================================================
          ERROR MESSAGE
      ==================================================== */}

      {error && !showModal && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ===================================================
          SEARCH
      ==================================================== */}

      <div className="mb-5">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by country, company, city..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/20"
          />
        </div>
      </div>

      {/* ===================================================
          COUNTRY LIST
      ==================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

        {/* List Header */}

        <div className="border-b border-gray-100 px-4 py-4 sm:px-6 dark:border-gray-800">
          <h2 className="text-base font-semibold">
            Country List
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filteredCountries.length}{" "}
            {filteredCountries.length === 1
              ? "location"
              : "locations"}{" "}
            found
          </p>
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================== */}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-300 text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Country
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Code
                </th>

                <th className="w-45 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Company
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  State
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  City
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Address
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Latitude
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Longitude
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Phone
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Email
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCountries.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No countries found.
                  </td>
                </tr>
              ) : (
                filteredCountries.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-100 last:border-b-0 dark:border-gray-800"
                  >

                    {/* Country */}

                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.country || "—"}
                      </div>
                    </td>

                    {/* Country Code */}

                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {getCountryCode(item.country)}
                    </td>

                    {/* Company */}

                    <td className="px-4 py-4">
                      <div className="w-45 font-medium text-gray-900 dark:text-white">
                        {item.companyName || "—"}
                      </div>
                    </td>

                    {/* State */}

                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {item.state || "—"}
                    </td>

                    {/* City */}

                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {item.city || "—"}
                    </td>

                    {/* Address */}

                    <td className="px-4 py-4">
                      <div
                        className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-300"
                        title={item.address || ""}
                      >
                        {item.address || "—"}
                      </div>
                    </td>

                    {/* Latitude */}

                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {item.latitude ?? "—"}
                    </td>

                    {/* Longitude */}

                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {item.longitude ?? "—"}
                    </td>

                    {/* Phone */}

                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {item.phone || "—"}
                    </td>

                    {/* Email */}

                    <td className="px-4 py-4">
                      <div
                        className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-300"
                        title={item.email || ""}
                      >
                        {item.email || "—"}
                      </div>
                    </td>

                    {/* Actions */}

                    <td className="relative px-4 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(
                            openMenu === item._id
                              ? null
                              : item._id
                          )
                        }
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenu === item._id && (
                        <div className="absolute right-4 top-12 z-20 w-36 rounded-lg border border-gray-200 bg-white py-1 text-left shadow-lg dark:border-gray-700 dark:bg-gray-800">

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenEdit(item)
                            }
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(item._id)
                            }
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

        {/* =================================================
            MOBILE CARDS
        ================================================== */}

        <div className="space-y-3 p-3 md:hidden">
          {filteredCountries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No countries found.
            </div>
          ) : (
            filteredCountries.map((item) => (
              <div
                key={item._id}
                className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >

                {/* Card Header */}

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                        {item.country || "—"}
                      </h3>

                      <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {getCountryCode(item.country)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <Building2
                        size={15}
                        className="shrink-0 text-gray-400"
                      />

                      <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                        {item.companyName || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions */}

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(
                          openMenu === item._id
                            ? null
                            : item._id
                        )
                      }
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenu === item._id && (
                      <div className="absolute right-0 top-10 z-30 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800">

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenEdit(item)
                          }
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item._id)
                          }
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>

                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}

                <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {item.city || "—"}
                        {item.state
                          ? `, ${item.state}`
                          : ""}
                      </p>

                      {item.address && (
                        <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                          {item.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}

                <div className="mt-4 grid grid-cols-1 gap-2.5">

                  {item.phone && (
                    <div className="flex min-w-0 items-center gap-3">
                      <Phone
                        size={15}
                        className="shrink-0 text-gray-400"
                      />

                      <span className="truncate text-sm text-gray-600 dark:text-gray-300">
                        {item.phone}
                      </span>
                    </div>
                  )}

                  {item.email && (
                    <div className="flex min-w-0 items-center gap-3">
                      <Mail
                        size={15}
                        className="shrink-0 text-gray-400"
                      />

                      <span className="truncate text-sm text-gray-600 dark:text-gray-300">
                        {item.email}
                      </span>
                    </div>
                  )}

                </div>

                {/* Coordinates */}

                {(item.latitude !== undefined &&
                  item.latitude !== null) ||
                (item.longitude !== undefined &&
                  item.longitude !== null) ? (
                  <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                    <Navigation
                      size={15}
                      className="shrink-0 text-gray-400"
                    />

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Coordinates
                      </p>

                      <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                        {item.latitude ?? "—"},{" "}
                        {item.longitude ?? "—"}
                      </p>
                    </div>
                  </div>
                ) : null}

              </div>
            ))
          )}
        </div>
      </div>

      {/* ===================================================
          ADD / EDIT MODAL
      ==================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingCountry
                    ? "Edit Country"
                    : "Add Country"}
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {editingCountry
                    ? "Update the company location details."
                    : "Add a country and its company location details."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Error */}

            {error && (
              <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Modal Body */}

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto px-6 py-5"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Country */}

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Country *
                  </label>

                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Enter country name"
                    required
                    className={inputClass}
                  />
                </div>

                {/* Company Name */}

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Name
                  </label>

                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className={inputClass}
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
                    className={inputClass}
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
                    className={inputClass}
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
                    rows={3}
                    placeholder="Enter complete address"
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Latitude */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="Enter latitude"
                    className={inputClass}
                  />
                </div>

                {/* Longitude */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="Enter longitude"
                    className={inputClass}
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
                    className={inputClass}
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
                    className={inputClass}
                  />
                </div>

              </div>

              {/* Modal Footer */}

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? editingCountry
                      ? "Updating..."
                      : "Adding..."
                    : editingCountry
                    ? "Update Country"
                    : "Add Country"}
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