import React from "react"

export const AnimatedBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 bg-[#0A0A0A]" />

        {/* Floating orbs with glassmorphism */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Static gradient mesh */}
        <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/20 via-transparent to-blue-600/20" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-pink-600/20 via-transparent to-cyan-600/20" />
        </div>

        {/* Subtle noise texture */}
        {/* Subtle noise texture - File missing, removed to fix 404 */}
        {/* <div className="absolute inset-0 opacity-[0.02] bg-[url('/noise.png')] mix-blend-overlay" /> */}
    </div>
)
