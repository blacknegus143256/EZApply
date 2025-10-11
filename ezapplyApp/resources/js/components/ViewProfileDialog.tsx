import React from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Application } from "@/types/applicants";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null; 
};

export default function ViewProfileDialog({ open, onOpenChange, application }: Props) {
  if (!application) return null;
  const handleMoreInfo = () => {
    const url = `/company/applicants/${application.id}/profile`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 rounded-md max-w-md mx-auto mt-5 bg-white dark:bg-neutral-800">
        <DialogTitle className="text-lg font-bold mb-2">Applicant Profile</DialogTitle>
        <hr className="my-2"/>
        <p><strong>Name:</strong> {application.user?.basicinfo?.first_name} {application.user?.basicinfo?.last_name}</p>
        <p><strong>Email:</strong> {application.user?.email}</p>
        <p>
            <strong>Desired Location:</strong>{" "}
            {application.desired_location ?? "Anywhere"}
          </p>
          <p>
            <strong>Deadline Date:</strong>{" "}
            {application.deadline_date
              ? new Date(application.deadline_date).toLocaleDateString()
              : "Anytime"}
          </p>
        <p><strong>Status:</strong> {application.status}</p>
        <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={handleMoreInfo}>
                More Information
              </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
