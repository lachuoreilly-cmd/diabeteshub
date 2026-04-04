
import React from 'react';
import { Handshake, AlertTriangle, ShieldX, FileText, Bot, Globe } from 'lucide-react';

const TermsOfService: React.FC = () => {

    const sections = [
        {
            icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
            title: "Critical Medical Disclaimer",
            content: [
                "**This Application Does Not Provide Medical Advice.** The information, including but not limited to, text, graphics, images, and other material contained in this application are for informational and educational purposes only.",
                "**Not a Substitute for Professional Medical Advice.** This application is not intended to be a substitute for professional medical advice, diagnosis, or treatment. It is a metabolic simulation and educational tool, not a medical device.",
                "**Always Seek Professional Help.** Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or treatment and before undertaking a new health care regimen.",
                "**Never Disregard Professional Medical Advice.** Never disregard professional medical advice or delay in seeking it because of something you have read or simulated in this application."
            ]
        },
        {
            icon: <Handshake className="w-5 h-5 text-blue-600" />,
            title: "Acceptance of Terms",
            content: [
                "By creating an account, accessing, or using the Diabetes Companion application ('Service'), you agree to be bound by these Terms of Service ('Terms') and our Privacy Policy. If you do not agree to these Terms, you may not use the Service."
            ]
        },
        {
            icon: <Bot className="w-5 h-5 text-blue-600" />,
            title: "Use of the Service",
            content: [
                "The Service is intended for your personal, non-commercial use. You agree to use the Service in compliance with all applicable laws and regulations.",
                "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
                "Prohibited conduct includes, but is not limited to: attempting to breach our security measures, using the service for any illegal purpose, or uploading malicious code or data."
            ]
        },
        {
            icon: <Globe className="w-5 h-5 text-blue-600" />,
            title: "Third-Party Content and Services",
            content: [
                "Our AI Knowledge Discovery feature may provide links to third-party websites or resources. You acknowledge and agree that Diabetes Companion is not responsible or liable for the availability, accuracy, content, or policies of third-party websites or resources."
            ]
        },
        {
            icon: <ShieldX className="w-5 h-5 text-blue-600" />,
            title: "Limitation of Liability and Disclaimer of Warranties",
            content: [
                "**Disclaimer of Warranties:** The Service is provided on an \"AS IS\" and \"AS AVAILABLE\" basis. We make no warranties, express or implied, regarding the operation or availability of the Service, or the accuracy, reliability, or completeness of the information provided.",
                "**Limitation of Liability:** To the fullest extent permitted by applicable law, Diabetes Companion and its affiliates, officers, employees, and agents will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of, or inability to access or use, the Service."
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white animate-in fade-in duration-700">
            <header className="relative pt-16 pb-12 bg-slate-50/80 border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-4 border-slate-200 rounded-full shadow-sm">
                        <FileText className="w-8 h-8 text-slate-600" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900">Terms of Service</h1>
                    <p className="text-lg text-slate-500 font-medium">Last Updated: April 4, 2026</p>
                </div>
            </header>

            <main className="py-16">
                <div className="max-w-4xl mx-auto px-4 space-y-12">
                    <div className="p-8 bg-red-50 border-2 border-red-200/50 rounded-3xl">
                        <div className="grid md:grid-cols-[_5rem_1fr] gap-8">
                            <div className="flex justify-center md:justify-start pt-1">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-red-200">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-red-900">Critical Medical Disclaimer</h2>
                                <div className="prose prose-red max-w-none prose-li:text-red-800/90 prose-strong:text-red-900">
                                    <ul className="space-y-2">
                                        {sections[0].content.map((point, pIndex) => (
                                            <li key={pIndex} dangerouslySetInnerHTML={{ __html: point }} />
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {sections.slice(1).map((section, index) => (
                        <div key={index} className="grid md:grid-cols-[_5rem_1fr] gap-8 pt-8 border-t border-slate-100 first:border-t-0 first:pt-0">
                            <div className="flex justify-center md:justify-start pt-1">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
                                   {section.icon}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-800">{section.title}</h2>
                                <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-ul:space-y-2">
                                    <ul>
                                        {section.content.map((point, pIndex) => (
                                            <li key={pIndex} dangerouslySetInnerHTML={{ __html: point }} />
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default TermsOfService;
