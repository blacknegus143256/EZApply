import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AppLogoIcon from './app-logo-icon';

// Define the component props
interface CompanyWelcomeModalProps {
  // Milliseconds delay before the modal first shows
  initialDelay?: number;
}

const CompanyWelcomeModal: React.FC<CompanyWelcomeModalProps> = ({ initialDelay = 2000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Effect to handle the initial delayed display of the modal
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if a flag exists in localStorage to prevent showing again
      const hasSeenModal = localStorage.getItem('ezapply_company_welcome_seen');
      if (!hasSeenModal) {
        setIsVisible(true);
      }
    }, initialDelay);

    return () => clearTimeout(timer); // Cleanup the timer
  }, [initialDelay]);

  // Function to close the modal and set a flag in local storage
  const handleClose = () => {
    setIsVisible(false);
    // Prevents the modal from showing again on subsequent visits/reloads
    localStorage.setItem('ezapply_company_welcome_seen', 'true');
  };

  return (
    <Dialog open={isVisible} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <AppLogoIcon className="w-24 h-auto" />
          </div>
          <DialogTitle className="text-center text-blue-700">
            Mabuhay! Your Dashboard is Ready
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 leading-relaxed">
            Accelerate your business growth! This platform is your dedicated hub to manage franchise opportunities, streamline application reviews, and expand your network. Start making progress now—we've credited your account with a bonus ₱200 EZ Credit as a thank you for your commitment to growth.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center gap-4">    
          <Button variant="default" onClick={handleClose}>
            Explore Dashboard
          </Button>
          <Button variant="outline" onClick={handleClose}>
            View Applications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyWelcomeModal;

// --- Example Usage in another file (e.g., Dashboard.tsx) ---
/*
import CompanyWelcomeModal from './CompanyWelcomeModal';
// ... inside your component render (only for company users)
<CompanyWelcomeModal initialDelay={2500} />
*/
