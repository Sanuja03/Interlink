import React, { useState } from 'react';
import './FilterPanel.css';

const FilterPanel = ({ filters, onChange, onReset, expanded: expandedProp, onToggle }) => {
    // Support both controlled (from parent) and uncontrolled (own state) expand/collapse
    const [localExpanded, setLocalExpanded] = useState(true);
    const isControlled = expandedProp !== undefined;
    const expanded = isControlled ? expandedProp : localExpanded;
    const handleToggle = isControlled
        ? onToggle
        : () => setLocalExpanded((v) => !v);

    const { category, experience, mode } = filters;

    const categories = ['Engineering', 'Design', 'Marketing', 'Finance', 'Healthcare'];
    const experiences = ['Entry Level', 'Mid Level', 'Senior Level', 'Director'];
    const modes = ['Remote', 'Onsite', 'Hybrid'];

    const toggle = (field, value) => {
        onChange(field, filters[field] === value ? '' : value);
    };

    const hasFilters = category || experience || mode;

    return (
        <aside className={`fp-panel ${expanded ? 'fp-expanded' : 'fp-collapsed'}`}>

            {/* Header: icon + title + toggle button */}
            <div className="fp-header">
                <span className="fp-title">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    <span className="fp-title-text">Filters</span>
                </span>

                <button
                    className="fp-toggle"
                    onClick={handleToggle}
                    title={expanded ? 'Collapse filters' : 'Expand filters'}
                >
                    <svg
                        style={{ width: 14, height: 14, transition: 'transform 0.25s', transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)' }}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Everything below hides when collapsed */}
            <div className="fp-body">
                {hasFilters && (
                    <button className="fp-reset" onClick={onReset}>Clear all</button>
                )}

                {/* Work Mode */}
                <div className="fp-section">
                    <h4 className="fp-section-title">Work Mode</h4>
                    <div className="fp-pills">
                        {modes.map((m) => (
                            <button
                                key={m}
                                className={`fp-pill ${mode === m ? 'fp-pill--active' : ''}`}
                                onClick={() => toggle('mode', m)}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category */}
                <div className="fp-section">
                    <h4 className="fp-section-title">Category</h4>
                    <div className="fp-list">
                        {categories.map((c) => (
                            <label key={c} className="fp-check-row">
                                <input
                                    type="radio"
                                    name="category"
                                    checked={category === c}
                                    onChange={() => toggle('category', c)}
                                    className="fp-radio"
                                />
                                <span>{c}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Experience Level */}
                <div className="fp-section">
                    <h4 className="fp-section-title">Experience Level</h4>
                    <div className="fp-list">
                        {experiences.map((e) => (
                            <label key={e} className="fp-check-row">
                                <input
                                    type="radio"
                                    name="experience"
                                    checked={experience === e}
                                    onChange={() => toggle('experience', e)}
                                    className="fp-radio"
                                />
                                <span>{e}</span>
                            </label>
                        ))}
                    </div>
                </div>


            </div>
        </aside>
    );
};

export default FilterPanel;
