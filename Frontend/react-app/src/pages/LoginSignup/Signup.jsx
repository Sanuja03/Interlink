import './Signup.css'

import interlink from '../../assets/interlink.png'
import homeicon from '../../assets/homeicon.png'
import { supabase } from "../../lib/supabase"
import api from "../../lib/api";

import { useForm } from 'react-hook-form'
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

const Signup = () => {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ mode: "onTouched" })

  const onSubmit = async (data) => {
    try {
      setSubmitError("")
      setSubmitSuccess("")

      const firstName = data.firstName.trim()
      const lastName = data.lastName.trim()
      const email = data.email.trim()
      const password = data.password

      // Create auth user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setSubmitError(authError.message)
        return
      }

      //send profile data to backend
      await api.post("/auth/complete-candidate-signup", {
        firstName,
        lastName,
        email,
      })
      setSubmitSuccess("Signup successful!")
      navigate("/Login")

    } catch (err) {
      console.error("UNEXPECTED ERROR:", err)
      setSubmitError(
        err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        "Unexpected error occurred"
      )
    }

  }

  return (
    <div className='page'>
      <div className="home-button">
        <a href="/">
          <img src={homeicon} alt="Home" />
        </a>
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
              <input
                type="text"
                placeholder='Enter your first name'
                className={`input-field ${errors.firstName ? "input-error" : ""}`}
                {...register("firstName", {
                  required: "First name is required",
                  minLength: { value: 2, message: "must be at least 2 characters" },
                  pattern: { value: /^[A-Za-z\s'-]+$/, message: "can contain letters only" }
                })}
              />
            </div>

            <div className='input-group'>
              {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
              <label>last name</label>
              <input
                type="text"
                placeholder='Enter your last name'
                className={`input-field ${errors.lastName ? "input-error" : ""}`}
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: { value: 2, message: "must be at least 2 characters" },
                  pattern: { value: /^[A-Za-z\s'-]+$/, message: "can contain letters only" }
                })}
              />
            </div>
          </div>

          <div className='input-group'>
            {errors.email && <p className="error-text">{errors.email.message}</p>}
            <label>email address</label>
            <input
              type="email"
              placeholder='Enter your email'
              className={`input-field ${errors.email ? "input-error" : ""}`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address"
                }
              })}
            />
          </div>

          <div className='input-group'>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
            <label>password</label>
            <input
              type="password"
              placeholder='Password'
              className={`input-field ${errors.password ? "input-error" : ""}`}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" }
              })}
            />
          </div>

          <div>
            <button className='signup-button' type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </button>
          </div>

          <div>
            <p>
              Already have an account?{" "}
              <Link to="/Login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup