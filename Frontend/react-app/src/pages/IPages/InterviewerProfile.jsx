import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import api from "../../lib/api";
import "./InterviewerProfile.css";

import defaultAvatar from "../../assets/default-avatar.png";

import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import { useInterviewerProfile } from "../../context/InterviewerProfileContext";

const BUCKET_NAME = "profile-photos";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const InterviewerProfile = () => {
  const { fetchProfile: refreshSidebar } = useInterviewerProfile();

  const [profile, setProfile] = useState(null);
  const [editableDetails, setEditableDetails] = useState({
    interviewerRole: "",
    branch: "",
    address: "",
    about: "",
  });
  const [originalDetails, setOriginalDetails] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [errors, setErrors] = useState({
    interviewerRole: "",
    branch: "",
    address: "",
    about: "",
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await api.get("/auth/me");
      const userData = meRes.data;

      const profileRes = await api.get("/auth/interviewer/profile");
      const interviewerData = profileRes.data;

      setProfile({
        interviewerId: interviewerData.interviewerId,
        fullName: interviewerData.fullName,
        email: interviewerData.email || userData.email,
        phone: interviewerData.phone,
        photoUrl: interviewerData.photoUrl,
        userId: interviewerData.userId,
      });

      const editable = {
        interviewerRole: interviewerData.interviewerRole || "",
        branch: interviewerData.branch || "",
        address: interviewerData.address || "",
        about: interviewerData.about || "",
      };

      setEditableDetails(editable);
      setOriginalDetails(editable);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be smaller than 2MB.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setUploadingPhoto(true);
    setError(null);
    setSuccessMsg("");

    //upload photo to supabase
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.userId}.${fileExt}`;
      const filePath = `interviewers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw new Error(uploadError.message);

      //public URL created for the uploaded photo to supabase
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      //sends the generated URL to your Spring Boot backend.  
      await api.put("/auth/interviewer/profile/photo", { photoUrl: publicUrl });

      setProfile((prev) => ({
        ...prev,
        photoUrl: `${publicUrl}?t=${Date.now()}`,
      }));

      refreshSidebar(); // updates sidebar avatar instantly

      setSuccessMsg("Profile photo updated!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Photo upload error:", err);
      setError("Failed to upload photo. Please try again.");
      setTimeout(() => setError(null), 4000);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMsg("");
    setErrors({ interviewerRole: "", branch: "", address: "", about: "" });
  };

  const handleCancel = () => {
    setEditableDetails({ ...originalDetails });
    setIsEditing(false);
    setErrors({ interviewerRole: "", branch: "", address: "", about: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableDetails((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      interviewerRole: "",
      branch: "",
      address: "",
      about: "",
    };

    if (!editableDetails.interviewerRole.trim()) {
      newErrors.interviewerRole = "Role is required.";
      valid = false;
    } else if (/\d/.test(editableDetails.interviewerRole)) {
      newErrors.interviewerRole = "Role cannot contain numbers.";
      valid = false;
    }

    if (!editableDetails.branch.trim()) {
      newErrors.branch = "Branch is required.";
      valid = false;
    } 
    
    if (!editableDetails.address.trim()) {
      newErrors.address = "Address cannot be empty.";
      valid = false;
    }

    if (!editableDetails.about.trim()) {
      newErrors.about = "About cannot be empty.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setSuccessMsg("");
    try {
      await api.put("/auth/interviewer/profile", {
        interviewerRole: editableDetails.interviewerRole,
        branch: editableDetails.branch,
        address: editableDetails.address,
        about: editableDetails.about,
      });

      setOriginalDetails({ ...editableDetails });
      setIsEditing(false);
      refreshSidebar(); // updates sidebar name if changed
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err?.response?.data?.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="profile-page">
          <h1 className="profile-title">My Profile</h1>
          <div className="profile-card">
            <div className="profile-loading">Loading profile...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !profile) {
    return (
      <DashboardLayout>
        <div className="profile-page">
          <h1 className="profile-title">My Profile</h1>
          <div className="profile-card">
            <div className="profile-error">
              <p>{error}</p>
              <button className="edit-btn" onClick={fetchProfile}>
                Retry
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /*correct one*/
  return (
    <DashboardLayout>
      <div className="profile-page">
        <h1 className="profile-title">My Profile</h1>

        {successMsg && <div className="profile-success-msg">{successMsg}</div>}
        {error && <div className="profile-error-msg">{error}</div>}

        <div className="profile-card">
          <div className="profile-grid">
            {/* Left: Read-only info + Photo */}
            <div className="profile-left">
              <div className="profile-left-top">
                <div className="profile-avatar-wrap">
                  {uploadingPhoto && (
                    <div className="avatar-uploading-overlay">
                      <span>Uploading...</span>
                    </div>
                  )}
                  <img
                    src={profile.photoUrl || defaultAvatar}
                    alt="Profile"
                    className="profile-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultAvatar;
                    }}
                  />
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                />

                <button
                  type="button"
                  className="change-photo-btn"
                  style={{ backgroundColor: "#24698B" }}
                  onClick={handlePhotoClick}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? "Uploading..." : "Change Photo"}
                </button>
              </div>

              <div className="profile-readonly-list">
                <div className="readonly-block">
                  <p className="readonly-label">EID</p>
                  <div className="readonly-value">{profile.interviewerId}</div>
                </div>

                <div className="readonly-block">
                  <p className="readonly-label">Name</p>
                  <div className="readonly-value">{profile.fullName}</div>
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

            {/* Right: Editable details */}
            <div className="profile-right">
              <h2 className="profile-right-title">User Details</h2>

              <div className="profile-form">
                <div>
                  <label className="field-label">Role</label>

                  <input
                    type="text"
                    name="interviewerRole"
                    className="profile-input"
                    value={editableDetails.interviewerRole}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  {errors.interviewerRole && (
                    <p className="field-error">{errors.interviewerRole}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    className="profile-input"
                    value={editableDetails.branch}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  {errors.branch && (
                    <p className="field-error">{errors.branch}</p>
                  )}
                </div>

                <div>
                  <label className="field-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="profile-input"
                    value={editableDetails.address}
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
                    value={editableDetails.about}
                    onChange={handleChange}
                    rows={4}
                    disabled={!isEditing}
                  />
                  {errors.about && (
                    <p className="field-error">{errors.about}</p>
                  )}
                </div>

                <div className="form-actions">
                  {!isEditing ? (
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={handleEdit}
                    >
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="save-btn"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewerProfile;