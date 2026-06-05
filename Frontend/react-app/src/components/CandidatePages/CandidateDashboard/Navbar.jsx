import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/logo.png';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { label: 'HOME', path: '/' },
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Job Posts', path: '/candidate/jobposts' },
        { label: 'Calender', path: '/calender' },
        { label: 'profile', path: '/profile' },
        { label: 'Logout', path: '/logout' },
    ];

    return (
        <nav className="w-full bg-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <img
                        src={logo}
                        alt="Interlink Logo"
                        className="h-12 w-auto object-contain"
                    />
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        to="/help"
                        className="text-gray-700 font-medium text-sm hover:text-blue-700 transition-colors duration-200"
                    >
                        Help
                    </Link>
                    <Link
                        to="/signin"
                        className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors duration-200"
                    >
                        Sign In
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden text-gray-700 focus:outline-none"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {menuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-gray-100 px-6 pb-4">
                    <div className="flex flex-col gap-3">
                        <Link
                            to="/help"
                            className="text-gray-700 font-medium text-sm hover:text-blue-700 transition-colors"
                            onClick={() => setMenuOpen(false)}
                        >
                            Help
                        </Link>
                        <Link
                            to="/signin"
                            className="text-blue-700 font-semibold text-sm hover:text-blue-900 transition-colors"
                            onClick={() => setMenuOpen(false)}
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
