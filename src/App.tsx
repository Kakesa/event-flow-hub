import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PwaInstallProvider } from "@/contexts/PwaInstallContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import VisitTracker from "@/hooks/useTrackVisit";
import ScrollToTop from "@/components/ScrollToTop";
import RouteSEO from "@/components/RouteSEO";

const Auth = lazy(() => import("./pages/Auth"));
const RSVP = lazy(() => import("./pages/RSVP"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const Index = lazy(() => import("./pages/Index"));
const Events = lazy(() => import("./pages/Events"));
const Guests = lazy(() => import("./pages/Guests"));
const Guestbook = lazy(() => import("./pages/Guestbook"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Invitations = lazy(() => import("./pages/Invitations"));
const InvitationTemplates = lazy(() => import("./pages/InvitationTemplates"));
const Scanner = lazy(() => import("./pages/Scanner"));
const Settings = lazy(() => import("./pages/Settings"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const EditEvent = lazy(() => import("./pages/EditEvent"));
const Users = lazy(() => import("./pages/Users"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const ServicesIndexPage = lazy(() => import("./pages/ServicesIndexPage"));
const ServicePage = lazy(() => import("./pages/ServicePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-[#faf8f5]">
    <div className="h-8 w-8 rounded-full border-2 border-[#b8956c] border-t-transparent animate-spin" aria-hidden />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <PwaInstallProvider>
      <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <ScrollToTop />
          <RouteSEO />
          <VisitTracker />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public routes — landing chargée immédiatement */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/register" element={<Auth />} />
              <Route path="/checkin/:token" element={<CheckIn />} />
              <Route path="/rsvp/:eventId/:guestId" element={<RSVP />} />
              <Route path="/rsvp/:eventId" element={<RSVP />} />
              <Route path="/invite/:slug" element={<RSVP />} />
              <Route path="/services" element={<ServicesIndexPage />} />
              <Route path="/services/:slug" element={<ServicePage />} />
              <Route path="/galerie" element={<GalleryPage />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
              <Route path="/events/edit/:eventId" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
              <Route path="/guests" element={<ProtectedRoute><Guests /></ProtectedRoute>} />
              <Route path="/guestbook" element={<ProtectedRoute><Guestbook /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/invitations" element={<ProtectedRoute><Invitations /></ProtectedRoute>} />
              <Route path="/invitations/templates" element={<ProtectedRoute><InvitationTemplates /></ProtectedRoute>} />
              <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
              <Route path="/superadmin" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
    </PwaInstallProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
