import React from 'react';
import Sidebar from '../components/CandidateDashboard/Sidebar';
import Searchbar from '../components/CandidateJobPosts/Searchbar';
import HeroSection from '../components/CandidateHome/Herosection';
import Footer from '../components/CandidateDashboard/Footer';

const Home = () => {
    return (
        <div className="min-h-screen flex bg-gray-50" style={{ gap: "2.5rem" }}>
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Search Bar */}
                <Searchbar />

                {/* Hero Section */}
                <HeroSection />

                {/* Footer */}
                <Footer />
            </main>
        </div>
    );
};

export default Home;
