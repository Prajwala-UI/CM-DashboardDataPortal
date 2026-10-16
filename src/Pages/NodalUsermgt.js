import { useNodalList } from '../Hooks/useNodalList';
import { toNodalPostCodeRowVM } from '../Utils/nodalModel';
import '../Styles/NodalUsermgt.css';

const mapPostCodes = (res) => (Array.isArray(res.data) ? res.data : []).map(row => toNodalPostCodeRowVM(row));
const TEXTS = {
    label: 'NodalUsermgt',
    notSuccess: 'Could not load the postcode list.',
    error: 'Could not load the postcode list. Please try again.'
};

/**
 * Angular NodalUsermgtComponent (#/NodalUsermgt).
 * The Angular component loads the postcode registry but its HTML template is EMPTY, so the page
 * renders nothing. Reproduced as-is for parity (R9): the data is loaded, nothing is shown.
 * The scoped CSS (NodalUsermgt.css) is kept for when the business approves building this screen.
 */
const NodalUsermgt = () => {
    useNodalList({
        screen: 'usermgt',
        adminDeptCode: localStorage.getItem('DEPT_CODE'),
        mapRows: mapPostCodes,
        texts: TEXTS
    });

    return null;
};

export default NodalUsermgt;
