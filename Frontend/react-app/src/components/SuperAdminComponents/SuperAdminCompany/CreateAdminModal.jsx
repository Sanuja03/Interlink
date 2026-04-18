import { useState } from "react";

export default function CreateAdminModal({ onClose }) {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    notify: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    console.log("Creating admin:", form);

    // TODO: connect to backend

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-[420px] shadow-lg">

        <h2 className="text-[#24698B] font-semibold mb-4">
          Create New Admin
        </h2>

        <div className="space-y-4">

          {/* Email */}
          <div>
            <label className="text-sm">Admin Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              placeholder="Enter email"
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-sm">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              placeholder="Enter username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm">Temporary Password</label>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              placeholder="Enter password"
            />
          </div>

          {/* Notify */}
          <div className="flex items-center justify-between">
            <label className="text-sm">Notify via email</label>
            <input
              type="checkbox"
              name="notify"
              checked={form.notify}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#24698B] text-white rounded-lg hover:bg-[#1e5873]"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}