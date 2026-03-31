import { useState } from "react";
import DashboardLayout from "../DashboardCom/DashboardLayout";
import defaultAvatar from "../../assets/default-avatar.png";
import "./InterviewerProfile.css";

const InterviewerProfile = () => {
  const profile = {
    eid: "E1023",
    name: "Sanj Perera",
    email: "senithi.perera@interlink.com",
    phone: "+94 77 123 4567",
    avatar: defaultAvatar,
  };

  const initialDetails = {
    role: "Interviewer",
    branch: "Colombo",
    password: "",
    address: "University of Moratuwa, Moratuwa",
    about:
      "Focused on UI/UX roles. Experienced in panel interviews and portfolio evaluation.",
  };

  const [details, setDetails] = useState(initialDetails);
  const [isEditing, setIsEditing] = useState(false);

  const [errors, setErrors] = useState({
    role: "",
    branch: "",
    password: "",
    address: "",
    about: "",
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      role: "",
      branch: "",
      password: "",
      address: "",
      about: "",
    };

    // Role: required, no numbers
    if (!details.role.trim()) {
      newErrors.role = "Role is required.";
      valid = false;
    } else if (/\d/.test(details.role)) {
      newErrors.role = "Role cannot contain numbers.";
      valid = false;
    }

    // Branch: required, no numbers
    if (!details.branch.trim()) {
      newErrors.branch = "Branch is required.";
      valid = false;
    } else if (/\d/.test(details.branch)) {
      newErrors.branch = "Branch cannot contain numbers.";
      valid = false;
    }

    // Password: required, 8+ chars, must contain symbol
    if (!details.password.trim()) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (details.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
      valid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>_\-\\/[\];'`~+=]/.test(details.password)) {
      newErrors.password = "Password must contain at least one symbol.";
      valid = false;
    }

    // Address: optional here, no strict validation
    if (!details.address.trim()) {
      newErrors.address = "Address cannot be empty.";
      valid = false;
    }

    // About: optional here, no strict validation
    if (!details.about.trim()) {
      newErrors.about = "About cannot be empty.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    setIsEditing(false);
    alert("Profile details saved successfully!");
    console.log("Saved Details:", details);
  };

  return (
    <DashboardLayout>
      <div className="profile-page">
        <h1 className="profile-title">My Profile</h1>

        <div className="profile-card">
          <div className="profile-grid">
            <div className="profile-left">
              <div className="profile-left-top">
                <div className="profile-avatar-wrap">
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="profile-avatar"
                  />
                </div>

                <button
                  type="button"
                  className="change-photo-btn"
                  style={{ backgroundColor: "#24698B" }}
                >
                  Change Photo
                </button>
              </div>

              <div className="profile-readonly-list">
                <div className="readonly-block">
                  <p className="readonly-label">EID</p>
                  <div className="readonly-value">{profile.eid}</div>
                </div>

                <div className="readonly-block">
                  <p className="readonly-label">Name</p>
                  <div className="readonly-value">{profile.name}</div>
                </div>

                <div className="readonly-block">
                  <p className="readonly-label">Email</p>
                  <div className="readonly-value">{profile.email}</div>
                </div>

                <div className="readonly-block">
                  <p className="readonly-label">Phone Number</p>
                  <div className="readonly-value">{profile.phone}</div>
                </div>
              </div>
            </div>

            <div className="profile-right">
              <h2 className="profile-right-title">User Details</h2>

              <form
                className="profile-form"
                onSubmit={(e) => e.preventDefault()}
              >
                <div>
                  <label className="field-label">Role</label>
                  <input
                    type="text"
                    name="role"
                    className="profile-input"
                    value={details.role}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  {errors.role && <p className="field-error">{errors.role}</p>}
                </div>

                <div>
                  <label className="field-label">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    className="profile-input"
                    value={details.branch}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  {errors.branch && (
                    <p className="field-error">{errors.branch}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="profile-input"
                    value={details.password}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter new password"
                  />
                  {errors.password && (
                    <p className="field-error">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="profile-input"
                    value={details.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  {errors.address && (
                    <p className="field-error">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">About</label>
                  <textarea
                    name="about"
                    className="profile-input profile-textarea"
                    value={details.about}
                    onChange={handleChange}
                    rows={4}
                    disabled={!isEditing}
                  />
                  {errors.about && (
                    <p className="field-error">{errors.about}</p>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={handleEdit}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="save-btn"
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewerProfile;