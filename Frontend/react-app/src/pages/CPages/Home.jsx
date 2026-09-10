import React from 'react';
import Sidebar from '../../components/CandidatePages/CandidateDashboard/Sidebar';
import Searchbar from '../../components/CandidatePages/CandidateJobPosts/Searchbar';
import HeroSection from '../../components/CandidatePages/CandidateHome/Herosection';
import Footer from '../../components/CandidatePages/CandidateDashboard/Footer';

const Home = () => {
    return (
        <div className="min-h-screen flex bg-gray-50 gap-3 sm:gap-6 lg:gap-10">
            <Sidebar />

            <main className="flex-1 min-w-0 overflow-y-auto">
                <Searchbar />
                <HeroSection />
                <Footer />
            </main>
        </div>
    );
};

export default Home;
