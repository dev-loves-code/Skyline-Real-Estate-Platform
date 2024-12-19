import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { HashLink as Link } from "react-router-hash-link";
import "./NavBar.css";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";

function NavBar() {
  const [click, setClick] = useState(false);
  const [isTransparent, setIsTransparent] = useState(true);
  const [user, setUser] = useState(null);
  const [activeLink, setActiveLink] = useState(null); // Track the active (locked) link
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data", error);
        localStorage.removeItem("user");
      }
    }
  }, [location]);

  const handleClick = () => setClick(!click);

  const handleLinkClick = (link) => {
    setActiveLink(link); // Set the clicked link as active
    setClick(false); // Close the mobile menu
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        setIsTransparent(window.scrollY <= 60);
      }
    };

    window.addEventListener("scroll", handleScroll);




    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  useEffect(() => {
    setClick(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navbarClass = `navbar ${isHomePage && isTransparent ? "transparent" : ""}`;

  return (
    <nav className={navbarClass}>
      <div className="nav-container">
        <Link smooth to="/#home" className="nav-logo" aria-label="Navigate to home">
          <span>Skyline</span>
        </Link>

        <ul className={click ? "nav-menu active" : "nav-menu"}>
          {isHomePage ? (
            <>
              <li
                className={`nav-item ${activeLink === "home" ? "active" : ""}`}
                onClick={() => handleLinkClick("home")}
              >
                <Link smooth to="/" className="nav-links">
                  Home
                </Link>
              </li>
              <li
                className={`nav-item ${activeLink === "properties" ? "active" : ""}`}
                onClick={() => handleLinkClick("properties")}
              >
                <Link smooth to="/properties" className="nav-links">
                  Properties
                </Link>
              </li>
              <li
                className={`nav-item ${activeLink === "about" ? "active" : ""}`}
                onClick={() => handleLinkClick("about")}
              >
                <Link smooth to="/#about" className="nav-links">
                  About Us
                </Link>
              </li>
            </>
          ) : (
            <>
              <li
                className={`nav-item ${activeLink === "home" ? "active" : ""}`}
                onClick={() => handleLinkClick("home")}
              >
                <NavLink to="/" className="nav-links">
                  Home
                </NavLink>
              </li>
              <li
                className={`nav-item ${activeLink === "properties" ? "active" : ""}`}
                onClick={() => handleLinkClick("properties")}
              >
                <NavLink to="/properties" className="nav-links">
                  Properties
                </NavLink>
              </li>
              <li
                className={`nav-item ${activeLink === "about" ? "active" : ""}`}
                onClick={() => handleLinkClick("about")}
              >
                <NavLink to="/#about" className="nav-links">
                  About Us
                </NavLink>
              </li>
            </>
          )}

          {user && user.role === "admin" && (
            <li
              className={`nav-item ${activeLink === "admin" ? "active" : ""}`}
              onClick={() => handleLinkClick("admin")}
            >
              <NavLink to="/admin" className="nav-links">
                Admin Dashboard
              </NavLink>
            </li>
          )}

          <li
            className={`nav-item ${activeLink === "contact" ? "active" : ""}`}
            onClick={() => handleLinkClick("contact")}
          >
            <Link smooth to="/#contact" className="nav-links">
              Contact
            </Link>
          </li>

          {user ? (
            <li className="nav-item">
              <NavLink
                className="nav-button-logout"
                onClick={handleLogout}
                aria-label="Log out"
              >
                Sign Out
              </NavLink>
            </li>
          ) : (
            <li className="nav-item">
              <NavLink
                to="/auth"
                className={`nav-button-login ${
                  activeLink === "signup" ? "active" : ""
                }`}
                onClick={() => handleLinkClick("signup")}
              >
                Sign Up
              </NavLink>
            </li>
          )}
        </ul>

        <div className="nav-icons">
          {user && (
            <NavLink to="/favorites" className="favorites-icon" aria-label="Favorites">
              <FavoriteIcon fontSize="large" />
            </NavLink>
          )}
          <div className="nav-icon" onClick={handleClick}>
            {click ? <CloseIcon fontSize="large" /> : <MenuIcon fontSize="large" />}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
