import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { I18nProvider } from './context/I18nContext';
import { ThemeProvider } from './context/ThemeContext';

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
import OnboardingOverlay from './components/OnboardingOverlay';

const AuthPage = lazy(() => import('./pages/AuthPage'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MapPage = lazy(() => import('./pages/MapPage'));
const ActivityManagerDashboard = lazy(() => import('./pages/ActivityManagerDashboard'));
const PropertyManagerDashboard = lazy(() => import('./pages/PropertyManagerDashboard'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostDetail = lazy(() => import('./pages/BlogPostDetail'));

import { injectJSONLD } from './utils/seo';

import './index.css';

function LandingPage() {
    useEffect(() => {
        injectJSONLD();
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

import React from 'react';

// Basic Error Boundary to catch runtime crashes
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: '#0A0A0A',
                    color: '#D4A853',
                    minHeight: '100vh',
                    fontFamily: 'monospace'
                }}>
                    <h1>Something went wrong.</h1>
                    <p>{this.state.error?.toString()}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ background: '#D4A853', color: '#0A0A0A', border: 'none', padding: '10px 20px', cursor: 'pointer' }}
                    >
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <ThemeProvider>
                    <I18nProvider>
                        <AuthProvider>
                            <BookingProvider>
                                <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
                                    <Navbar />
                                    <OnboardingOverlay />
                                    <Suspense fallback={
                                        <div className="min-h-[60vh] flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
                                        </div>
                                    }>
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
                                            <Route path="/blog" element={<BlogPage />} />
                                            <Route path="/blog/:slug" element={<BlogPostDetail />} />
                                            {/* Fallback */}
                                            <Route path="*" element={<LandingPage />} />
                                        </Routes>
                                    </Suspense>
                                </div>
                            </BookingProvider>
                        </AuthProvider>
                    </I18nProvider>
                </ThemeProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}
