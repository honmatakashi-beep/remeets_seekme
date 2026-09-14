import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, ConfirmContext } from './contexts/AuthContext';
import { Navbar, Footer, ProtectedRoute } from './components/SharedComponents';
import { ScrollToTop, ScrollToTopButton, CreatePostPage, EditPostPage, PostDetailPage } from './pages/PostPages';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage, RegisterPage, VerifyEmailPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages';
import { AccountPage } from './pages/AccountPage';
import { GuidePage } from './components/GuidePage';
import { SupporterPage } from './components/SupporterPage';
import { FaqPage } from './pages/FaqPage';
import { SuccessStoriesPage, AdminDeploymentGuidePage, ManualPage, NotFoundPage } from './pages/MiscPages';
import { AdminInfoPage, SitemapPage, ContactPage, ConfirmModal, AuroraAmbientGlow, PageViewTracker } from './pages/AdminDashboard';
import { TermsPage, PrivacyPage, GuidelinesPage, CompanyPage, PricingPage, SafetyPage, DeletionRequestPage } from './pages/StaticPages';
import { PaymentPreviewPage } from './pages/PaymentPreviewPage';
import { stopAllGlobalCameraStreams } from './components/DocumentCameraOverlay';
import { HomeDesignShowroom } from './components/HomeDesignShowroom';

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));




// --- Core Auth Context & State Managers ---
export default function App() {
  useEffect(() => {
    // Lenis disabled to ensure reliable native scrolling on Mac/trackpad and all popups
    const handleGlobalUnload = () => {
      stopAllGlobalCameraStreams();
    };
    window.addEventListener('beforeunload', handleGlobalUnload);
    window.addEventListener('pagehide', handleGlobalUnload);
    return () => {
      window.removeEventListener('beforeunload', handleGlobalUnload);
      window.removeEventListener('pagehide', handleGlobalUnload);
      stopAllGlobalCameraStreams();
    };
  }, []);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm
    });
  };

  return (
    <AuthProvider>
      <ConfirmContext.Provider value={{ showConfirm }}>
        <Router>
          <PageViewTracker />
          <ScrollToTop />
          <div className="min-h-screen flex flex-col relative bg-transparent transition-colors duration-300">
            <AuroraAmbientGlow />
            <div className="relative z-50 w-full flex flex-col">
              <Navbar onOpenOnboarding={() => {}} />
            </div>
            <main className="flex-grow relative">
              <Routes>
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/" element={<HomePage onOpenOnboarding={() => {}} />} />
                <Route path="/search" element={<SearchPage onOpenOnboarding={() => {}} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/success-stories" element={<SuccessStoriesPage />} />
                <Route path="/create" element={<CreatePostPage />} />
                <Route path="/edit/:id" element={<ProtectedRoute><EditPostPage /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/mypage" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/post/:id" element={<PostDetailPage onOpenOnboarding={() => {}} />} />
                <Route path="/posts/:id" element={<PostDetailPage onOpenOnboarding={() => {}} />} />
                <Route path="/posts/:id/:slug" element={<PostDetailPage onOpenOnboarding={() => {}} />} />
                <Route path="/name/:name/:location/:year/:relationship" element={<PostDetailPage onOpenOnboarding={() => {}} />} />
                <Route path="/admin" element={
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-sans text-sm">読み込み中...</div>}>
                    <AdminDashboard />
                  </Suspense>
                } />
                <Route path="/admin/deployment-guide" element={<AdminDeploymentGuidePage />} />
                <Route path="/admin-info" element={<AdminInfoPage />} />
                <Route path="/guidelines" element={<GuidelinesPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/company" element={<CompanyPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/supporter" element={<SupporterPage />} />
                <Route path="/safety" element={<SafetyPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/manual" element={<ManualPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/deletion-request" element={<DeletionRequestPage />} />
                <Route path="/sitemap" element={<SitemapPage />} />
                <Route path="/payment-preview" element={<PaymentPreviewPage />} />
                <Route path="/admin/payments-preview" element={<PaymentPreviewPage />} />
                <Route path="/home-designs" element={<HomeDesignShowroom />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <ScrollToTopButton />
            <ConfirmModal 
              isOpen={confirmModal.isOpen}
              title={confirmModal.title}
              message={confirmModal.message}
              onConfirm={confirmModal.onConfirm}
              onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
          </div>
        </Router>
      </ConfirmContext.Provider>
    </AuthProvider>
  );
}

