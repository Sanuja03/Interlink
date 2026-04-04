import React, { useState } from 'react';

const Searchbar = ({ keyword: keywordProp, onKeywordChange, onSearch }) => {
    // If a keyword prop is passed in, let the parent control it — otherwise we'll track it ourselves
    const [localKeyword, setLocalKeyword] = useState('');
    const [category, setCategory] = useState('');
    const [experience, setExperience] = useState('');

    const isControlled = keywordProp !== undefined;
    const keyword = isControlled ? keywordProp : localKeyword;
    const setKeyword = isControlled
        ? (val) => onKeywordChange && onKeywordChange(val)
        : setLocalKeyword;

    const categories = ['Engineering', 'Design', 'Marketing', 'Finance', 'Healthcare'];
    const experiences = ['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive'];

    const handleSearch = () => {
        if (onSearch) {
            onSearch({ keyword, category, experience });
        } else {
            // We're on the Home page with no parent handler, so just redirect to the job posts page with the search filters in the URL
            const params = new URLSearchParams();
            if (keyword) params.set('keyword', keyword);
            if (category) params.set('category', category);
            if (experience) params.set('experience', experience);
            const query = params.toString();
            window.location.href = `/job-posts${query ? '?' + query : ''}`;
        }
    };

    return (
        <div className="w-full py-6 px-4 flex justify-center">
            <div className="w-full max-w-7xl flex items-center rounded-full border border-gray-300 bg-white shadow-md overflow-hidden focus-within:outline-none focus-within:ring-0">
                {/* Search Icon + Input */}
                <div className="flex items-center px-4 flex-1 border-r border-gray-200">
                    <svg className="w-5 h-5 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 border-none bg-transparent"
                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    />
                </div>

                {/* Category */}
                <div className="border-r border-gray-200">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="py-3 px-4 text-sm text-gray-600 bg-transparent focus:outline-none focus:ring-0 cursor-pointer"
                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    >
                        <option value="">Category</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* Experience */}
                <div className="border-r border-gray-200">
                    <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="py-3 px-4 text-sm text-gray-600 bg-transparent focus:outline-none focus:ring-0 cursor-pointer"
                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    >
                        <option value="">Experience</option>
                        {experiences.map((e) => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>
                </div>


                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="text-white font-semibold text-sm px-8 py-3 transition-colors duration-200 focus:outline-none focus:ring-0"
                    style={{ background: '#1a3f5c', outline: 'none', border: 'none', boxShadow: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#142d42'}
                    onMouseLeave={e => e.currentTarget.style.background = '#1a3f5c'}
                >
                    Search
                </button>
            </div>
        </div>
    );
};

export default Searchbar;
