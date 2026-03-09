import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
    return (
        <div className="bg-[#fdfaf9] dark:bg-stone-950 min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-medical-red/20 selection:text-medical-red">
            <div className="container mx-auto max-w-4xl px-6 py-12 lg:py-20">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-medical-red hover:text-red-700 dark:hover:text-red-400 transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 mb-6 tracking-tight">Terms of Service</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm font-medium">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-8 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">1. Agreement to Terms</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            By accessing or using Blood Connect, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">2. Use License</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            Permission is granted to temporarily access the materials (information or software) on Blood Connect&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-600 dark:text-slate-300">
                            <li>Modify or copy the materials;</li>
                            <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                            <li>Attempt to decompile or reverse engineer any software contained on the website;</li>
                            <li>Remove any copyright or other proprietary notations from the materials.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">3. Disclaimer</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            The materials on Blood Connect are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights. We act strictly as a bridge between donors and recipients and are not responsible for medical outcomes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">4. Accuracy of Information</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            You agree to provide true, accurate, current, and complete information about yourself as prompted by the platform&apos;s registration form, including but not limited to your actual blood group. Impersonating others or providing false medical data is strictly prohibited and will result in immediate termination of your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">5. Modifications</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            Blood Connect may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
