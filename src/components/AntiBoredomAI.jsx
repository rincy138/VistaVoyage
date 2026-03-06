import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Zap, X } from 'lucide-react';
import './AntiBoredomAI.css';

const AntiBoredomAI = () => {
    const [showAlert, setShowAlert] = useState(false);
    const [lastPath, setLastPath] = useState(window.location.pathname);

    useEffect(() => {
        const checkBoredom = () => {
            const currentPath = window.location.pathname;
            if (currentPath !== lastPath) {
                setLastPath(currentPath);
            }

            const history = JSON.parse(localStorage.getItem('browsing_history') || '[]');
            if (history.length < 3) return;

            // Check if last 3 items have overlapping tags
            const last3 = history.slice(-3);
            const tagOccurrences = {};
            last3.forEach(item => {
                const uniqueTags = [...new Set(item.tags)];
                uniqueTags.forEach(tag => {
                    tagOccurrences[tag] = (tagOccurrences[tag] || 0) + 1;
                });
            });

            const hasLoop = Object.values(tagOccurrences).some(count => count >= 3);

            // Only show if we are on a package page and haven't shown it for this specific loop lately
            const isPackagePage = currentPath.includes('/packages/');
            const lastShown = localStorage.getItem('last_boredom_alert');
            const now = Date.now();

            if (hasLoop && isPackagePage && (!lastShown || now - lastShown > 60000)) {
                setShowAlert(true);
                localStorage.setItem('last_boredom_alert', now);
                setTimeout(() => setShowAlert(false), 8000);
            }
        };

        const interval = setInterval(checkBoredom, 3000);
        return () => clearInterval(interval);
    }, [lastPath]);

    return (
        <AnimatePresence>
            {showAlert && (
                <motion.div
                    className="anti-boredom-alert"
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.8 }}
                >
                    <div className="alert-content">
                        <div className="icon-wrapper">
                            <Zap className="zap-icon" />
                        </div>
                        <div className="text-wrapper">
                            <span className="ai-label">Anti-Boredom AI</span>
                            <p className="ai-msg">“You are stuck in a comfort loop. Try contrast travel.”</p>
                        </div>
                        <button className="close-alert" onClick={() => setShowAlert(false)}>
                            <X size={14} />
                        </button>
                    </div>
                    <div className="alert-progress"></div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AntiBoredomAI;
