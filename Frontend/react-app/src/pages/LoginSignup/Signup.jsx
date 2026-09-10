import './Signup.css'

import AuthLayout from './AuthLayout'

import { supabase } from "../../lib/supabase"
import api from "../../lib/api"

import { useForm } from 'react-hook-form'
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

const Signup = () => {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [step, setStep] = useState(1) // 1 = form screen, 2 = OTP input screen
  const [otp, setOtp] = useState("")
  const [formData, setFormData] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ mode: "onTouched" })

  // submit form and send otp
  const onSubmit = async (data) => {
    try {
      setSubmitError("")
      const email = data.email.trim()
      await api.post("/otp/send-signup-otp", { email })
      setFormData({ ...data }) // save form data so can use in handleverifyotp function
      setStep(2)
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Failed to send OTP")
    }
  }

  //verify otp and create account
  const handleVerifyOtp = async () => {
  if (verifying) return
  setVerifying(true)
  try {
    setSubmitError("")
    const email = formData.email.trim()

    await api.post("/otp/verify-signup-otp", { email, otp: otp.trim() })

    sessionStorage.setItem("is_signing_up", "true")

    //create a user in supabase auth system
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
    //Supabase creates a session and saves the JWT to localStorage
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      sessionStorage.removeItem("is_signing_up")
      setSubmitError("Could not retrieve session. Please try logging in.")
      setVerifying(false)
      return
    }

    //sends user info and jwt token attached manually to backend to create user in interlinks database
    await api.post("/auth/complete-candidate-signup", {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email,
    }, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })

    // Log registration — non-fatal, wrapped in try/catch so it never breaks signup
    try {
      await api.post("/activity-logs", {
        userId:      session.user?.id ?? null,
        userRole:    "candidate",
        action:      "CREATE",
        entityType:  "USER",
        description: `New candidate registered: ${email}`,
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
    } catch (err) {
      console.error("[Signup] Failed to create registration activity log:", err);
    }


    //log out user
    sessionStorage.removeItem("is_signing_up")
    await supabase.auth.signOut()

    setSubmitSuccess("Signup successful!")
    navigate("/Login")

  }catch (err) {
    sessionStorage.removeItem("is_signing_up")
    setSubmitError(err?.response?.data?.message || err.message || "Verification failed")
    setVerifying(false)
  }
}

  // OTP input screen
  if (step === 2) {
    return (
      <AuthLayout
        title="Verify Your Email"
        subtitle={`We sent a 6-digit code to ${formData?.email ?? ""}`}
      >
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

            <p className="auth-alt">
              <a href="#" onClick={(e) => { e.preventDefault(); setStep(1); setOtp(""); }}>
                ← Go back
              </a>
            </p>

          </div>
      </AuthLayout>
    )
  }

  // signup form 
  return (
    <AuthLayout title="Welcome to InterLink" subtitle="Connecting Talent with Opportunity">
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
            <div className='password-field'>
              <input type={showPassword ? "text" : "password"} placeholder='Password'
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

export default Signup