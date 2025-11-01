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
interface WelcomeModalProps {
  // Milliseconds delay before the modal first shows
  initialDelay?: number;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ initialDelay = 2000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Effect to handle the initial delayed display of the modal
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if a flag exists in localStorage to prevent showing again
      const hasSeenModal = localStorage.getItem('ezapply_welcome_seen');
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
    localStorage.setItem('ezapply_welcome_seen', 'true');
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
            Welcome to the Future of EZ Application.
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 leading-relaxed">
            We're committed to making your process <strong>seamless and successful</strong>. Inspired by the spirit of the Filipino people, our platform is designed for <strong>efficiency, transparency, and progress</strong>. Begin your journey with us today, and experience how easy it can be to achieve your goals.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center gap-4">
          <Button variant="default" onClick={handleClose}>
            Get Started
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Learn More
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;

// --- Example Usage in another file (e.g., App.tsx) ---
/*
import WelcomeModal from './WelcomeModal';
// ... inside your component render
<WelcomeModal initialDelay={2500} />
*/
