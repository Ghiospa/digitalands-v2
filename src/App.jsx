import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { I18nProvider } from './context/I18nContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhySicily from './components/WhySicily';
import HowItWorks from './components/HowItWorks';
import Properties from './components/Properties';
import FoundingMember from './components/FoundingMember';
import Testimonials from './components/Testimonials';
import Partners from './components/Partners';
import WaitlistCTA from './components/WaitlistCTA';
import Footer from './components/Footer';

import AuthPage from './pages/AuthPage';
import PropertyDetail from './pages/PropertyDetail';
import ActivitiesPage from './pages/ActivitiesPage';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import ActivityManagerDashboard from './pages/ActivityManagerDashboard';
import PropertyManagerDashboard from './pages/PropertyManagerDashboard';
import PropertiesPage from './pages/PropertiesPage';

import './index.css';

function LandingPage() {
    useEffect(() => {
        const els = document.querySelectorAll('[data-reveal]');
        if (!els.length) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        els.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <Hero />
            <WhySicily />
            <HowItWorks />
            <Properties />
            <FoundingMember />
            <Testimonials />
            <Partners />
            <WaitlistCTA />
            <Footer />
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <I18nProvider>
                <AuthProvider>
                    <BookingProvider>
                        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
                            <Navbar />
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/auth" element={<AuthPage />} />
                                <Route path="/property/:id" element={<PropertyDetail />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/activities" element={<ActivitiesPage />} />
                                <Route path="/mappa" element={<MapPage />} />
                                <Route path="/manager/activities" element={<ActivityManagerDashboard />} />
                                <Route path="/manager/properties" element={<PropertyManagerDashboard />} />
                                <Route path="/strutture" element={<PropertiesPage />} />
                                <Route path="/properties" element={<PropertiesPage />} />
                                {/* Fallback */}
                                <Route path="*" element={<LandingPage />} />
                            </Routes>
                        </div>
                    </BookingProvider>
                </AuthProvider>
            </I18nProvider>
        </BrowserRouter>
    );
}
