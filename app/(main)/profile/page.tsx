import { PasswordChangeForm } from "@/components/settings/password-change-form";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Shield } from "lucide-react";

export default async function ProfilePage() {
    const session = await getSession();
    if (!session || !session.user) {
        redirect("/");
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20 pt-10">
            {/* Header / User Info Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-padot-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <User size={64} className="text-white" />
                </div>
                <div className="text-center md:text-left space-y-2 flex-1">
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        {session.user.name || session.user.username}
                    </h1>
                    <p className="text-gray-400 font-medium text-lg">
                        {session.user.email}
                    </p>
                    <div className="flex justify-center md:justify-start gap-3 mt-4">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-gray-300 border border-white/5">
                            {session.user.role}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/10">
                            Active
                        </span>
                    </div>
                </div>
            </div>

            {/* Settings Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar / Navigation (Future Proofing) */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-2">Settings</h3>
                    <div className="space-y-1">
                        <button className="w-full text-left px-4 py-3 rounded-xl bg-white/10 text-white font-medium border border-white/10 flex items-center gap-3">
                            <Shield size={18} />
                            보안 설정
                        </button>
                        {/* Add more tabs here later */}
                    </div>
                </div>

                {/* Content Area */}
                <div className="md:col-span-2">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
                        <PasswordChangeForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
