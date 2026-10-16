import React from 'react';
import SearchableSelect from '../Common/SearchableSelect';

/** Department + Designation dropdowns - shared by the Login and Reset Password views. */
const DeptDesignationFields = ({ login, searchSuffix = '' }) => {
    const { s, set, filteredDepartments, filteredDesignations, toggleDeptDropdown, selectDepartment, toggleDesigDropdown, selectDesignation } = login;

    return (
        <>
            {/* ============ Department ============ */}
            <div className="cmd-field">
                <label className="cmd-label">Department/Boards/Institutions</label>
                <SearchableSelect
                    open={s.deptDropdownOpen}
                    disabled={s.departmentsLoading}
                    loading={s.departmentsLoading}
                    hasValue={!!s.selectedDepartment}
                    displayText={s.selectedDepartment ? s.selectedDepartment.location_Name : (s.departmentsLoading ? 'Loading departments...' : 'Select department')}
                    onToggle={toggleDeptDropdown}
                    searchTerm={s.deptSearchTerm}
                    onSearchChange={(v) => set({ deptSearchTerm: v })}
                    searchPlaceholder="Search department..."
                    searchName={`deptSearch${searchSuffix}`}
                    options={filteredDepartments}
                    getKey={(d) => d.location_Code}
                    getLabel={(d) => d.location_Name}
                    isSelected={(d) => d.location_Code === s.selectedLocationCode}
                    onSelect={selectDepartment}
                    emptyText="No departments found"
                />
            </div>

            {/* ============ Designation ============ */}
            <div className="cmd-field">
                <label className="cmd-label">Designation</label>
                <SearchableSelect
                    open={s.desigDropdownOpen}
                    disabled={!s.selectedLocationCode || s.designationsLoading}
                    loading={s.designationsLoading}
                    hasValue={!!s.selectedDesignation}
                    displayText={s.selectedDesignation ? s.selectedDesignation.designation_Name :
                        (s.designationsLoading ? 'Loading designations...' :
                            (!s.selectedLocationCode ? 'Select department first' : 'Select designation'))}
                    onToggle={toggleDesigDropdown}
                    searchTerm={s.desigSearchTerm}
                    onSearchChange={(v) => set({ desigSearchTerm: v })}
                    searchPlaceholder="Search designation..."
                    searchName={`desigSearch${searchSuffix}`}
                    options={filteredDesignations}
                    getKey={(d) => d.postCode}
                    getLabel={(d) => d.designation_Name}
                    isSelected={(d) => d.postCode === s.selectedPostCode}
                    onSelect={selectDesignation}
                    emptyText="No designations found"
                />
            </div>
        </>
    );
};

export default DeptDesignationFields;
