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
interface ApplicantWelcomeModalProps {
  // Milliseconds delay before the modal first shows
  initialDelay?: number;
}

const ApplicantWelcomeModal: React.FC<ApplicantWelcomeModalProps> = ({ initialDelay = 2000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Effect to handle the initial delayed display of the modal
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if a flag exists in localStorage to prevent showing again
      const hasSeenModal = localStorage.getItem('ezapply_applicant_welcome_seen');
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
    localStorage.setItem('ezapply_applicant_welcome_seen', 'true');
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
          <DialogTitle className="text-center text-green-700">
            Welcome to EZ Apply PH - Applicant
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 leading-relaxed">
            Start your franchise journey today! Complete your profile, explore vetted opportunities, and apply to your dream franchise. We're here to guide you every step of the way.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center gap-4">
          <Button variant="default" onClick={handleClose}>
            Start Application
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Browse Franchises
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicantWelcomeModal;

// --- Example Usage in another file (e.g., Dashboard.tsx) ---
/*
import ApplicantWelcomeModal from './ApplicantWelcomeModal';
// ... inside your component render (only for applicant users)
<ApplicantWelcomeModal initialDelay={2500} />
*/
