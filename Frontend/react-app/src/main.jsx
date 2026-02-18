import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {GoogleOAuthProvider} from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'

const CLIENT_ID = "1079353032226-r1v03rp4huthku1hqm7udkt7d1vkjkj3.apps.googleusercontent.com"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
   </GoogleOAuthProvider>
  </StrictMode>,
)
