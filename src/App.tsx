import { cn, PREFECTURES, formatEraLabel, getCategoryText, getPostUrl, PageHeader } from './lib/utils';
import { type User, AuthProvider, AuthContext, useAuth, ConfirmContext, useConfirm, useNgFilter } from './contexts/AuthContext';
import { TermsContent, PrivacyContent, TermsPage, PrivacyPage, GuidelinesPage, CompanyPage, SupporterDonationModal, PricingPage, SafetyPage, DeletionRequestPage } from './pages/StaticPages';
import { FaqPage } from './pages/FaqPage';
import { LoginPage, TermsModal, RegisterPage, QuestionSampleModal, VerifyEmailPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages';
import { SearchPage, SuccessStoryModal, ThankAdminModal } from './pages/SearchPage';
import { AccountPage } from './pages/AccountPage';
import { EditPostPage, CreatePostPage, ChatComponent, ScrollToTop, ScrollToTopButton, SeoPreviewModal, FlowExplanation, RevealContactModal, SuccessModal, AgeVerificationGate, ComplianceBanner, PostDetailPage, ReportModal } from './pages/PostPages';
import { SuccessStoriesPage, AdminDeploymentGuideBlock, AdminDeploymentGuidePage, ManualContent, LocalInlineGuidePage, ManualPage } from './pages/MiscPages';
import { AdminManualContent, OldAdminManualContent, RegionalMatrix, FunnelChart, HeatmapChart, AdminLiveSystemMonitor, AdminDashboard, AdminInfoPage, SitemapPage, ContactPage, ConfirmModal, AuroraAmbientGlow, MessagesPage, PageViewTracker, PageViewChart } from './pages/AdminDashboard';
import { WarningMessage, BottleLoader, Navbar, Footer, ProtectedRoute, GoogleSearchResultPreview } from './components/SharedComponents';
import { PaymentPreviewPage } from './pages/PaymentPreviewPage';
import { HomePage } from './pages/HomePage';
import React, { useState, useEffect, createContext, useContext, useRef, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Search, PlusCircle, Heart, MapPin, User as UserIcon, Lock, Mail, ArrowLeft, ArrowRight, ArrowDown, 
  CheckCircle2, CheckCircle, LogIn, LogOut, MessageSquare, Send, Share2, Shield, Activity, Facebook, 
  Trash2, Users, AlertCircle, Image as ImageIcon, HelpCircle, BookOpen, Eye, EyeOff, X, Plus, MoreVertical, Bot, Edit, Edit2, Edit3,
  Clock, Tag, Info, School, ShieldAlert, RefreshCw, Wind, MessageSquareX, FileWarning, UserCheck,
  FileText, History, Terminal, AlertTriangle, ExternalLink, Bell, MessageCircle, Sun, Moon, Sparkles, Gift, Award, Key, Brain, Radio, Volume2, VolumeX,
  Menu, ChevronLeft, ChevronRight, ChevronUp, Unlock, TrendingUp, Map, Check, Copy, Quote, Calendar, Home, Globe, ShieldCheck, Download, FlaskConical, Waves, Settings, Printer, Presentation, Anchor, DollarSign, Coins, Coffee, FileSpreadsheet, CheckSquare, Zap, CreditCard, Upload, Smartphone, RotateCcw, Filter, Building2, UserX, HeartHandshake, UserPlus, Compass, Rocket, Palette, Cpu
} from 'lucide-react';
import Lenis from '@studio-freight/lenis';
import pptxgen from 'pptxgenjs';
import {
  ManualGeneralSection,
  ManualMainSection,
  ManualModerationSection,
  ManualSystemSection,
  ManualSecuritySection
} from './components/AdminManualSections';
import { GoogleEvaluationMemoTab } from './components/GoogleEvaluationMemoTab';
import { GuidePage } from './components/GuidePage';
import { SupportBanner } from './components/SupportBanner';
import { SupportModal } from './components/SupportModal';
import { SupporterPage } from './components/SupporterPage';
import { DocumentCameraOverlay, stopAllGlobalCameraStreams } from './components/DocumentCameraOverlay';
import { HomePageTestVariant } from './components/HomePageTestVariant';
import { WaterRippleRainbowText } from './components/WaterRippleRainbowText';
import { PRShortsHelperCard } from './components/PRShortsHelperCard';
import { QuizMatchingAnalyticsView } from './components/QuizMatchingAnalyticsView';
import { AdminLiveAlertMonitor } from './components/AdminLiveAlertMonitor';
import { AdminRbacView } from './components/AdminRbacView';
import { AdminDesignSystem } from './components/AdminDesignSystem';
import { AdminMonetizationBlock } from './components/AdminMonetizationBlock';
import { AdminPaymentManagementBlock } from './components/AdminPaymentManagementBlock';
import { PolicePresentationSlideViewer } from './components/PolicePresentationSlideViewer';
import { MaValuationDataRoomView } from './components/MaValuationDataRoomView';
import { EkycProgressTelemetryPanel } from './components/EkycProgressTelemetryPanel';
import { 
  classifyTicket, 
  TicketCategory, 
  TicketCategoryEn, 
  ClassificationResult,
  URGENT_KEYWORDS, 
  TECHNICAL_KEYWORDS, 
  ACCOUNT_KEYWORDS 
} from './utils/contactClassification';
const remeetIcon = "/src/assets/images/remeet_icon_1779645087720.png";
import stepWriteImg from './assets/images/step_01_photo_write_1785857630366.jpg';
import stepDriftImg from './assets/images/step_02_photo_drift_1785857647101.jpg';
import stepReconnectImg from './assets/images/step_03_photo_read_v2_1785857978640.jpg';
import guideScene01Soft from './assets/images/guide_scene_01_soft_1785858280085.jpg';
import guideScene02Soft from './assets/images/guide_scene_02_soft_1785858294880.jpg';
import guideScene03Soft from './assets/images/guide_scene_03_soft_1785858307849.jpg';
import guideScene04Soft from './assets/images/guide_scene_04_soft_1785858320993.jpg';
import safetyGuardianCool from './assets/images/safety_guardian_cool_1785864341331.jpg';
import postSuccessSoft from './assets/images/post_success_soft_1785869214309.jpg';
import searchEmptySea from './assets/images/search_empty_sea_1785869230086.jpg';
import quizMatchHearts from './assets/images/quiz_match_hearts_pastel_1785940521320.jpg';
import heroBottleMail from './assets/images/hero_small_bottle_mail_1785944479619.jpg';

// --- Core Auth Context & State Managers ---
export default function App() {
  const [heroCopyStyle] = useState<'proposal1' | 'proposal2' | 'proposal3'>('proposal1');

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
                <Route path="/" element={<HomePage onOpenOnboarding={() => {}} heroCopyStyle={heroCopyStyle} />} />
                <Route path="/search" element={<SearchPage onOpenOnboarding={() => {}} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/success-stories" element={<SuccessStoriesPage />} />
                <Route path="/create" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
                <Route path="/edit/:id" element={<ProtectedRoute><EditPostPage /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/post/:id" element={<PostDetailPage onOpenOnboarding={() => {}} />} />
                <Route path="/name/:name/:location/:year/:relationship" element={<PostDetailPage onOpenOnboarding={() => {}} />} />
                <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminDashboard />} />
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

