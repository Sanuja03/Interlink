import './SignUpCompany.css'
import interlink from '../../assets/interlink-logo.png'
import homeicon from '../../assets/homeicon.png'
import { supabase } from "../../lib/supabase"
import api from "../../lib/api"

import { useForm } from 'react-hook-form'
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

const SignUpCompany = () => {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState("")
  const [formData, setFormData] = useState(null)
  const [verifying, setVerifying] = useState(false)

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
      })

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
      <div className='page'>
        <div className='container'>

          <div className='header'>
            <div className='text'>
              <img src={interlink} alt="InterLink Logo" className="interlinklogo" />
              <h1>Verify Your Email</h1>
              <p><i>We sent a 6-digit code to {formData?.companyEmail}</i></p>
            </div>
          </div>

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

            <p>
              <a href="#" onClick={(e) => { e.preventDefault(); setStep(1); setOtp(""); }}>← Go back</a>
            </p>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className='page'>

      <div className="home-button">
        <a href="/"><img src={homeicon} alt="Home" /></a>
      </div>

      <div className='container'>

        <div className='header'>
          <div className='text'>
            <img src={interlink} alt="InterLink Logo" className="interlinklogo" />
            <h1>Welcome to InterLink</h1>
            <p><i>Find the right people for your vision</i></p>
          </div>
        </div>

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
            <input type="password" placeholder="Password"
              className={`input-field ${errors.password ? "input-error" : ""}`}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" }
              })} />
          </div>

          <button className='signup-button' type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending OTP..." : "Sign Up"}
          </button>
          
          <p>Already have an account? <Link to="/Login">Login</Link></p>
        </form>
      </div>
    </div>
  )
}

export default SignUpCompany