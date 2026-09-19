import { Link, useLocation } from "react-router-dom";
import { Activity, ArrowRight } from "lucide-react";

function Navbar() {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar-container">

        <Link to="/" className="brand">
          <div className="brand-icon">
            <Activity size={21} />
          </div>

          <div>
            <span className="brand-name">BloodAI</span>
            <span className="brand-tagline">Report Analyzer</span>
          </div>
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/upload">Analyze Report</Link>
          <a href="#how-it-works">How It Works</a>
        </nav>

        {location.pathname === "/" && (
  <Link to="/upload" className="nav-cta">
    Get Started
    <ArrowRight size={18} />
  </Link>
)}

      </div>
    </header>
  );
}

export default Navbar;