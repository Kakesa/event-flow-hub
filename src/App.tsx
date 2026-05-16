import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Events from "./pages/Events";
import Guests from "./pages/Guests";
import Guestbook from "./pages/Guestbook";
import Analytics from "./pages/Analytics";
import Invitations from "./pages/Invitations";
import InvitationTemplates from "./pages/InvitationTemplates";
import Scanner from "./pages/Scanner";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import RSVP from "./pages/RSVP";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import Users from "./pages/Users";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/register" element={<Auth />} />
            <Route path="/rsvp/:eventId/:guestId" element={<RSVP />} />
            <Route path="/rsvp/:eventId" element={<RSVP />} />
            <Route path="/invite/:slug" element={<RSVP />} />
            <Route path="/" element={<LandingPage />} />
            
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
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/superadmin" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
