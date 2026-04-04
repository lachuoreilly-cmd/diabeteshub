
import React from 'react';
import { ShieldCheck, User, HeartPulse, BrainCircuit, Share2, Server, Trash2, Mail } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    const sections = [
        {
            icon: <User className="w-5 h-5 text-blue-600" />,
            title: "Information We Collect",
            content: [
                {
                    subtitle: "Data You Provide Directly:",
                    points: [
                        "**Account Information:** When you sign up, we collect your first name, last name, and email address to create and manage your account.",
                        "**Health & Profile Data:** To provide our core services, we collect health information you provide, such as vitals related to metabolic health, ethnicity, and dietary preferences.",
                        "**Family Profiles:** If you create profiles for family members, you are certifying that you have the legal authority or explicit consent to provide their personal and health information."
                    ]
                },
                {
                    subtitle: "Data from Third Parties:",
                    points: [
                        "**AI Knowledge Discovery:** When you use our AI-powered features to search for health topics, your queries are processed by Google's AI services to find and summarize relevant educational articles. We do not share your personal profile data in these queries."
                    ]
                }
            ]
        },
        {
            icon: <BrainCircuit className="w-5 h-5 text-blue-600" />,
            title: "How We Use Your Information",
            content: [
                {
                    points: [
                        "**To Provide and Personalize the Service:** We use your data to calculate your metabolic baseline, simulate health outcomes, predict your biological trajectory, and generate your personalized Action Plan.",
                        "**To Improve Our Services:** We may use anonymized and aggregated data to analyze trends, conduct research, and improve our application's features, accuracy, and effectiveness.",
                        "**To Communicate With You:** We may use your email address to send you service-related announcements, security notifications, and support messages."
                    ]
                }
            ]
        },
        {
            icon: <Share2 className="w-5 h-5 text-blue-600" />,
            title: "How We Share and Disclose Information",
            content: [
                 {
                    points: [
                        "We do not sell, rent, or trade your personal health information.",
                        "**Service Providers:** We partner with third-party companies to operate our application. We have verified that these partners adhere to strict data protection and privacy standards. These include:",
                        "  - **Google Cloud Platform:** For secure database hosting (Firestore) and application infrastructure.",
                        "  - **Google AI Platform:** To power our AI Health Coach and Knowledge Discovery features.",
                        "**Legal Compliance:** We may disclose your information if required to do so by law or in the good faith belief that such action is necessary to comply with a legal obligation, protect and defend our rights or property, or in urgent circumstances to protect the personal safety of users or the public."
                    ]
                }
            ]
        },
        {
            icon: <Server className="w-5 h-5 text-blue-600" />,
            title: "Data Security",
            content: [
                {
                    points: [
                        "We are committed to protecting your information. We implement industry-standard security safeguards, including:",
                        "**Encryption:** Using SSL/TLS to protect data in transit and encryption for data stored in our database at rest.",
                        "**Access Controls:** Implementing strict access controls to ensure that only authorized personnel can access sensitive information.",
                        "Despite these measures, no electronic transmission or storage is 100% secure. We cannot guarantee its absolute security."
                    ]
                }
            ]
        },
        {
            icon: <Trash2 className="w-5 h-5 text-blue-600" />,
            title: "Your Rights and Data Control",
            content: [
                {
                    points: [
                        "You have the right to access, review, and update your personal and health information at any time through your account dashboard.",
                        "You may request the deletion of your account and all associated data by contacting us. We will process your request in accordance with applicable laws."
                    ]
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white animate-in fade-in duration-700">
            <header className="relative pt-16 pb-12 bg-blue-50/80 border-b border-blue-100">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-4 border-blue-200 rounded-full shadow-sm">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900">Privacy Policy</h1>
                    <p className="text-lg text-slate-500 font-medium">Last Updated: April 4, 2026</p>
                </div>
            </header>

            <main className="py-16">
                <div className="max-w-4xl mx-auto px-4 space-y-12">
                    {sections.map((section, index) => (
                        <div key={index} className="grid md:grid-cols-[_5rem_1fr] gap-8">
                            <div className="flex justify-center md:justify-start pt-1">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
                                   {section.icon}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-800">{section.title}</h2>
                                {section.content.map((item, cIndex) => (
                                    <div key={cIndex} className="prose prose-slate max-w-none prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-700">
                                        {item.subtitle && <h4 className="font-bold text-slate-700 text-sm uppercase tracking-widest">{item.subtitle}</h4>}
                                        <ul className="space-y-2">
                                            {item.points.map((point, pIndex) => (
                                                <li key={pIndex} dangerouslySetInnerHTML={{ __html: point }} />
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="grid md:grid-cols-[_5rem_1fr] gap-8 pt-8 border-t border-slate-100">
                        <div className="flex justify-center md:justify-start pt-1">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
                                <Mail className="w-5 h-5 text-blue-600"/>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <h2 className="text-2xl font-black text-slate-800">Contact Us</h2>
                             <p className="text-slate-600">If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:privacy@diabetes-companion.ai" className="font-bold text-blue-600 hover:underline">privacy@diabetes-companion.ai</a></p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
