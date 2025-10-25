import React from "react";
import "../../../css/easyApply.css";
import { Link } from "@inertiajs/react";
import AppLogoIcon from '../../components/app-logo-icon';


// Renamed component to EzNav (PascalCase) for React convention
const EzNav = ({ user }: { user?: any }) => {

      const isVerified =
    !!user && typeof user === "object" && Object.keys(user).length > 0;
  return (

    <nav className="ezapply-nav flex justify-between items-center"> 
      
      <div className="ezapply-logo">
          <a href="/" className="flex items-center gap-2"> 
            <AppLogoIcon className="size-6" /> 
            <span>EZ Apply PH</span> 
          </a>
        </div>
        <div className="ezapply-navlinks mx-auto"> 
          <div className="ezapply-navlink">
            <a href="/">Home</a>
          </div>
          <div className="ezapply-navlink">
            <a href="#services">Services</a>
          </div>
          <div className="ezapply-navlink">
            <a href="#about">About</a>
          </div>
          <div className="ezapply-navlink">
            <a href="#contact">Contact</a>
          </div>
        </div>

        <div className="ezapply-login-container">
          {!isVerified ? (
            <div>
              <Link href="/login" className="btn-outline">
                Login
              </Link>{" "}
              <Link href="/register" className="btn-outline">
                Register
              </Link>
            </div>
          ) : (
            <Link href="/dashboard" className="btn-outline">
              Dashboard
            </Link>
          )}
        </div>
      </nav>
  )
}

export default EzNav; // Exporting the corrected name