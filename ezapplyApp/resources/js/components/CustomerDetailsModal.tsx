import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CustomerDetails {
  user?: {
  id: number;
  email: string;
  }
    basicinfo?: {
    first_name: string;
    last_name: string;
    birth_date: string;
    phone: number;
    Facebook?: string;
    LinkedIn?: string;
    Viber?: string;
  };
  affiliations?: {
    institution: string;
    position: string;
  }[];
  financials?: {
    annual_income?: number;
    salary?: number;
  };
  customer_attachments?: {
    attachment_type?: string;
  }[];
}

interface CustomerDetailsModalProps {
  customer: CustomerDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerDetailsModal({
  customer,
  isOpen,
  onClose,
}: CustomerDetailsModalProps) {
  if (!customer) return null;

  const formatNumber = (num: number | undefined) => {
    if (!num) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold pr-8">
            {customer.user?.basicinfo
              ? `${customer.user.basicinfo.first_name} ${customer.user.basicinfo.last_name}`
              : "Unnamed Customer"}
          </DialogTitle>
          <DialogDescription className="text-base">
            Customer profile and information overview
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          {customer.user?.basicinfo && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Full Name:</span>
                  <p className="text-sm text-gray-600">
                    {customer.user.basicinfo.first_name} {customer.user.basicinfo.last_name}
                  </p>
                </div>

                <div>
                  <span className="font-medium">Birth Date:</span>
                  <p className="text-sm text-gray-600">
                    {formatDate(customer.user.basicinfo.birth_date)}
                  </p>
                </div>

                <div>
                  <span className="font-medium">Phone:</span>
                  <p className="text-sm text-gray-600">
                    {customer.user.basicinfo.phone || "Not specified"}
                  </p>
                </div>

                <div>
                  <span className="font-medium">Email:</span>
                  <p className="text-sm text-gray-600">{customer.user.email}</p>
                </div>

                {/* Social Links */}
                {customer.user.basicinfo.Facebook && (
                  <div>
                    <span className="font-medium">Facebook:</span>
                    <a
                      href={customer.user.basicinfo.Facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm block"
                    >
                      {customer.user.basicinfo.Facebook}
                    </a>
                  </div>
                )}
                {customer.user.basicinfo.LinkedIn && (
                  <div>
                    <span className="font-medium">LinkedIn:</span>
                    <a
                      href={customer.user.basicinfo.LinkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm block"
                    >
                      {customer.user.basicinfo.LinkedIn}
                    </a>
                  </div>
                )}
                {customer.user.basicinfo.Viber && (
                  <div>
                    <span className="font-medium">Viber:</span>
                    <p className="text-sm text-gray-600">
                      {customer.user.basicinfo.Viber}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Affiliations */}
          {customer.user?.affiliations && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2">
                Affiliations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Institution:</span>
                  <p className="text-sm text-gray-600">
                    {customer.user.affiliations.institution || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Position:</span>
                  <p className="text-sm text-gray-600">
                    {customer.user.affiliations.position || "Not specified"}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Financial Information */}
          {customer.user?.financials && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2">
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Annual Income:</span>
                  <p className="text-sm text-gray-600">
                    {formatNumber(customer.user.financials.annual_income)}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Salary:</span>
                  <p className="text-sm text-gray-600">
                    {formatNumber(customer.user.financials.salary)}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Attachments */}
          {customer.user?.customer_attachments && customer.user?.customer_attachments.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2">
                Attachments
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {customer.user.customer_attachments.map((attachment, idx) => (
                  <li key={idx}>
                    {attachment.attachment_type || "Unknown Attachment"}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
