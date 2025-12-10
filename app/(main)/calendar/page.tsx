import { MonthView } from "@/components/calendar/month-view";

import { getSession } from "@/lib/auth";

export default async function CalendarPage() {
    const session = await getSession();

    return (
        <div className="animate-fade-in space-y-6 max-w-6xl mx-auto px-6 pt-6">
            <div>
                <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-padot-blue-500 via-purple-500 to-pink-500 dark:from-padot-blue-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm tracking-wide">
                    시네티 캘린더
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    SOOP 시네티 일정 및 페닷 시청 기록
                </p>
            </div>

            <MonthView user={session?.user} />
        </div>
    );
}
