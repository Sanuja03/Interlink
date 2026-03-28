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

  const details = {
    role: "Interviewer",
    branch: "Colombo",
    password: "********",
    address: "University of Moratuwa, Moratuwa",
    about:
      "Focused on UI/UX roles. Experienced in panel interviews and portfolio evaluation.",
  };

  return (
    <DashboardLayout>
      <div className="profile-page">
        <h1 className="profile-title">My Profile</h1>

        <div className="profile-card">
          <div className="profile-grid">

            {/*not editable */}
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

            {/* editable */}
            <div className="profile-right">
              <h2 className="profile-right-title">User Details</h2>

              <form className="profile-form">
                <div>
                  <label className="field-label">Role</label>
                  <input
                    className="profile-input"
                    value={details.role}
                    
                  />
                </div>

                <div>
                  <label className="field-label">Branch</label>
                  <input
                    className="profile-input"
                    value={details.branch}
                    
                  />
                </div>

                <div>
                  <label className="field-label">Password</label>
                  <input
                    type="password"
                    className="profile-input"
                    value={details.password}
                    
                  />
                </div>

                <div>
                  <label className="field-label">Address</label>
                  <input
                    className="profile-input"
                    value={details.address}
                   
                  />
                </div>

                <div>
                  <label className="field-label">About</label>
                  <textarea
                    className="profile-input "
                    value={details.about}
                    rows={4}
                   
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="save-btn">
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