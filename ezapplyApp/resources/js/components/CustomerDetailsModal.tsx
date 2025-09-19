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
  id: number;
  email: string;
  basicinfo?: {
    first_name: string;
    last_name: string;
    birth_date: Date;
    phone: number;
    Facebook?: string;
    LinkedIn?: string;
    Viber?: string;
  };
  affiliations?: {
    institution: string;
    position: string;
  };
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
            {customer.basicinfo
              ? `${customer.basicinfo.first_name} ${customer.basicinfo.last_name}`
              : "Unnamed Customer"}
          </DialogTitle>
          <DialogDescription className="text-base">
            Customer profile and information overview
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          {customer.basicinfo && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Full Name:</span>
                  <p className="text-sm text-gray-600">
                    {customer.basicinfo.first_name} {customer.basicinfo.last_name}
                  </p>
                </div>

                <div>
                  <span className="font-medium">Birth Date:</span>
                  <p className="text-sm text-gray-600">
                    {formatDate(customer.basicinfo.birth_date)}
                  </p>
                </div>

                <div>
                  <span className="font-medium">Phone:</span>
                  <p className="text-sm text-gray-600">
                    {customer.basicinfo.phone || "Not specified"}
                  </p>
                </div>

                <div>
                  <span className="font-medium">Email:</span>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>

                {/* Social Links */}
                {customer.basicinfo.Facebook && (
                  <div>
                    <span className="font-medium">Facebook:</span>
                    <a
                      href={customer.basicinfo.Facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm block"
                    >
                      {customer.basicinfo.Facebook}
                    </a>
                  </div>
                )}
                {customer.basicinfo.LinkedIn && (
                  <div>
                    <span className="font-medium">LinkedIn:</span>
                    <a
                      href={customer.basicinfo.LinkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm block"
                    >
                      {customer.basicinfo.LinkedIn}
                    </a>
                  </div>
                )}
                {customer.basicinfo.Viber && (
                  <div>
                    <span className="font-medium">Viber:</span>
                    <p className="text-sm text-gray-600">
                      {customer.basicinfo.Viber}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Affiliations */}
          {customer.affiliations && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2">
                Affiliations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Institution:</span>
                  <p className="text-sm text-gray-600">
                    {customer.affiliations.institution || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Position:</span>
                  <p className="text-sm text-gray-600">
                    {customer.affiliations.position || "Not specified"}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Financial Information */}
          {customer.financials && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2">
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Annual Income:</span>
                  <p className="text-sm text-gray-600">
                    {formatNumber(customer.financials.annual_income)}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Salary:</span>
                  <p className="text-sm text-gray-600">
                    {formatNumber(customer.financials.salary)}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Attachments */}
          {customer.customer_attachments && customer.customer_attachments.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2">
                Attachments
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {customer.customer_attachments.map((attachment, idx) => (
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
