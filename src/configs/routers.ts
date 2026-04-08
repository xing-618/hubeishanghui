import LOGIN from '../pages/login.jsx';
import HOME from '../pages/home.jsx';
import COMPANIES from '../pages/companies.jsx';
import PROFILE from '../pages/profile.jsx';
import COMPANY_DETAIL from '../pages/company-detail.jsx';
import EDIT_PROFILE from '../pages/edit-profile.jsx';
import FAVORITES from '../pages/favorites.jsx';
import MEMBER_CERTIFICATION from '../pages/member-certification.jsx';
import MY_COMPANY from '../pages/my-company.jsx';
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
}]