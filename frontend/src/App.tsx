import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { PageLayout } from './components/layout/PageLayout';
import { HomePage } from './components/pages/HomePage';
import { AboutUsPage } from './components/pages/AboutUsPage';
import { ContactUsPage } from './components/pages/ContactUsPage';
import { LoginPage } from './components/pages/LoginPage';
import { SignUpPage } from './components/pages/SignUpPage';
import { LogoutPage } from './components/pages/LogoutPage';
import { NotFoundPage } from './components/pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PageLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutUsPage />} />
            <Route path="contact" element={<ContactUsPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
            <Route path="logout" element={<LogoutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
