import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cmdAllProjectList } from '../API/cmdService';
import { toProjectCardVM } from '../Utils/projectModel';
import { getCmdToken } from '../Utils/cmdSession';
import { extractErrorMessage, isSuccess, devLog } from '../Utils/apiHelpers';

/**
 * Angular HomeComponent.loadProjects() - 8) cmd_all_project_list
 * BODY: { postCode }  RESPONSE: { status_code, status: "success", ..., total_KPI, projects: [...] }
 */
export const useProjects = (postCode, deptName) => {
    const queryClient = useQueryClient();
    const queryKey = ['projects', postCode];

    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await cmdAllProjectList({ postCode }, getCmdToken());
            devLog('List of All Project List', res);

            const rows = (res && isSuccess(res) && Array.isArray(res.projects)) ? res.projects : [];
            return {
                projects: rows.map((row) => toProjectCardVM(row, deptName)),
                totalKpiCount: (res && typeof res.total_KPI === 'number') ? res.total_KPI : null
            };
        }
    });

    // Angular shows the loading message on every (re)load, not only the first one
    const loading = query.isFetching;
    const loadError = !loading && query.error ? extractErrorMessage(query.error, 'Could not load projects. Please try again.') : '';

    /** Drop a card immediately (after delete), before the refetch completes. */
    const removeProjectLocally = (projectId) => {
        queryClient.setQueryData(queryKey, (old) => old ? { ...old, projects: old.projects.filter(p => p.projectId !== projectId) } : old);
    };

    return {
        projects: query.data?.projects || [],
        totalKpiCount: query.data?.totalKpiCount ?? null,
        loading,
        loadError,
        loadProjects: () => query.refetch(),
        removeProjectLocally
    };
};
