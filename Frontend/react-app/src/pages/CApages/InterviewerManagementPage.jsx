import { useState, useEffect } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import InterviewerManagementModal from "./InterviewerManagementModal";
import { supabase } from "../../lib/supabase";
import "./InterviewerManagementPage.css";

export default function InterviewerManagementPage() {
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const fetchCompanyId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("companies")
        .select("company_id")
        .eq("user_id", session.user.id)
        .single();

      if (!error && data) setCompanyId(data.company_id);
    };
    fetchCompanyId();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="im-title">Interviewer Management</h1>
      <p className="im-subtitle">
        Create interviewer profiles, save their details, and manage
        existing interviewer accounts.
      </p>

      <div className="im-embed">
        <InterviewerManagementModal open={true} onClose={() => {}} companyId={companyId} />
      </div>
    </DashboardLayout>
  );
}