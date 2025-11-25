import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Shield, Lock, Users, AlertCircle } from 'lucide-react';
import EzNav from './ezapply-nav';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <EzNav />
      <Head title="Terms and Conditions" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/register" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Terms and Conditions</h1>
              <p className="text-gray-600 mt-1">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to EZ Apply PH ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your access to and use of our platform, services, and website. By registering an account or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-600" />
              2. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              By creating an account on EZ Apply PH, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. You also agree to comply with all applicable laws and regulations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. Your continued use of our services after any changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              3. User Accounts
            </h2>
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-gray-900">3.1 Account Creation:</strong> To use our services, you must create an account by providing accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-gray-900">3.2 Account Security:</strong> You are responsible for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account or any other breach of security.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-gray-900">3.3 Account Types:</strong> Our platform supports different user roles (e.g., applicants, companies). Each role has specific permissions and responsibilities as outlined in these Terms.
              </p>
            </div>
          </section>

          {/* Use of Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Use of Services</h2>
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-gray-900">4.1 Permitted Use:</strong> You may use our services solely for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt our services</li>
                <li>Use automated systems to access our platform without permission</li>
              </ul>
            </div>
          </section>

          {/* Franchise Listings */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Franchise Listings and Applications</h2>
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-gray-900">5.1 Listings:</strong> We provide a platform for franchise opportunities. We do not guarantee the accuracy, completeness, or quality of franchise listings. All franchise information is provided by third-party companies.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-gray-900">5.2 Applications:</strong> When you apply for a franchise opportunity through our platform, you understand that:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
                <li>We are not a party to any agreement between you and the franchise company</li>
                <li>We do not guarantee approval of your application</li>
                <li>All franchise agreements are between you and the respective franchise company</li>
                <li>You are responsible for conducting your own due diligence</li>
              </ul>
            </div>
          </section>

          {/* Fees and Payments */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Fees and Payments</h2>
            <p className="text-gray-700 leading-relaxed">
              Some services on our platform may require payment. All fees are clearly disclosed before you commit to any paid service. We reserve the right to change our fee structure with reasonable notice. Refunds are subject to our refund policy, which will be communicated at the time of purchase.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on our platform, including but not limited to text, graphics, logos, images, and software, is the property of EZ Apply PH or its licensors and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our services, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              9. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              To the maximum extent permitted by law, EZ Apply PH and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our total liability to you for all claims arising from or related to your use of our services shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account and access to our services at any time, with or without cause or notice, for any reason including, but not limited to, breach of these Terms. Upon termination, your right to use our services will immediately cease.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the Philippines, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of the Philippines.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us through our contact page or at the email address provided on our website.
            </p>
          </section>

          {/* Agreement */}
          <section className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
            <p className="text-gray-800 font-semibold">
              By checking the "I agree to the Terms and Conditions" checkbox during registration, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center">
          <Link 
            href="/register" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Return to Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;

