import { useRef, useState } from "react";
import DashboardLayout from "../DashboardCom/DashboardLayout";
import defaultAvatar from "../../assets/default-avatar.png";
import "./InterviewerProfile.css";

const InterviewerProfile = () => {
  // Read-only (from DB later)
  const profile = {
    eid: "E1023",
    name: "Sanj Perera",
    email: "senithi.perera@interlink.com",
    phone: "+94 77 123 4567",
    avatar: defaultAvatar,
  };

  // Editable (from DB later)
  const [form, setForm] = useState({
    role: "Interviewer",
    branch: "Colombo",
    password: "",
    address: "University of Moratuwa, Bandaranayake Mawatha, Moratuwa",
    about: "Focused on UI/UX roles. Experienced in panel interviews and portfolio evaluation.",
  });

  const [editOn, setEditOn] = useState({
    role: false,
    branch: false,
    password: false,
    address: false,
    about: false,
  });

  const roleRef = useRef(null);
  const branchRef = useRef(null);
  const passwordRef = useRef(null);
  const addressRef = useRef(null);
  const aboutRef = useRef(null);

  const refMap = {
    role: roleRef,
    branch: branchRef,
    password: passwordRef,
    address: addressRef,
    about: aboutRef,
  };

  const enableEdit = (key) => {
    setEditOn((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => refMap[key]?.current?.focus(), 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    console.log("Saving:", form);

    setEditOn({
      role: false,
      branch: false,
      password: false,
      address: false,
      about: false,
    });
  };

  const handlePhotoChange = () => {
    alert("Connect file upload here later");
  };

  const PenButton = ({ onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="pen-btn"
      aria-label="Edit"
      title="Edit"
    >
      ✎
    </button>
  );

  return (
    <DashboardLayout>
      <div className="profile-page">
        <h1 className="profile-title">My Profile</h1>

        <div className="profile-card">
          <p className="profile-text">content will be displayed here.</p>
        </div>

        
         
        
      </div>
    </DashboardLayout>
  );
};

export default InterviewerProfile;
