import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import PortfolioOverview from './pages/PortfolioOverview';
import UploadCenter from './pages/UploadCenter';
import LoansTable from './pages/LoansTable';
import Documents from './pages/Documents';
import Compliance from './pages/Compliance';
import RiskAnalytics from './pages/RiskAnalytics';
import AIAssistant from './pages/AIAssistant';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <PortfolioOverview /> },
      { path: 'loans', element: <LoansTable /> },
      { path: 'documents', element: <Documents /> },
      { path: 'compliance', element: <Compliance /> },
      { path: 'risk', element: <RiskAnalytics /> },
      { path: 'ai-assistant', element: <AIAssistant /> },
      { path: 'upload', element: <UploadCenter /> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);