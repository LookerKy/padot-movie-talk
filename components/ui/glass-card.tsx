import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hoverEffect?: boolean;
}

export function GlassCard({ className, children, hoverEffect = true, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "glass rounded-xl p-6 transition-all duration-300",
                hoverEffect && "hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02]",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
