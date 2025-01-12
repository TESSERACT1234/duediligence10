import React from 'react';
import './Navbar.css'; // Import the CSS file for styling

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src="./TFFfavicon.png" alt="Company Logo" className="logo-img" />
      </div>
      <div className="company-name">
        <h1 className="name">Tesseract Flex Fuel Private Limited</h1>
        <center><p className="slogan">Empowering tomorrow with Green fuel today.</p></center>
      </div>
      <div className="logo">
        <img src="./kvs_logo.png" alt="Company Logo" className="logo-img" style={{width:"70px"}}/>
      </div>
    </nav>
  );
}

export default Navbar;
