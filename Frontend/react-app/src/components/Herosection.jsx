import React from 'react';

const HeroSection = () => {
    return (
        <section className="w-full py-4 px-4 flex justify-center">
            <div className="relative w-full max-w-7xl rounded-2xl overflow-hidden shadow-lg" style={{ minHeight: '420px' }}>
                {/* Background Image */}
                <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                    alt="Team of professionals"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ minHeight: '420px' }}
                />

                {/* Subtle dark overlay */}
                <div className="absolute inset-0 bg-black/10" />

                {/* Decorative blobs */}
                <div className="absolute top-6 right-8 w-6 h-6 rounded-full bg-blue-300/60" />
                <div className="absolute top-20 left-6 w-4 h-4 rounded-full bg-gray-400/50" />
                <div className="absolute bottom-20 left-4 w-8 h-8 rounded-full bg-gray-300/60" />

                {/* Banner Overlay */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4">
                    <button
                        className="w-full py-5 text-white font-bold text-2xl tracking-wide rounded-lg shadow-lg active:scale-95 transition-all duration-200"
                        style={{ background: 'linear-gradient(to right, #1a6a82, #1a3f5c)' }}
                        onClick={() => window.location.href = '/job-posts'}
                    >
                        Find Your Job
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
