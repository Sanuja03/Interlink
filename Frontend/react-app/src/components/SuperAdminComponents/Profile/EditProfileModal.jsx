export default function EditProfileModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/*
        On mobile: sheet slides up from bottom (items-end, rounded only top corners)
        On sm+: centered modal with all rounded corners
      */}
      <div className="bg-white w-full sm:w-[460px] sm:max-w-[95vw] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#0C3E56] px-5 py-4 flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm sm:text-base tracking-wide">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-lg leading-none p-1 -mr-1"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body — important on small phones */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[80vh] sm:max-h-none">

          {/* Profile Image Upload */}
          <div className="flex flex-col items-center gap-2 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#24698B] text-white flex items-center justify-center text-xl sm:text-2xl font-bold rounded-xl relative">
              JD
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border-2 border-[#24698B] rounded-full flex items-center justify-center text-[#24698B] text-xs cursor-pointer hover:bg-[#24698B] hover:text-white transition-colors">
                ✎
              </div>
            </div>
            <label className="text-xs text-[#24698B] font-medium cursor-pointer hover:underline">
              Change profile photo
              <input type="file" accept="image/*" className="hidden" />
            </label>
            <p className="text-xs text-gray-400">JPG, PNG or GIF · Max 5MB</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            {[
              { label: "Username", type: "text", placeholder: "Enter new username", defaultValue: "John Doe" },
              { label: "Email", type: "email", placeholder: "Enter new email", defaultValue: "johndoe@gmail.com" },
              { label: "Contact Number", type: "tel", placeholder: "Enter contact number", defaultValue: "+94 112 345 678" },
              { label: "Address", type: "text", placeholder: "Enter address", defaultValue: "Colombo, Sri Lanka" },
            ].map(({ label, type, placeholder, defaultValue }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
                <input
                  type={type}
                  className="w-full border border-gray-200 focus:border-[#24698B] focus:ring-2 focus:ring-[#24698B]/10 outline-none px-3 py-2.5 rounded-lg text-sm transition-all placeholder:text-gray-300"
                  placeholder={placeholder}
                  defaultValue={defaultValue}
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-1">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button className="w-full sm:w-auto px-5 py-2.5 bg-[#24698B] text-white rounded-lg text-sm font-medium hover:bg-[#1e5873] active:scale-[0.98] transition-all">
              Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}