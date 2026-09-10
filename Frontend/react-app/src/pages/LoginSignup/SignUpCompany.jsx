import './SignUpCompany.css'
import AuthLayout from './AuthLayout'
import { supabase } from "../../lib/supabase"
import api from "../../lib/api"

import { useForm } from 'react-hook-form'
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"

const companyHighlights = [
  "Post unlimited job listings",
  "Smart candidate filtering",
  "Integrated interview scheduling",
]

const SignUpCompany = () => {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState("")
  const [formData, setFormData] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ mode: "onTouched" })

  const onSubmit = async (data) => {
    try {
      setSubmitError("")
      const email = data.companyEmail.trim()
      await api.post("/otp/send-signup-otp", { email })
      setFormData({ ...data })
      setStep(2)
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Failed to send OTP")
    }
  }

  const handleVerifyOtp = async () => {
    if (verifying) return
    setVerifying(true)
    try {
      setSubmitError("")
      const email = formData.companyEmail.trim()
      await api.post("/otp/verify-signup-otp", { email, otp: otp.trim() })
      sessionStorage.setItem("is_signing_up", "true")
      const { error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password,
      })

      if (authError) {
        sessionStorage.removeItem("is_signing_up")
        setSubmitError(authError.message)
        setVerifying(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        sessionStorage.removeItem("is_signing_up")
        setSubmitError("Could not retrieve session. Please try logging in.")
        setVerifying(false)
        return
      }

      //create company in backend
      await api.post("/auth/complete-company-signup", {
        companyName: formData.companyName.trim(),
        companySize: formData.companySize,
        industry: formData.industry,
        email,
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      // Log company registration — non-fatal, wrapped in try/catch so it never breaks signup
      try {
        await api.post("/activity-logs", {
          userId:      session.user?.id ?? null,
          userRole:    "company",
          action:      "CREATE",
          entityType:  "COMPANY",
          description: `New company registered: ${formData.companyName.trim()} (${email})`,
        }, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
      } catch (err) {
        console.error("[SignUpCompany] Failed to create registration activity log:", err);
      }

      sessionStorage.removeItem("is_signing_up")
      await supabase.auth.signOut()

      setSubmitSuccess("Signup successful!")
      navigate("/Login")

    } catch (err) {
      sessionStorage.removeItem("is_signing_up")
      setSubmitError(err?.response?.data?.message || err.message || "Verification failed")
      setVerifying(false)
    }
  }

  if (step === 2) {
    return (
      <AuthLayout
        title="Verify Your Email"
        subtitle={`We sent a 6-digit code to ${formData?.companyEmail ?? ""}`}
        highlights={companyHighlights}
      >
          <div className='form'>
            {submitError && <p className="error-text">{submitError}</p>}

            <div className='input-group'>
              <label>Enter OTP</label>
              <input type="text" placeholder="Enter 6-digit code" className="input-field"
                maxLength={6} value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
            </div>

            <button className='signup-button' onClick={handleVerifyOtp} disabled={otp.length !== 6 || verifying}>
              {verifying ? "Creating account..." : "Verify & Create Account"}
            </button>

            <p className="auth-alt">
              <a href="#" onClick={(e) => { e.preventDefault(); setStep(1); setOtp(""); }}>← Go back</a>
            </p>
          </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Welcome to InterLink"
      subtitle="Find the right people for your vision"
      highlights={companyHighlights}
    >
        <form className='form' onSubmit={handleSubmit(onSubmit)}>
          {submitError && <p className="error-text">{submitError}</p>}

          <div className='input-group'>
            {errors.companyName && <p className="error-text">{errors.companyName.message}</p>}
            <label>company name</label>
            <input type="text" placeholder="Enter company name"
              className={`input-field ${errors.companyName ? "input-error" : ""}`}
              {...register("companyName", { required: "Company name is required" })} />
          </div>

          <div className='input-group'>
            {errors.companyEmail && <p className="error-text">{errors.companyEmail.message}</p>}
            <label>company email</label>
            <input type="email" placeholder="Enter your company email"
              className={`input-field ${errors.companyEmail ? "input-error" : ""}`}
              {...register("companyEmail", {
                required: "Company email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" }
              })} />
          </div>

          <div className='select-group'>
            {errors.industry && <p className="error-text">{errors.industry.message}</p>}
            <label>industry</label>
            <select className={`input-field ${errors.industry ? "input-error" : ""}`}
              {...register("industry", { required: "Please select an industry" })}>
              <option value="">Select industry</option>
              <option value="it">IT</option>
              <option value="fishing">Manufacturing</option>
              <option value="fishing">Finance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className='select-group'>
            {errors.companySize && <p className="error-text">{errors.companySize.message}</p>}
            <label>size</label>
            <select className={`input-field ${errors.companySize ? "input-error" : ""}`}
              {...register("companySize", { required: "Please select company size" })}>
              <option value="">Select range</option>
              <option value="10-15">5 - 20</option>
              <option value="40-50">20 - 50</option>
              <option value="40-50">50 - 100</option>
              <option value="above-100">Above 100</option>
            </select>
          </div>

          <div className='input-group'>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
            <label>password</label>
            <div className='password-field'>
              <input type={showPassword ? "text" : "password"} placeholder="Password"
                className={`input-field ${errors.password ? "input-error" : ""}`}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                  validate: {
                    hasUpper: (value) => /[A-Z]/.test(value) || "Password must contain at least one capital letter",
                    hasSymbol: (value) => /[^A-Za-z0-9]/.test(value) || "Password must contain at least one symbol"
                  }
                })} />
              <button type="button" className='password-toggle'
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className='signup-button' type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending OTP..." : "Sign Up"}
          </button>
          
          <p className="auth-alt">Already have an account? <Link to="/Login">Login</Link></p>
        </form>
    </AuthLayout>
  )
}

export default SignUpCompany