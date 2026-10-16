import React, { useRef, useState } from 'react';
import CmsModal from '../Common/CmsModal';
import { cmdAddNewProject } from '../../API/cmdService';
import { buildAddProjectPayload } from '../../Utils/projectModel';
import { getCmdToken } from '../../Utils/cmdSession';
import { extractErrorMessage, isSuccess } from '../../Utils/apiHelpers';

const EMPTY_PROJECT = { nameEn: '', nameKn: '', taglineEn: '', taglineKn: '', logoFileName: '', logoBase64: '' };

/** 9) cmd_add_new_project - "Add Project" modal (home.component). Mounted fresh on every open. */
const AddProjectModal = ({ postCode, onClose, onAdded }) => {
    const [newProject, setNewProject] = useState(EMPTY_PROJECT);
    const [addSubmitting, setAddSubmitting] = useState(false);
    const [addError, setAddError] = useState('');
    const [addSuccessMsg, setAddSuccessMsg] = useState('');
    const logoInput = useRef(null);

    const update = (patch) => setNewProject(prev => ({ ...prev, ...patch }));
    const locked = addSubmitting || !!addSuccessMsg;

    const closeAddModal = () => {
        if (addSubmitting) {
            return;
        }
        onClose();
    };

    const onLogoSelected = (event) => {
        const input = event.target;
        const file = input.files && input.files[0];

        if (!file) {
            return;
        }

        update({ logoFileName: file.name });

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const commaIdx = result.indexOf(',');
            // base64 payload of the selected logo (data-URL prefix stripped)
            update({ logoBase64: commaIdx !== -1 ? result.substring(commaIdx + 1) : result });
        };
        reader.readAsDataURL(file);
    };

    const clearLogo = () => update({ logoFileName: '', logoBase64: '' });

    const submitAddProject = async () => {
        setAddError('');
        setAddSuccessMsg('');

        if (!newProject.nameEn.trim() || !newProject.nameKn.trim()) {
            setAddError('Please enter the project name in both English and Kannada.');
            return;
        }

        setAddSubmitting(true);

        const payload = buildAddProjectPayload(postCode, {
            nameEn: newProject.nameEn.trim(),
            nameKn: newProject.nameKn.trim(),
            taglineEn: newProject.taglineEn.trim(),
            taglineKn: newProject.taglineKn.trim(),
            logoBase64: newProject.logoBase64
        });

        try {
            const res = await cmdAddNewProject(payload, getCmdToken());
            setAddSubmitting(false);

            if (res && isSuccess(res)) {
                setAddSuccessMsg(res.message || 'Project added successfully.');

                // refresh the cards list right away in the background, then give the user
                // a moment to see the success message before closing.
                onAdded();

                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setAddError((res && res.message) ? res.message : 'Could not add the project. Please try again.');
            }
        } catch (err) {
            setAddSubmitting(false);
            setAddError(extractErrorMessage(err, 'Could not add the project. Please try again.'));
        }
    };

    return (
        <CmsModal onClose={closeAddModal}>

            <div className="cms-modal-header">
                <div className="cms-modal-header-row">
                    <div className="cms-modal-title">Add Project</div>
                    <button type="button" className="cms-modal-close" onClick={closeAddModal} disabled={addSubmitting} title="Close">
                        <i className="fa fa-times"></i>
                    </button>
                </div>
                <div className="cms-modal-subtitle">Create a new project for Government Grants To Private Institution</div>
            </div>

            <div className="cms-modal-body">

                {addError && <div className="cms-error-banner">{addError}</div>}
                {addSuccessMsg && (
                    <div className="cms-success-banner">
                        <i className="fa fa-check-circle"></i>&nbsp; {addSuccessMsg}
                    </div>
                )}

                <div className="cms-field">
                    <label>Name of the Project (English)</label>
                    <input type="text" placeholder="e.g. Gruha Lakshmi" value={newProject.nameEn}
                        onChange={(e) => update({ nameEn: e.target.value })} disabled={locked} />
                </div>

                <div className="cms-field">
                    <label>ಯೋಜನೆಯ ಹೆಸರು (ಕನ್ನಡ)</label>
                    <input type="text" placeholder="ಉದಾ. ಗೃಹ ಲಕ್ಷ್ಮಿ" value={newProject.nameKn}
                        onChange={(e) => update({ nameKn: e.target.value })} disabled={locked} />
                </div>

                <div className="cms-field">
                    <label>Project Tagline (English)</label>
                    <input type="text" placeholder="One line describing the project" value={newProject.taglineEn}
                        onChange={(e) => update({ taglineEn: e.target.value })} disabled={locked} />
                </div>

                <div className="cms-field">
                    <label>ಯೋಜನೆಯ ಘೋಷವಾಕ್ಯ (ಕನ್ನಡ)</label>
                    <input type="text" placeholder="ಯೋಜನೆಯ ಒಂದು ಸಾಲಿನ ವಿವರಣೆ" value={newProject.taglineKn}
                        onChange={(e) => update({ taglineKn: e.target.value })} disabled={locked} />
                </div>

                <div className="cms-field">
                    <label>Add Project Logo</label>
                    <div className="cms-upload-wrap">
                        <input ref={logoInput} type="file" accept="image/*" className="cms-hidden-file-input"
                            onChange={onLogoSelected} disabled={locked} />
                        <div className="cms-upload-box" onClick={() => logoInput.current.click()}>
                            {!newProject.logoFileName && <span>Attach your project logo</span>}
                            {newProject.logoFileName && <span>{newProject.logoFileName}</span>}
                            <i className="fa fa-arrow-up"></i>
                        </div>
                        {newProject.logoFileName && (
                            <span className="cms-doc-action-link cms-doc-remove" onClick={clearLogo}>Remove</span>
                        )}
                    </div>
                </div>

            </div>

            <div className="cms-modal-footer">
                <button type="button" className="btn-secondary" onClick={closeAddModal} disabled={locked}>Cancel</button>
                <button type="button" className="btn-primary" onClick={submitAddProject} disabled={locked}>
                    {!addSubmitting && <span>Submit</span>}
                    {addSubmitting && <span><i className="fa fa-spinner fa-spin"></i>&nbsp; Saving…</span>}
                </button>
            </div>

        </CmsModal>
    );
};

export default AddProjectModal;
