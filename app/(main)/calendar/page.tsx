import { MonthView } from "@/components/calendar/month-view";

import { getSession } from "@/lib/auth";

export default async function CalendarPage() {
    const session = await getSession();

    return (
        <div className="animate-fade-in space-y-6 max-w-6xl mx-auto px-6 pt-6">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-padot-blue-600 to-purple-600 dark:from-padot-blue-400 dark:to-purple-400 mb-2">
                    시네티 캘린더 📅
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    SOOP 시네티 일정 및 페닷 시청 기록
                </p>
            </div>

            <MonthView user={session?.user} />
        </div>
    );
}
