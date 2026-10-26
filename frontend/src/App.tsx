import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { PageLayout } from './components/layout/PageLayout';
import { HomePage } from './components/pages/HomePage';
import { LoginPage } from './components/pages/LoginPage';
import { SignUpPage } from './components/pages/SignUpPage';
import { LogoutPage } from './components/pages/LogoutPage';
import { TasksPage } from './components/pages/TasksPage';
import { TaskHistoryPage } from './components/pages/TaskHistoryPage';
import { ApiIntegrationPage } from './components/pages/ApiIntegrationPage';
import { NotFoundPage } from './components/pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PageLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
            <Route path="logout" element={<LogoutPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="task-history" element={<TaskHistoryPage />} />
            <Route path="api-integration" element={<ApiIntegrationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
