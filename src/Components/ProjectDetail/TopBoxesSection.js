import React from 'react';

/** ---- Dashboard Top Boxes ---- repeatable title/value pairs with "+ Add More". */
const TopBoxesSection = ({ detail }) => {
    const { topBoxes, updateTopBox, removeTopBox, addTopBox, saving } = detail;

    const field = (box, i, label, key) => (
        <div className="cms-field cms-field-sm">
            <label>{label}</label>
            <input type="text" value={box[key]} onChange={(e) => updateTopBox(i, key, e.target.value)} disabled={saving} />
        </div>
    );

    return (
        <div className="cms-section">
            <div className="cms-section-head">
                <div className="cms-section-title">Dashboard Top Boxes</div>
                <div className="cms-section-hint">Small stat tiles shown at the top of the public dashboard.</div>
            </div>
            <div className="cms-section-body">
                <div className="cms-topbox-grid">
                    {topBoxes.map((box, i) => (
                        <div className="cms-topbox-card" key={i}>
                            <div className="cms-topbox-card-head">
                                <span className="cms-topbox-card-label">Box {i + 1}</span>
                                {topBoxes.length > 1 && (
                                    <button type="button" className="cms-topbox-remove" onClick={() => removeTopBox(i)} disabled={saving} title="Remove this box">
                                        <i className="fa fa-trash-o"></i>
                                    </button>
                                )}
                            </div>

                            {field(box, i, 'Title (English)', 'titleEn')}
                            {field(box, i, 'ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)', 'titleKn')}
                            {field(box, i, 'Value (English)', 'valueEn')}
                            {field(box, i, 'ಮೌಲ್ಯ (ಕನ್ನಡ)', 'valueKn')}
                        </div>
                    ))}
                </div>

                <button type="button" className="btn-primary" onClick={addTopBox} disabled={saving}>+ Add More</button>
            </div>
        </div>
    );
};

export default TopBoxesSection;
