import './Signup.css'
import interlink from '../../assets/interlink.jpeg'
import { useForm } from 'react-hook-form'
import { Link } from "react-router-dom"

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ mode: "onTouched" })

  const onSubmit = (data) => {
    console.log("✅ Signup form data:", data)
    // TODO: call backend signup API here
  }

  return (
    <div className='page'>
      <div className='container'>
        <div className='header'>
          <div className='text'>
            <img src={interlink} alt="InterLink Logo" className="interlinklogo" />
            <h1>Welcome to InterLink</h1>
            <p><i>Connecting Talent with Opportunity</i></p>
          </div>
        </div>

        <form className='form' onSubmit={handleSubmit(onSubmit)}>

          <div className='Name-group'>
            {/* ✅ FIRST NAME */}
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

            {/* ✅ LAST NAME */}
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

          {/* ✅ EMAIL */}
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

          {/* ✅ PASSWORD */}
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
              Sign Up
            </button>
          </div>

          <div>
            <p>Already have an account?{" "} 
                <Link to ="/Login">
                Login
                </Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  )
}

export default Signup
