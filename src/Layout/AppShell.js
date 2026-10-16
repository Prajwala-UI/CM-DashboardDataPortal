import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../Routes/AuthContext';
import '../Styles/AppShell.css';

/** Marker attribute reproducing Angular's emulated encapsulation for app.component.css
 *  (every selector in AppShell.css requires it, so shell styles never leak into pages). */
const S = { 'data-shell': '' };

/** Angular AppComponent template (app.component.html). The About / Manual / Contact modals had
 *  no trigger in the Angular app and are not migrated (R10). */
const AppShell = ({ children }) => {
  const { isLoginAuthenticated, adminLogout } = useAuth();

  // Bootstrap 3 JS behaviour (navbar collapse, profile dropdown) reproduced with React state
  const [navCollapsed, setNavCollapsed] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [profileOpen]);

  // Profile values written by the Login page (re-read on every login instead of Angular's forced reload - R8)
  const emp_Name = localStorage.getItem('DESIGNATION_NAME');
  const username = localStorage.getItem('MOBILE_NO');
  const deptname = localStorage.getItem('LOCATION_NAME');
  const role = (localStorage.getItem('ROLE') || 'USER').toUpperCase();
  const nodalOfficerName = localStorage.getItem('NODAL_OFFICER_NAME') || '';
  const isNodalUser = role === 'NODAL';

  const onLogout = (e) => {
    e.preventDefault();
    setProfileOpen(false);
    adminLogout();
  };

  const navLinkClass = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <div {...S} className="wrapper">

      {isLoginAuthenticated && (
        <div {...S} className="top_nav">
          <nav {...S} className="navbar navbar-inverse">
            <div {...S} className="container-fluid" style={{ margin: '0px', padding: '0px' }}>
              <div {...S} className="navbar-header">
                <button {...S} type="button" className="navbar-toggle" onClick={() => setNavCollapsed(!navCollapsed)}>
                  <span {...S} className="icon-bar"></span>
                  <span {...S} className="icon-bar"></span>
                  <span {...S} className="icon-bar"></span>
                </button>
                <a {...S} className="navbar-brand" href="#">
                  <img {...S} src={`${import.meta.env.BASE_URL}assets/images/cmvv4.png`} className="top_nav_img" alt="" />
                  <p {...S}>CM Dashboard - <span {...S} style={{ marginTop: '0px', marginLeft: '4px', fontSize: '15px' }}> Data Portal</span>
                    <br {...S} /><span {...S}>Government of Karnataka</span></p>
                </a>
              </div>
              <div {...S} className={`collapse navbar-collapse${navCollapsed ? '' : ' in'}`} id="myNavbar">
                <div {...S}>
                  <ul {...S} className="myul_right">
                    <li {...S} className="welcome">
                      <a {...S}>Welcome, <b {...S}>{emp_Name}</b></a>
                    </li>

                    <li {...S} ref={profileRef} className={`dropdown${profileOpen ? ' open' : ''}`}>
                      <a {...S} href="#" className="dropdown-toggle" onClick={(e) => { e.preventDefault(); setProfileOpen(!profileOpen); }}>
                        <i {...S} className="fa fa-user-circle"></i>
                      </a>
                      <ul {...S} className="dropdown-menu cms-profile-menu">
                        <li {...S} className="cms-profile-header">
                          <div {...S} className="cms-profile-avatar"><i {...S} className="fa fa-user"></i></div>
                          <div {...S} className="cms-profile-headtext">
                            <div {...S} className="cms-profile-name">{emp_Name || 'User'}</div>
                            <div {...S} className="cms-profile-role">{isNodalUser ? 'Nodal Officer' : 'Signed in'}</div>
                          </div>
                        </li>
                        <li {...S} className="cms-profile-info">
                          <div {...S} className="cms-profile-row">
                            <div {...S} className="cms-profile-row-icon"><i {...S} className="fa fa-phone"></i></div>
                            <div {...S} className="cms-profile-row-text">
                              <div {...S} className="cms-profile-label">Mobile No</div>
                              <div {...S} className="cms-profile-value">{username}</div>
                            </div>
                          </div>
                          <div {...S} className="cms-profile-row">
                            <div {...S} className="cms-profile-row-icon"><i {...S} className="fa fa-map-marker"></i></div>
                            <div {...S} className="cms-profile-row-text">
                              <div {...S} className="cms-profile-label">Office Location</div>
                              <div {...S} className="cms-profile-value">{deptname}</div>
                            </div>
                          </div>
                          {isNodalUser && nodalOfficerName && (
                            <div {...S} className="cms-profile-row">
                              <div {...S} className="cms-profile-row-icon"><i {...S} className="fa fa-id-badge"></i></div>
                              <div {...S} className="cms-profile-row-text">
                                <div {...S} className="cms-profile-label">Nodal Officer</div>
                                <div {...S} className="cms-profile-value">{nodalOfficerName}</div>
                              </div>
                            </div>
                          )}
                        </li>
                        <li {...S} className="cms-profile-footer">
                          <button {...S} className="cms-logout-btn"><a {...S} href="#/profile" onClick={onLogout}><i {...S} className="fa fa-sign-out"></i> Logout</a></button>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Sidebar Holder */}
      {isLoginAuthenticated && (
        <div {...S} className="sidebar">
          <nav {...S} id="sidebar">

            {/* Dept user: role === 'USER' */}
            {!isNodalUser && (
              <ul {...S} className="list-unstyled components">
                <li {...S} className="dash_role">DEPARTMENT USER</li>
                <li {...S}><NavLink {...S} to="/home" className={navLinkClass}><i {...S} className="fa fa-home"></i>Home</NavLink></li>
              </ul>
            )}

            {/* Nodal user: role === 'NODAL' */}
            {isNodalUser && (
              <ul {...S} className="list-unstyled components">
                <li {...S} className="dash_role">CMO ADMIN</li>
                <li {...S}><NavLink {...S} to="/NodalDashboard" className={navLinkClass}><i {...S} className="fa fa-home"></i>100-Days' Mission</NavLink></li>
                <li {...S}><NavLink {...S} to="/NodalUsermgt" className={navLinkClass}><i {...S} className="fa fa-user"></i>User Management</NavLink></li>
              </ul>
            )}

          </nav>
        </div>
      )}

      {/* Page Content Holder */}
      <div {...S} id="content" className={!isLoginAuthenticated ? 'full-width' : undefined}>
        <div {...S} className="container-fluid" style={{ padding: '0px' }}>
          {children}
        </div>
      </div>

    </div>
  );
};

export default AppShell;
