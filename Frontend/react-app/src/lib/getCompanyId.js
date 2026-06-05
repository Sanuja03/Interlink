import { supabase } from "./supabase";

/**
 * Returns the companyId for the logged-in user.
 * Checks localStorage first; if missing, fetches from Supabase
 * and caches it in localStorage for other components.
 */
export async function getCompanyId() {
  let companyId = localStorage.getItem("companyId");
  if (companyId) return companyId;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;

    const { data, error } = await supabase
      .from("companies")
      .select("company_id")
      .eq("user_id", session.user.id)
      .single();

    if (error || !data?.company_id) return null;

    companyId = data.company_id;
    localStorage.setItem("companyId", companyId);
    return companyId;
  } catch (err) {
    console.error("Failed to fetch companyId:", err);
    return null;
  }
}