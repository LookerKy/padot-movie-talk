import React from "react"

export const AnimatedBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50">
        {/* Base layer - transparent to let body gradient show, or use theme aware gradient */}
        {/* Base layer - transparent to let body gradient show, or use theme aware gradient */}
        {/* <div className="absolute inset-0 bg-background/50" /> */}

        {/* Floating orbs with glassmorphism - using primary/accent colors */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-chart-2/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/30 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Static gradient mesh */}
        <div className="absolute inset-0 opacity-20 dark:opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 via-transparent to-chart-1/10" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-chart-2/10 via-transparent to-chart-3/10" />
        </div>
    </div>
)
