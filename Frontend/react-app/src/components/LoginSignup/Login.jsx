import './Login.css'
import interlink from '../../assets/interlink.jpeg'
import signin from '../../assets/signin.png'
import { useGoogleLogin } from '@react-oauth/google'
import { useForm } from 'react-hook-form'

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    mode: "onTouched" // show errors after user touches a field
  })

  const onSubmit = (data) => {
    // ✅ only runs if form is valid
    console.log("✅ Login form data:", data) // { email, password }
    // TODO: call backend login here
  }

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Google login success:", tokenResponse) // tokenResponse.access_token
    },
    onError: () => {
      console.log("Google login failed")
    }
  })

  return (
    <div className='page'>
      <div className='container'>
        <div className='header'>
          <div className='text'>
            <img src={interlink} alt="InterLink Logo" className="interlinklogo" />
            <h1>Welcome Back!</h1>
            <p><i>Connecting Talent with Opportunity</i></p>
          </div>
        </div>

        {/* ✅ Wrap inputs with a form */}
        <form className='form' onSubmit={handleSubmit(onSubmit)}>

          {/* ✅ EMAIL */}
          <div className='input-group'>
            {errors.email && <p className="error-text">{errors.email.message}</p>}
            <label>email address</label>
            <input
              type="email"
              placeholder='Enter your email'
              className='input-field'
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
              className='input-field'
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              })}
            />
          </div>

          <div className='forgot-password'>
            <p><a href="">Forgot Password</a></p>
          </div>

          <div>
            {/* ✅ This will submit + validate */}
            <button className='login-button' type="submit" disabled={isSubmitting}>
              Login
            </button>
          </div>

          <div className="or-container">
            <span>OR</span>
          </div>

          {/* ✅ Google sign-in stays the same */}
          <div className="google-signin" onClick={() => googleLogin()}>
            <img src={signin} alt="Sign in with Google" />
          </div>

          <div>
            <p>Dont have an account? <a href="">Sign up</a></p>
          </div>

        </form>
      </div>
    </div>
  )
}

export default Login
