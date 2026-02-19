import React from 'react';
import Navbar from '../components/Navbar';
import Searchbar from '../components/Searchbar';
import HeroSection from '../components/Herosection';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Navigation Bar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-1">
                {/* Search Bar */}
                <Searchbar />

                {/* Hero Section */}
                <HeroSection />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Home;
