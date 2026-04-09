import './SignUpCompany.css'

import interlink from '../../assets/interlink.png'
import homeicon from '../../assets/homeicon.png'

import { useForm } from 'react-hook-form'
import {Link} from "react-router-dom"


const SignUpCompany = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ mode: "onTouched" })

  const onSubmit = (data) => {
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
            <p><i>Find the right people for your vision</i></p>
          </div>
        </div>

        <form className='form' onSubmit={handleSubmit(onSubmit)}>

          {/*compnay name */}
          <div className='input-group'>
            {errors.companyName && <p className="error-text">{errors.companyName.message}</p>}
            <label>company name</label>
            <input
              type="text"
              placeholder="Enter company name"
              className={`input-field ${errors.companyName ? "input-error" : ""}`}
              {...register("companyName", {
                required: "Company name is required",
                minLength: {
                  value: 1,
                  message: "Company name cannot be empty"
                }
              })}
            />
          </div>

          {/* compnay email */}
          <div className='input-group'>
            {errors.companyEmail && <p className="error-text">{errors.companyEmail.message}</p>}
            <label>company email</label>
            <input
              type="email"
              placeholder="Enter your company email"
              className={`input-field ${errors.companyEmail ? "input-error" : ""}`}
              {...register("companyEmail", {
                required: "Company email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address"
                }
              })}
            />
          </div>

          {/* industry */}
          <div className='select-group'>
            {errors.industry && <p className="error-text">{errors.industry.message}</p>}
            <label>industry</label>
            <select
              className={`input-field ${errors.industry ? "input-error" : ""}`}
              {...register("industry", {
                required: "Please select an industry"
              })}
            >
              <option value="">Select industry</option>
              <option value="it">IT</option>
              <option value="fishing">Fishing</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* size */}
          <div className='select-group'>
            {errors.companySize && <p className="error-text">{errors.companySize.message}</p>}
            <label>size</label>
            <select
              className={`input-field ${errors.companySize ? "input-error" : ""}`}
              {...register("companySize", {
                required: "Please select company size"
              })}
            >
              <option value="">Select range</option>
              <option value="10-15">10 - 15</option>
              <option value="40-50">40 - 50</option>
              <option value="above-100">Above 100</option>
            </select>
          </div>

          {/* password */}
          <div className='input-group'>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
            <label>password</label>
            <input
              type="password"
              placeholder="Password"
              className={`input-field ${errors.password ? "input-error" : ""}`}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              })}
            />
          </div>

          <button className='signup-button' type="submit">
            Sign Up
          </button>

          <p>Already have an account? {" "}
            <Link to = "/Login">
            Login
            </Link>
            </p>

        </form>
      </div>
    </div>
  )
}

export default SignUpCompany
