import React from 'react';

/**
 * The Login page's custom searchable dropdown (cmd-select markup from login.component.html).
 * Open/close state is owned by the parent, which also closes it on outside clicks.
 */
const SearchableSelect = ({
    open,
    disabled,
    loading,
    hasValue,
    displayText,
    onToggle,
    searchTerm,
    onSearchChange,
    searchPlaceholder,
    searchName,
    options,
    getKey,
    getLabel,
    isSelected,
    onSelect,
    emptyText
}) => (
    <div className={`cmd-select${open ? ' open' : ''}${disabled ? ' disabled' : ''}`}>

        <button type="button" className="cmd-select-trigger" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            <span className={`cmd-select-value${!hasValue ? ' placeholder' : ''}`}>
                {displayText}
            </span>

            {loading && (
                <span className="cmd-select-spinner">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle></svg>
                </span>
            )}
            {!loading && (
                <span className="cmd-select-chevron">
                    <svg viewBox="0 0 20 20"><path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
            )}
        </button>

        {open && (
            <div className="cmd-select-panel">
                <div className="cmd-select-search">
                    <input type="text" placeholder={searchPlaceholder} value={searchTerm} name={searchName}
                        onChange={(e) => onSearchChange(e.target.value)} onClick={(e) => e.stopPropagation()} />
                </div>

                <ul className="cmd-select-list">
                    {options.map(opt => (
                        <li key={getKey(opt)}
                            className={`cmd-select-option${isSelected(opt) ? ' selected' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onSelect(opt); }}>
                            {getLabel(opt)}
                        </li>
                    ))}
                    {options.length === 0 && <li className="cmd-select-empty">{emptyText}</li>}
                </ul>
            </div>
        )}

    </div>
);

export default SearchableSelect;
