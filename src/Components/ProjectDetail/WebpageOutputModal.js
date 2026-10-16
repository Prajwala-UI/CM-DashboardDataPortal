import React, { useMemo, useState } from 'react';
import CmsModal from '../Common/CmsModal';
import { OUTPUT_LABELS } from './outputLabels';
import { KARNATAKA_REGIONS } from '../../Utils/karnatakaMapData';
import { toDdMmYyyy } from '../../Utils/projectModel';

/** Splits a free-text Physical/Financial Target field into lines. */
const splitLines = (text) => (text || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);

/** Approval / Launch Date shown as DD-MM-YYYY in this read-only view. */
const formatDisplayDate = (isoDate) => toDdMmYyyy(isoDate || null) || '';

/** true once a district has a real (non-empty, non-zero) value entered. */
const isDistrictFilled = (value) => {
    const v = (value || '').trim();
    return v.length > 0 && v !== '0';
};

/** Flat, alphabetical list of every known district (value "" when the API returned none for it),
 *  plus any API district not in the known list. */
const sortDistricts = (districtRows) => {
    const byName = new Map();
    districtRows.forEach(r => byName.set((r.district || '').trim().toLowerCase(), r));

    const known = new Set();
    const merged = [];

    KARNATAKA_REGIONS.forEach(region => {
        region.districts.forEach(name => {
            const key = name.trim().toLowerCase();
            if (known.has(key)) {
                return;
            }
            known.add(key);
            const match = byName.get(key);
            merged.push({ district: name, value: match ? match.value : '' });
        });
    });

    districtRows.forEach(r => {
        const key = (r.district || '').trim().toLowerCase();
        if (!known.has(key)) {
            known.add(key);
            merged.push({ district: r.district, value: r.value });
        }
    });

    return merged.sort((a, b) => a.district.localeCompare(b.district));
};

