import { useQuery } from '@tanstack/react-query';
import { cmdListOfAllUsersAndProjectsList } from '../API/cmdService';
import { buildNodalListPayload, isNodalListSuccess, toNodalSummaryVM } from '../Utils/nodalModel';
import {
    getCmdToken, getCmdPostCode, getCmdDeptCode, getCmdLocationCode, getCmdLocationName, getCmdLineDeptCode
} from '../Utils/cmdSession';
import { extractErrorMessage, devLog } from '../Utils/apiHelpers';

/**
 * cmd_List_of_all_users_and_projects_list (State_department_projects), shared by the
 * Nodal Dashboard and Nodal User Management screens.
 *  - adminDeptCode: the exact value each Angular screen sends ("" vs localStorage DEPT_CODE)
 *  - mapRows(res): screen-specific row mapping (res.projects vs res.data)
 *  - texts: { label, notSuccess, error } - the screen's log label and messages
 */
export const useNodalList = ({ screen, adminDeptCode, mapRows, texts }) => {
    const query = useQuery({
        queryKey: ['nodalList', screen, adminDeptCode],
        queryFn: async () => {
            // Built and logged exactly like the Angular screens - not the body that is sent.
            const body = buildNodalListPayload({
                postCode: getCmdPostCode(),
                deptCode: getCmdDeptCode(),
                locationCode: getCmdLocationCode(),
                locationName: getCmdLocationName(),
                lineDeptCode: getCmdLineDeptCode()
            });
            devLog(`[${texts.label}] cmd_List_of_all_users_and_projects_list request ->`, body);

            const payload = {
                "admin_Dept_Code": adminDeptCode
            };

            try {
                const res = await cmdListOfAllUsersAndProjectsList(payload, getCmdToken());
                devLog(`[${texts.label}] cmd_List_of_all_users_and_projects_list response <-`, res);

                if (!isNodalListSuccess(res)) {
                    return { loadError: (res && res.message) ? res.message : texts.notSuccess };
                }

                return { loadError: '', summary: toNodalSummaryVM(res), rows: mapRows(res) };
            } catch (err) {
                devLog(`[${texts.label}] cmd_List_of_all_users_and_projects_list error <-`, err);
                throw err;
            }
        }
    });

    const loading = query.isFetching;
    let loadError = '';
    if (!loading && query.error) {
        loadError = extractErrorMessage(query.error, texts.error);
    } else if (!loading && query.data?.loadError) {
        loadError = query.data.loadError;
    }

    // Angular keeps the last successful summary/rows when a later load fails
    const lastGood = query.data && !query.data.loadError ? query.data : null;

    return {
        loading,
        loadError,
        summary: lastGood ? lastGood.summary : null,
        rows: lastGood ? lastGood.rows : [],
        load: () => query.refetch(),
        dataUpdatedAt: query.dataUpdatedAt
    };
};
