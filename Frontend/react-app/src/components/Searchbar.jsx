import React, { useState } from 'react';

const Searchbar = ({ keyword: keywordProp, onKeywordChange, onSearch }) => {
    // If props are provided, use controlled mode; otherwise manage own state
    const [localKeyword, setLocalKeyword] = useState('');
    const [category, setCategory] = useState('');
    const [experience, setExperience] = useState('');
    const [techStack, setTechStack] = useState('');

    const isControlled = keywordProp !== undefined;
    const keyword = isControlled ? keywordProp : localKeyword;
    const setKeyword = isControlled
        ? (val) => onKeywordChange && onKeywordChange(val)
        : setLocalKeyword;

    const categories = ['Engineering', 'Design', 'Marketing', 'Finance', 'Healthcare'];
    const experiences = ['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive'];
    const techStacks = ['React', 'Node.js', 'Python', 'Java', 'Flutter', 'Django'];

    const handleSearch = () => {
        if (onSearch) {
            onSearch({ keyword, category, experience, techStack });
        } else {
            console.log({ keyword, category, experience, techStack });
        }
    };

    return (
        <div className="w-full py-6 px-4 flex justify-center">
            <div className="w-full max-w-7xl flex items-center rounded-full border border-gray-300 bg-white shadow-md overflow-hidden">
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
                        className="w-full py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                    />
                </div>

                {/* Category */}
                <div className="border-r border-gray-200">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="py-3 px-4 text-sm text-gray-600 bg-transparent focus:outline-none cursor-pointer"
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
                        className="py-3 px-4 text-sm text-gray-600 bg-transparent focus:outline-none cursor-pointer"
                    >
                        <option value="">Experience</option>
                        {experiences.map((e) => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>
                </div>

                {/* Tech Stack */}
                <div className="border-r border-gray-200">
                    <select
                        value={techStack}
                        onChange={(e) => setTechStack(e.target.value)}
                        className="py-3 px-4 text-sm text-gray-600 bg-transparent focus:outline-none cursor-pointer"
                    >
                        <option value="">Tech Stack</option>
                        {techStacks.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="text-white font-semibold text-sm px-8 py-3 transition-colors duration-200"
                    style={{ background: '#1a3f5c' }}
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
