import { StatsView } from "@/components/stats/stats-view";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StatsPage() {
    const session = await getSession();
    // Public Access allowed

    return (
        <div className="space-y-6">
            <div className="text-center md:text-left max-w-6xl mx-auto pt-8">
                <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-padot-blue-500 to-purple-500 font-cookie tracking-wider mb-2 animate-fade-in-up">
                    페닷 어워즈 리포트
                </h1>
                <p className="text-gray-500 dark:text-gray-400 animate-fade-in-up delay-100">
                    지금까지 기록된 모든 영화 감상 데이터의 분석 결과입니다.
                </p>
            </div>

            <StatsView />
        </div>
    );
}
