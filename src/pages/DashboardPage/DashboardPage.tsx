import { Outlet } from 'react-router-dom';

import Tour from '../../Tour';

import NavigationPanel from '../../components/NavigationPanel/NavigationPanel';

const DashboardPage = () => {
  return (
    <>
      <Tour />
      <NavigationPanel />
      <Outlet />
    </>
  );
};

export default DashboardPage;