/** ================= VIEW WEBPAGE OUTPUT MODAL ================= (mounted fresh on every open: EN, tile view, flyout closed) */
const WebpageOutputModal = ({ detail, kpis, selectedDistrict, setSelectedDistrict }) => {
    const { identity, topBoxes, launch, bannerDataUrl, missionDocRows, openDocPreview, closeWebpageOutputModal } = detail;
    const { stateKpis, selectedStateKpiId, onSelectedStateKpiChange, districtRows } = kpis;

    const [webpageOutputLang, setWebpageOutputLang] = useState('en');
    const [outputTileView, setOutputTileView] = useState('tile');
    const [isMissionDocsFlyoutOpen, setIsMissionDocsFlyoutOpen] = useState(false);

    const en = webpageOutputLang === 'en';
    const outputLabel = (key) => {
        const entry = OUTPUT_LABELS[key];
        if (!entry) {
            return key;
        }
        return webpageOutputLang === 'kn' ? entry.kn : entry.en;
    };

    const districtRowsSorted = useMemo(() => sortDistricts(districtRows), [districtRows]);

    const selectDistrict = (name) => setSelectedDistrict(selectedDistrict === name ? null : name);

    const kpiFigures = (row) => (
        <div className="cms-output-kpi-figures">
            {row.data.map((entry, j) => (
                <div className="cms-output-kpi-pair" key={j}>
                    {entry.date && <div className="cms-output-kpi-pair-header">{entry.date}</div>}
                    <div className="cms-output-kpi-pair-figures">
                        <div><span className="cms-output-kpi-figure-label">{outputLabel('target')}{row.data.length > 1 && <span>&nbsp;{j + 1}</span>}</span><br />{entry.target || outputLabel('comingSoon')}</div>
                        <div><span className="cms-output-kpi-figure-label">{outputLabel('actual')}{row.data.length > 1 && <span>&nbsp;{j + 1}</span>}</span><br />{entry.value || outputLabel('comingSoon')}</div>
                    </div>
                </div>
            ))}
        </div>
    );

    const kpiIcon = (row) => (
        <div className="cms-output-kpi-icon">
            {row.logo && <img src={'data:image/png;base64,' + row.logo} alt="" />}
            {!row.logo && <i className="fa fa-bar-chart"></i>}
        </div>
    );

    const kpiNameWrap = (row) => (
        <div className="cms-output-kpi-name-wrap">
            <div className="cms-output-kpi-name">{row.kpiName}</div>
            {row.unit && <div className="cms-output-kpi-unit">{row.unit}</div>}
        </div>
    );

    return (
        <CmsModal onClose={closeWebpageOutputModal} className="cms-modal-xl">
            <div className="cms-modal-header">
                <div className="cms-modal-title">{outputLabel('modalTitle')}</div>
                <div className="cms-output-lang-toggle cms-output-lang-toggle-inline">
                    <button type="button" className={`cms-output-lang-btn${en ? ' active' : ''}`} onClick={() => setWebpageOutputLang('en')}>EN</button>
                    <button type="button" className={`cms-output-lang-btn${!en ? ' active' : ''}`} onClick={() => setWebpageOutputLang('kn')}>ಕನ್ನಡ</button>
                </div>
                <button type="button" className="cms-modal-close" onClick={closeWebpageOutputModal} title="Close">
                    <i className="fa fa-times"></i>
                </button>
            </div>

            <div className="cms-output-body cms-output-dashboard" onClick={() => setIsMissionDocsFlyoutOpen(false)}>

                {/* ============ Hero banner ============ */}
                <div className="cms-output-hero">
                    {en && (
                        <>
                            {identity.bannerEn && <img className="cms-output-hero-img" src={bannerDataUrl('en')} alt="Project banner" />}
                            {!identity.bannerEn && (
                                <div className="cms-output-hero-empty">
                                    <i className="fa fa-picture-o"></i>
                                    <span>{outputLabel('noBannerEn')}</span>
                                    <div className="cms-output-hero-title-standalone">{identity.nameEn || '(Untitled project)'}</div>
                                </div>
                            )}
                        </>
                    )}

                    {!en && (
                        <>
                            {identity.bannerKn && <img className="cms-output-hero-img" src={bannerDataUrl('kn')} alt="Project banner" />}
                            {!identity.bannerKn && (
                                <div className="cms-output-hero-empty">
                                    <i className="fa fa-picture-o"></i>
                                    <span>{outputLabel('noBannerKn')}</span>
                                    <div className="cms-output-hero-title-standalone">{identity.nameKn || identity.nameEn || '(Untitled project)'}</div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ============ Dashboard Top Boxes ============ */}
                {topBoxes.length > 0 && (
                    <div className="cms-output-stat-row">
                        {topBoxes.map((box, i) => (
                            <div className={`cms-output-stat-card cms-output-stat-card-${i % 5}`} key={i}>
                                <div className="cms-output-stat-title">{(en ? box.titleEn : box.titleKn) || '—'}</div>
                                <div className="cms-output-stat-value">{(en ? box.valueEn : box.valueKn) || '—'}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ============ About / Launch Details / Mission Delivery Index ============ */}
                <div className="cms-output-triple-row">

                    <div className="cms-output-panel">
                        <div className="cms-output-panel-title"><i className="fa fa-leaf cms-output-panel-icon"></i> {outputLabel('aboutMission')}</div>
                        <p className="cms-output-about-text">{(en ? identity.aboutEn : identity.aboutKn) || outputLabel('noDescription')}</p>
                        <a className="cms-output-readmore">{outputLabel('readMore')} <i className="fa fa-long-arrow-right"></i></a>
                    </div>

                    <div className="cms-output-panel">
                        <div className="cms-output-panel-title">{outputLabel('launchDetails')}</div>
                        <div className="cms-output-launch-scroll">
                            <div className="cms-output-launch-row">
                                <span className="cms-output-launch-label">{outputLabel('approvalDate')}</span>
                                <span>{formatDisplayDate(launch.approvalDate) || '—'}</span>
                            </div>
                            <div className="cms-output-launch-row">
                                <span className="cms-output-launch-label">{outputLabel('launchDate')}</span>
                                <span>{formatDisplayDate(launch.launchDate) || '—'}</span>
                            </div>
                            <div className="cms-output-launch-row">
                                <span className="cms-output-launch-label">{outputLabel('physicalTarget')}</span>
                                <span>{splitLines(en ? launch.physicalTarget : (launch.physicalTargetKn || launch.physicalTarget)).join(', ') || '—'}</span>
                            </div>
                            <div className="cms-output-launch-row">
                                <span className="cms-output-launch-label">{outputLabel('financialTarget')}</span>
                                <span>{splitLines(en ? launch.financialTarget : (launch.financialTargetKn || launch.financialTarget)).join(', ') || '—'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="cms-output-panel">
                        <div className="cms-output-panel-title">{outputLabel('missionDeliveryIndex')}</div>
                        {/* NOTE: static placeholder content, as in the Angular source - the API doesn't provide a delivery-index score. */}
                        <div className="cms-output-mdi-bar">
                            <span className="cms-output-mdi-score">+0.56</span>
                            <span className="cms-output-mdi-tag">{outputLabel('ahead')}</span>
                        </div>
                        <div className="cms-output-mdi-tracked-label">{outputLabel('kpisTracked')}</div>
                        <div className="cms-output-mdi-tracked-value">{stateKpis.length || 5}</div>
                        <div className="cms-output-mdi-chips">
                            <div className="cms-output-mdi-chip cms-output-mdi-chip-ahead">
                                <span>{outputLabel('ahead')}</span>
                                <strong>5</strong>
                                <em>100%</em>
                            </div>
                            <div className="cms-output-mdi-chip cms-output-mdi-chip-ontime">
                                <span>{outputLabel('onTime')}</span>
                                <strong>0</strong>
                                <em>0%</em>
                            </div>
                            <div className="cms-output-mdi-chip cms-output-mdi-chip-behind">
                                <span>{outputLabel('behind')}</span>
                                <strong>0</strong>
                                <em>0%</em>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ============ District Performance / Live Mission Dashboard ============ */}
                <div className="cms-output-double-row">

                    <div className="cms-output-panel">
                        <div className="cms-output-panel-title-row">
                            <span><i className="fa fa-map-o"></i> {outputLabel('districtPerformance')}</span>
                        </div>
                        <div className="cms-output-panel-hint">{outputLabel('districtPerformanceSub')}</div>

                        {stateKpis.length > 0 && (
                            <div className="cms-select-wrap cms-output-district-select">
                                <select className="cms-select" value={selectedStateKpiId} onChange={(e) => onSelectedStateKpiChange(e.target.value)}>
                                    {stateKpis.map(k => <option key={k.kpiId} value={k.kpiId}>{k.kpiName}</option>)}
                                </select>
                            </div>
                        )}

                        {stateKpis.length === 0 && <div className="cms-state-msg">{outputLabel('noStateKpis')}</div>}
                        {stateKpis.length > 0 && districtRows.length === 0 && <div className="cms-state-msg">{outputLabel('noDistrictData')}</div>}

                        {/* Flat, alphabetically-sorted district tile grid driven by the real district KPI values */}
                        {districtRows.length > 0 && (
                            <div className="cms-district-grid-wrap">
                                <div className="cms-district-tile-grid">
                                    {districtRowsSorted.map(row => (
                                        <div key={row.district}
                                            className={`cms-district-tile${isDistrictFilled(row.value) ? ' cms-district-tile-filled' : ''}${selectedDistrict === row.district ? ' is-selected' : ''}`}
                                            onClick={() => selectDistrict(row.district)}
                                            title={row.district + ': ' + (row.value || outputLabel('notFilled'))}>
                                            <div className="cms-district-tile-name">{row.district}</div>
                                            <div className="cms-district-tile-value">{row.value || '—'}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="legend-row" style={{ marginTop: '6px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', borderTop: '1px solid #F1EAD6', paddingTop: '12px' }}>
                                    <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#C3F6CB', border: '1px solid #8bc34a' }}></div>
                                        <div style={{ fontWeight: 600, color: '#555', fontSize: '12px' }}>{outputLabel('valueEntered')}</div>
                                    </div>
                                    <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#F5F0E2', border: '1px solid #D8CBA8' }}></div>
                                        <div style={{ fontWeight: 600, color: '#555', fontSize: '12px' }}>{outputLabel('notFilled')}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="cms-output-panel">
                        <div className="cms-output-panel-title-row">
                            <span>{outputLabel('liveMissionDashboard')}</span>
                            <button type="button" className="cms-output-view-toggle" onClick={() => setOutputTileView(outputTileView === 'tile' ? 'table' : 'tile')}>
                                {outputTileView === 'tile' ? outputLabel('tableView') : outputLabel('tileView')}
                            </button>
                        </div>

                        {stateKpis.length === 0 && <div className="cms-state-msg">{outputLabel('noStateKpis')}</div>}

                        {/* Tile view: one row per KPI with every target/value pair */}
                        {outputTileView === 'tile' && stateKpis.length > 0 && (
                            <div className="cms-output-kpi-list">
                                {stateKpis.map(row => (
                                    <div className="cms-output-kpi-row" key={row.kpiId}>
                                        {kpiIcon(row)}
                                        {kpiNameWrap(row)}
                                        {kpiFigures(row)}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Table view: 2-column card grid */}
                        {outputTileView === 'table' && stateKpis.length > 0 && (
                            <div className="cms-output-kpi-grid">
                                {stateKpis.map(row => (
                                    <div className="cms-output-kpi-card" key={row.kpiId}>
                                        <div className="cms-output-kpi-card-head">
                                            {kpiIcon(row)}
                                            {kpiNameWrap(row)}
                                        </div>
                                        {kpiFigures(row)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* ============ Quick links row ============ */}
                <div className="cms-output-quicklinks">
                    <div className="cms-output-quicklink">
                        <i className="fa fa-map-marker"></i>
                        <div>
                            <div className="cms-output-quicklink-title">{outputLabel('districtDashboardTitle')}</div>
                            <div className="cms-output-quicklink-sub">{outputLabel('districtDashboardSub')}</div>
                        </div>
                    </div>
                    <div className="cms-output-quicklink">
                        <i className="fa fa-line-chart"></i>
                        <div>
                            <div className="cms-output-quicklink-title">{outputLabel('liveAnalyticsTitle')}</div>
                            <div className="cms-output-quicklink-sub">{outputLabel('liveAnalyticsSub')}</div>
                        </div>
                    </div>
                    <div className="cms-output-quicklink cms-output-quicklink-docs" onClick={(e) => { e.stopPropagation(); setIsMissionDocsFlyoutOpen(!isMissionDocsFlyoutOpen); }}>
                        <i className="fa fa-file-text-o"></i>
                        <div>
                            <div className="cms-output-quicklink-title">{outputLabel('missionDocsTitle')}</div>
                            <div className="cms-output-quicklink-sub">{outputLabel('missionDocsSub')}</div>
                        </div>

                        {isMissionDocsFlyoutOpen && (
                            <div className="cms-output-docs-flyout" onClick={(e) => e.stopPropagation()}>
                                {missionDocRows.map(row => (
                                    <div className="cms-output-docs-flyout-row" key={row.key}>
                                        {!row.value && <span>{row.label}</span>}
                                        {row.value && <a onClick={() => openDocPreview(row.key, row.label)}>{row.label}</a>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="cms-output-quicklink">
                        <i className="fa fa-download"></i>
                        <div>
                            <div className="cms-output-quicklink-title">{outputLabel('downloadReportTitle')}</div>
                            <div className="cms-output-quicklink-sub">{outputLabel('downloadReportSub')}</div>
                        </div>
                    </div>
                </div>

            </div>
        </CmsModal>
    );
};

export default WebpageOutputModal;
