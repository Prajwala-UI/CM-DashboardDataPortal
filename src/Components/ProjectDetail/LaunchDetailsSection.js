import React from 'react';

/** ---- Launch Details ---- dates (native yyyy-MM-dd input, sent as DD-MM-YYYY) and EN/KN targets. */
const LaunchDetailsSection = ({ detail }) => {
    const { launch, updateLaunch, saving } = detail;

    const targetRow = (label, field, placeholder) => (
        <tr>
            <td className="cms-row-label">{label}</td>
            <td><textarea rows={2} className="cms-target-textarea" value={launch[field]} onChange={(e) => updateLaunch(field, e.target.value)} disabled={saving} placeholder={placeholder}></textarea></td>
        </tr>
    );

    return (
        <div className="cms-section">
            <div className="cms-section-head">
                <div className="cms-section-title">Launch Details</div>
            </div>
            <table className="cms-table">
                <thead>
                    <tr>
                        <th style={{ width: '40%' }}>Title</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="cms-row-label">Approval Date</td>
                        <td><input type="date" className="cms-date-input" value={launch.approvalDate || ''} onChange={(e) => updateLaunch('approvalDate', e.target.value || null)} disabled={saving} /></td>
                    </tr>
                    <tr>
                        <td className="cms-row-label">Launch Date</td>
                        <td><input type="date" className="cms-date-input" value={launch.launchDate || ''} onChange={(e) => updateLaunch('launchDate', e.target.value || null)} disabled={saving} /></td>
                    </tr>
                    {targetRow('Physical Target (En)', 'physicalTarget', 'e.g. 500 KM of road, 12 bridges')}
                    {targetRow('Financial Target (En)', 'financialTarget', 'e.g. ₹120 Cr')}
                    {targetRow('Physical Target (Kn)', 'physicalTargetKn', 'ಉದಾ. 500 ಕಿ.ಮೀ ರಸ್ತೆ, 12 ಸೇತುವೆಗಳು')}
                    {targetRow('Financial Target (Kn)', 'financialTargetKn', 'ಉದಾ. ₹120 ಕೋಟಿ')}
                </tbody>
            </table>
        </div>
    );
};

export default LaunchDetailsSection;
