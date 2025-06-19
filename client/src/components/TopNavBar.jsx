import React from 'react'
import { Link } from "react-router";
const TopNavBar = () => {
  return (
    <header>
        <div className="header-left">
            <img src="/cinephoria-sm.png" alt="Cinephoria logo"/>
            <Link to={"/auth/register"} className="header-icon-link">👤<span>Register</span></Link>
            <Link to={"/auth/login"} className="header-icon-link">👤<span>Login</span></Link>
        </div>
        <div className="header-middle">
            <Link to={"/home"} className="header-icon-link">🏠<span>Admin</span></Link> 
            <Link to={"/messages"} className="header-icon-link">✉️<span>Messages</span></Link>
            <Link to={"/movies/recent"} className="header-icon-link">🆕<span>Recent</span></Link>
            <Link to={"/movies"} className="header-icon-link">📽️<span>Movies</span></Link>
            <Link to={"/screenings"} className="header-icon-link">🎞️<span>Screenings</span></Link>
            <Link to={"/cinemas"} className="header-icon-link">🏛️<span>Cinemas</span></Link>
            <Link to={"/reservation"} className="header-icon-link">📅<span>Reservation</span></Link>
            <Link to={"/tickets"} className="header-icon-link">🎟️<span>Tickets</span></Link>
        </div>
        <div className="header-right">
            <Link to={"/users"} className="header-icon-link">👤<span>Users</span></Link>

            <Link to={"/contact"} className="header-icon-link">📞<span>Contact</span></Link>
        </div>
    </header>
  )
}

export default TopNavBar