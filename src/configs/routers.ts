import LOGIN from '../pages/login.jsx';
import HOME from '../pages/home.jsx';
import COMPANIES from '../pages/companies.jsx';
import PROFILE from '../pages/profile.jsx';
import COMPANY_DETAIL from '../pages/company-detail.jsx';
import EDIT_PROFILE from '../pages/edit-profile.jsx';
import FAVORITES from '../pages/favorites.jsx';
import MEMBER_CERTIFICATION from '../pages/member-certification.jsx';
import MY_COMPANY from '../pages/my-company.jsx';
import ADMIN_DASHBOARD from '../pages/admin-dashboard.jsx';
import ADMIN_USERS from '../pages/admin-users.jsx';
import ADMIN_MEMBER-CERTIFICATIONS from '../pages/admin-member-certifications.jsx';
import ADMIN_COMPANIES from '../pages/admin-companies.jsx';
import ADMIN_COMPANY-AUDITS from '../pages/admin-company-audits.jsx';
import REGISTER from '../pages/register.jsx';
import INIT_DATA from '../pages/init-data.jsx';
import TEST_LOGIN from '../pages/test-login.jsx';
import TEST_PROFILE from '../pages/test-profile.jsx';
import DEBUG_LOGIN from '../pages/debug-login.jsx';
export const routers = [{
  id: "login",
  component: LOGIN
}, {
  id: "home",
  component: HOME
}, {
  id: "companies",
  component: COMPANIES
}, {
  id: "profile",
  component: PROFILE
}, {
  id: "company-detail",
  component: COMPANY_DETAIL
}, {
  id: "edit-profile",
  component: EDIT_PROFILE
}, {
  id: "favorites",
  component: FAVORITES
}, {
  id: "member-certification",
  component: MEMBER_CERTIFICATION
}, {
  id: "my-company",
  component: MY_COMPANY
}, {
  id: "admin-dashboard",
  component: ADMIN_DASHBOARD
}, {
  id: "admin-users",
  component: ADMIN_USERS
}, {
  id: "admin-member-certifications",
  component: ADMIN_MEMBER-CERTIFICATIONS
}, {
  id: "admin-companies",
  component: ADMIN_COMPANIES
}, {
  id: "admin-company-audits",
  component: ADMIN_COMPANY-AUDITS
}, {
  id: "register",
  component: REGISTER
}, {
  id: "init-data",
  component: INIT_DATA
}, {
  id: "test-login",
  component: TEST_LOGIN
}, {
  id: "test-profile",
  component: TEST_PROFILE
}, {
  id: "debug-login",
  component: DEBUG_LOGIN
}]