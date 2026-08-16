import { useState, useEffect } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api";
import "./CompanySubscriptionPlansView.css";

const planIcons = { Free: "📦", Growth: "🚀", Enterprise: "💎" };
const planOrder = ["Free", "Growth", "Enterprise"];

// Short taglines shown under each plan name
const planTaglines = {
  Free: "Just getting started",
  Growth: "For growing hiring teams",
  Enterprise: "For high-volume hiring",
};

// Highlighted / recommended plan
const highlightedPlan = "Growth";

export default function CompanySubscriptionPlansView() {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/subscriptions")
      .then((res) => {
        const sorted = [...res.data].sort(
          (a, b) => planOrder.indexOf(a.name) - planOrder.indexOf(b.name)
        );
        setPlans(sorted);
      })
      .catch(() => setError("Could not load subscription plans"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="csp-page">
        <div className="csp-container">
          <h1 className="csp-heading">Subscription Plans</h1>
          <p className="csp-sub">Compare pricing and limits for each plan</p>

          {loading && <p className="csp-empty">Loading plans...</p>}
          {error && <p className="csp-error">{error}</p>}

          {!loading && !error && (
            <>
              <div className="csp-grid">
                {plans.map((plan) => {
                  const isHighlighted = plan.name === highlightedPlan;
                  return (
                    <div
                      className={`csp-card ${isHighlighted ? "csp-card--highlight" : ""}`}
                      key={plan.name}
                    >
                      {isHighlighted && (
                        <span className="csp-badge">Most Popular</span>
                      )}

                      <div className="csp-icon">{planIcons[plan.name] || "📄"}</div>
                      <h3 className="csp-name">{plan.name}</h3>
                      <p className="csp-tagline">{planTaglines[plan.name] || ""}</p>

                      <p className="csp-price">
                        {plan.price > 0 ? (
                          <>
                            <span className="csp-priceNum">${plan.price}</span>
                            <span className="csp-pricePeriod"> / month</span>
                          </>
                        ) : (
                          <span className="csp-priceNum">Free</span>
                        )}
                      </p>

                      <div className="csp-divider" />

                      <ul className="csp-list">
                        <li>
                          <span className="csp-checkmark">✓</span>
                          Active job posts:{" "}
                          <strong>{plan.activeJobs != null ? plan.activeJobs : "Unlimited"}</strong>
                        </li>
                        <li>
                          <span className="csp-checkmark">✓</span>
                          AI CV analyses:{" "}
                          <strong>
                            {plan.isUnlimited || plan.aiCvLimit == null
                              ? "Unlimited"
                              : plan.aiCvLimit}
                          </strong>
                        </li>
                        <li>
                          <span className="csp-checkmark">✓</span>
                          Interviewers:{" "}
                          <strong>{plan.interviewers != null ? plan.interviewers : "Unlimited"}</strong>
                        </li>
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Payment contact notice */}
              <div className="csp-paymentNotice">
                <p className="csp-paymentText">
                  To upgrade your plan, payment must be made directly to our admin team.
                  Contact us to arrange payment and activate your new plan.
                </p>
                <p className="csp-paymentContact">
                  <strong>John Perera</strong> · Super Admin
                  <br />
                  📞 +94 77 123 4567
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}