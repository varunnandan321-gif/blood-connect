import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <div className="bg-[#fdfaf9] dark:bg-stone-950 min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-medical-red/20 selection:text-medical-red">
            <div className="container mx-auto max-w-4xl px-6 py-12 lg:py-20">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-medical-red hover:text-red-700 dark:hover:text-red-400 transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 mb-6 tracking-tight">Privacy Policy</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm font-medium">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-8 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">1. Introduction</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            Welcome to Blood Connect. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">2. The Data We Collect About You</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                            <li><strong>Medical Data:</strong> includes blood group necessary for connecting donors with recipients.</li>
                            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">3. How We Use Your Personal Data</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-600 dark:text-slate-300">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., matching you to a blood recipient).</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal obligation.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">4. Data Security</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            We have put in place appropriate secure measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. Data is encrypted and managed through secure cloud authentication providers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">5. Contact Us</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            If you have any questions about this privacy policy or our privacy practices, please contact our data privacy manager at privacy@bloodconnect.example.com.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
