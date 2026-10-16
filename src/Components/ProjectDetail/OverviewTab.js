import React from 'react';
import IdentitySection from './IdentitySection';
import TopBoxesSection from './TopBoxesSection';
import LaunchDetailsSection from './LaunchDetailsSection';
import MilestoneDocsSection from './MilestoneDocsSection';

/** ============ OVERVIEW TAB ============ */
const OverviewTab = ({ detail }) => {
    const { saveError, saving, savingAction, saveAs, status, goHome } = detail;

    return (
        <div className="cms-tab-panel">

            {saveError && <div className="cms-error-banner">{saveError}</div>}

            <IdentitySection detail={detail} />
            <TopBoxesSection detail={detail} />
            <LaunchDetailsSection detail={detail} />
            <MilestoneDocsSection detail={detail} />

            <div className="cms-save-bar">
                <button type="button" className="btn-secondary" onClick={goHome} disabled={saving}>Cancel</button>
                <button type="button" className="btn-primary" onClick={() => saveAs(status)} disabled={saving}>
                    {!(saving && savingAction === 'Save') && <span>Save</span>}
                    {saving && savingAction === 'Save' && <span><i className="fa fa-spinner fa-spin"></i>&nbsp; Saving…</span>}
                </button>
            </div>

        </div>
    );
};

export default OverviewTab;
