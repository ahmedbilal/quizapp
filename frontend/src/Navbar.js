import { Link } from "react-router-dom";
import { connect } from "react-redux";
import React from "react";

function Navbar(props) {
    const authenticationLinks = props.token ? (
        <React.Fragment>
            <li className="nav-item">
                <Link to="/accounts/logout" className="pr-5 hover:font-bold">Logout</Link>
            </li>
        </React.Fragment>
    ) : (
        <React.Fragment>
            <li className="nav-item">
                <Link to="/accounts/login" className="pr-5 hover:font-bold">Login</Link>
            </li>
            <li className="nav-item">
                <Link to="/accounts/signup" className="pr-5 hover:font-bold">Signup</Link>
            </li>
        </React.Fragment>
    )
    return (
        <nav className="flex flex-row bg-black text-white p-4">
            <Link to="/" className="text-xl">Quiz</Link>
            <ul className="flex flex-row ml-4 items-center">
                <li className="pr-5">
                    <Link to="/" className="hover:font-bold" aria-current="page">Home</Link>
                </li>
                {authenticationLinks}
            </ul>
    </nav>
    )
}

function mapStateToProps(state) {
    return {
        token: state.TOKEN
    }
}

export default connect(mapStateToProps)(Navbar)