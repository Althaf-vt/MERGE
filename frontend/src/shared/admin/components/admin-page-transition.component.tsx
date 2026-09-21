import React from 'react';
import { motion } from 'motion/react';

interface AdminPageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

export const AdminPageTransition: React.FC<AdminPageTransitionProps> = ({ children, className = '' }) => {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', visualDuration: 0.6, bounce: 0.12 }}
        >
            {children}
        </motion.div>
    );
};