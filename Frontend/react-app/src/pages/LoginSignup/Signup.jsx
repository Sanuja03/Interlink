import './Signup.css'
import interlink from '../../assets/interlink.png'
import homeicon from '../../assets/homeicon.png'
import { supabase } from "../../lib/supabase"
import api from "../../lib/api"

import { useForm } from 'react-hook-form'
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

const Signup = () => {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [step, setStep] = useState(1) // 1 = form, 2 = OTP
  const [otp, setOtp] = useState("")
  const [formData, setFormData] = useState(null)

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ mode: "onTouched" })

  // Step 1: Submit form → send OTP
  const onSubmit = async (data) => {
    try {
      setSubmitError("")
      const email = data.email.trim()

      // Ask backend to send OTP
      await api.post("/otp/send-signup-otp", { email })

      // Save form data and go to OTP step
      setFormData({ ...data })
      setStep(2)
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Failed to send OTP")
    }
  }

  // Step 2: Verify OTP → create account
  const [verifying, setVerifying] = useState(false)

  const handleVerifyOtp = async () => {
  if (verifying) return
  setVerifying(true)
  try {
    setSubmitError("")
    const email = formData.email.trim()

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

    await api.post("/auth/complete-candidate-signup", {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
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

  // OTP screen
  if (step === 2) {
    return (
      <div className='page'>
        <div className='container'>
          <div className='header'>
            <div className='text'>
              <img src={interlink} alt="InterLink Logo" className="interlinklogo" />
              <h1>Verify Your Email</h1>
              <p><i>We sent a 6-digit code to {formData?.email}</i></p>
            </div>
          </div>

          <div className='form'>
            {submitError && <p className="error-text">{submitError}</p>}

            <div className='input-group'>
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                className="input-field"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <button className='signup-button' onClick={handleVerifyOtp} disabled={otp.length !== 6 || verifying}>
              {verifying ? "Creating account..." : "Verify & Create Account"}
            </button>

            <p>
              <a href="#" onClick={(e) => { e.preventDefault(); setStep(1); setOtp(""); }}>
                ← Go back
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main signup form (same as before)
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
            <p><i>Connecting Talent with Opportunity</i></p>
          </div>
        </div>

        <form className='form' onSubmit={handleSubmit(onSubmit)}>
          {submitError && <p className="error-text">{submitError}</p>}
          {submitSuccess && <p className="success-text">{submitSuccess}</p>}

          <div className='Name-group'>
            <div className='input-group'>
              {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}
              <label>first name</label>
              <input type="text" placeholder='Enter your first name'
                className={`input-field ${errors.firstName ? "input-error" : ""}`}
                {...register("firstName", {
                  required: "First name is required",
                  minLength: { value: 2, message: "must be at least 2 characters" },
                  pattern: { value: /^[A-Za-z\s'-]+$/, message: "can contain letters only" }
                })} />
            </div>
            <div className='input-group'>
              {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
              <label>last name</label>
              <input type="text" placeholder='Enter your last name'
                className={`input-field ${errors.lastName ? "input-error" : ""}`}
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: { value: 2, message: "must be at least 2 characters" },
                  pattern: { value: /^[A-Za-z\s'-]+$/, message: "can contain letters only" }
                })} />
            </div>
          </div>

          <div className='input-group'>
            {errors.email && <p className="error-text">{errors.email.message}</p>}
            <label>email address</label>
            <input type="email" placeholder='Enter your email'
              className={`input-field ${errors.email ? "input-error" : ""}`}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" }
              })} />
          </div>

          <div className='input-group'>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
            <label>password</label>
            <input type="password" placeholder='Password'
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

export default Signup