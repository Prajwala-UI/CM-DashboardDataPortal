import React, { useRef } from 'react';

/** ---- Project Identity ---- (names, subtitles, about, banners EN/KN, logo) */
const IdentitySection = ({ detail }) => {
    const { identity, updateIdentity, saving, bannerError, onBannerSelected, clearBanner, bannerDataUrl, onLogoSelected, clearLogo, logoDataUrl } = detail;
    const bannerEnInput = useRef(null);
    const bannerKnInput = useRef(null);
    const logoInput = useRef(null);

    const textField = (label, field, placeholder) => (
        <div className="cms-field">
            <label>{label}</label>
            <input type="text" value={identity[field]} onChange={(e) => updateIdentity(field, e.target.value)} disabled={saving} placeholder={placeholder} />
        </div>
    );

    const banner = (which, label, inputRef, alt) => {
        const value = which === 'en' ? identity.bannerEn : identity.bannerKn;
        return (
            <div className="cms-field cms-field-full">
                <label>{label}</label>
                <input ref={inputRef} type="file" accept="image/*" className="cms-hidden-file-input" onChange={(e) => onBannerSelected(which, e)} disabled={saving} />

                {!value && (
                    <div className="cms-banner-drop" onClick={() => inputRef.current.click()}>
                        <i className="fa fa-picture-o"></i>
                        <span>Click to upload a banner image</span>
                    </div>
                )}

                {value && (
                    <div className="cms-banner-preview">
                        <img src={bannerDataUrl(which)} alt={alt} />
                        <div className="cms-banner-overlay">
                            <button type="button" className="cms-media-pill" onClick={() => inputRef.current.click()} disabled={saving}>
                                <i className="fa fa-refresh"></i>&nbsp;Replace
                            </button>
                            <button type="button" className="cms-media-pill cms-media-pill-danger" onClick={() => clearBanner(which)} disabled={saving}>
                                <i className="fa fa-trash-o"></i>&nbsp;Remove
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="cms-section">
            <div className="cms-section-head">
                <div className="cms-section-title">Project Identity</div>
                <div className="cms-section-hint">Shown on the public dashboard. Both languages are required before publishing.</div>
            </div>
            <div className="cms-section-body">
                <div className="cms-grid-2">
                    {textField('Name of the Project (English)', 'nameEn', 'e.g. Gruha Lakshmi')}
                    {textField('ಯೋಜನೆಯ ಹೆಸರು (ಕನ್ನಡ)', 'nameKn', 'ಉದಾ. ಗೃಹ ಲಕ್ಷ್ಮಿ')}
                </div>
                <div className="cms-grid-2">
                    {textField('Project Subtitle (English)', 'taglineEn', 'One line describing the project')}
                    {textField('ಯೋಜನೆಯ ಉಪಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)', 'taglineKn', 'ಯೋಜನೆಯ ಒಂದು ಸಾಲಿನ ವಿವರಣೆ')}
                </div>
                <div className="cms-grid-2">
                    <div className="cms-field">
                        <label>About the Project (English) 30 Words</label>
                        <textarea rows={4} value={identity.aboutEn} onChange={(e) => updateIdentity('aboutEn', e.target.value)} disabled={saving} placeholder="Purpose, beneficiaries and intended outcome"></textarea>
                    </div>
                    <div className="cms-field">
                        <label>ಯೋಜನೆಯ ಬಗ್ಗೆ (ಕನ್ನಡ) 30 ಪದಗಳು</label>
                        <textarea rows={4} value={identity.aboutKn} onChange={(e) => updateIdentity('aboutKn', e.target.value)} disabled={saving} placeholder="ಉದ್ದೇಶ, ಫಲಾನುಭವಿಗಳು ಮತ್ತು ನಿರೀಕ್ಷಿತ ಫಲಿತಾಂಶ"></textarea>
                    </div>
                </div>

                {/* ---- Media & Branding ---- */}
                <div className="cms-subsection">

                    {bannerError && <div className="cms-error-banner">{bannerError}</div>}

                    {banner('en', 'Upload your Project Banner (English)', bannerEnInput, 'Project banner (English)')}
                    {banner('kn', 'ನಿಮ್ಮ ಯೋಜನೆಯ ಬ್ಯಾನರ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (ಕನ್ನಡ)', bannerKnInput, 'Project banner (Kannada)')}

                    <div className="cms-field cms-field-full cms-field-last">
                        <label>Project Logo</label>
                        <input ref={logoInput} type="file" accept="image/*" className="cms-hidden-file-input" onChange={onLogoSelected} disabled={saving} />

                        <div className="cms-logo-row">
                            <div className={`cms-logo-preview${!identity.projectLogo ? ' cms-logo-preview-empty' : ''}`}>
                                {identity.projectLogo && <img src={logoDataUrl()} alt="Project logo" />}
                                {!identity.projectLogo && <i className="fa fa-university"></i>}
                            </div>
                            <div className="cms-logo-meta">
                                <span className="cms-logo-hint">{identity.projectLogo ? 'Logo uploaded' : 'No logo uploaded yet'}</span>
                                <div className="cms-media-actions-row">
                                    <button type="button" className="cms-media-pill cms-media-pill-outline" onClick={() => logoInput.current.click()} disabled={saving}>
                                        <i className="fa fa-upload"></i>&nbsp;{identity.projectLogo ? 'Replace Logo' : 'Upload Logo'}
                                    </button>
                                    {identity.projectLogo && <span className="cms-doc-action-link cms-doc-remove" onClick={clearLogo}>Remove</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdentitySection;
