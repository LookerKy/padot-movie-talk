"use client"

import * as React from "react"
import { List, Star, Tag, Award, Check, RotateCcw, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"
// import { Tag as TagType } from "@prisma/client" // Fix import
import { Tag as TagType } from "@/lib/types"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface FilterToolbarProps {
    tags: TagType[]
    currentMinRating: number | null
    currentTagIds: string[]
    isMustWatch: boolean
    viewMode: "grid" | "list"
    onRatingChange: (rating: number | null) => void
    onTagChange: (tagIds: string[]) => void
    onBadgeChange: (isMustWatch: boolean) => void
    onViewModeChange: (mode: "grid" | "list") => void
    onReset: () => void
}

interface FilterButtonProps {
    onClick?: () => void
    isActive?: boolean
    children: React.ReactNode
    className?: string
}

const FilterButton = React.forwardRef<HTMLButtonElement, FilterButtonProps>(
    ({ onClick, isActive, children, className, ...props }, ref) => (
        <Button
            ref={ref}
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={cn(
                "h-9 px-3 transition-all duration-300",
                "bg-white/50 dark:bg-black/20 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl",
                "hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-md",
                "text-slate-700 dark:text-slate-200",
                isActive && "bg-padot-blue-500/10 border-padot-blue-500 text-padot-blue-600 dark:text-padot-blue-400 font-medium shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </Button>
    )
)
FilterButton.displayName = "FilterButton"

export function FilterToolbar({
    tags,
    currentMinRating,
    currentTagIds,
    isMustWatch,
    viewMode,
    onRatingChange,
    onTagChange,
    onBadgeChange,
    onViewModeChange,
    onReset,
}: FilterToolbarProps) {

    const handleTagToggle = (tagId: string) => {
        if (currentTagIds.includes(tagId)) {
            onTagChange(currentTagIds.filter(id => id !== tagId))
        } else {
            onTagChange([...currentTagIds, tagId])
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                {/* Reset Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onReset}
                    className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-transform active:rotate-180"
                    title="초기화"
                >
                    <RotateCcw size={16} />
                </Button>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                {/* Star Rating Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <FilterButton isActive={!!currentMinRating}>
                            <Star className={cn("mr-2 h-4 w-4", currentMinRating && "fill-current")} />
                            {currentMinRating ? `${currentMinRating}점+` : "별점"}
                        </FilterButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[160px] p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-xl">
                        <DropdownMenuItem
                            onClick={() => onRatingChange(null)}
                            className="rounded-lg focus:bg-slate-100 dark:focus:bg-slate-800"
                        >
                            모든 별점
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <DropdownMenuItem
                                key={rating}
                                onClick={() => onRatingChange(rating)}
                                className="rounded-lg focus:bg-slate-100 dark:focus:bg-slate-800 flex justify-between"
                            >
                                <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-slate-300 text-slate-300" />
                                    {rating}점 이상
                                </span>
                                {currentMinRating === rating && <Check className="h-3 w-3 text-padot-blue-500" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Tag Filter (Multi-select) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <FilterButton isActive={currentTagIds.length > 0}>
                            <Tag className="mr-2 h-4 w-4" />
                            {currentTagIds.length > 0 ? `${currentTagIds.length} 선택됨` : "태그"}
                        </FilterButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[220px] max-h-[400px] overflow-y-auto p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-xl scrollbar-thin">
                        <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 mb-1">
                            태그 선택 (중복 가능)
                        </div>
                        {tags.map((tag) => {
                            const isSelected = currentTagIds.includes(tag.id)
                            return (
                                <DropdownMenuItem
                                    key={tag.id}
                                    onSelect={(e) => {
                                        e.preventDefault() // Prevent closing
                                        handleTagToggle(tag.id)
                                    }}
                                    className="rounded-lg focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer mb-0.5"
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <div
                                            className={cn(
                                                "w-4 h-4 rounded-md border flex items-center justify-center transition-colors",
                                                isSelected
                                                    ? "bg-padot-blue-500 border-padot-blue-500 text-white"
                                                    : "border-slate-300 dark:border-slate-600 bg-transparent"
                                            )}
                                        >
                                            {isSelected && <Check size={10} />}
                                        </div>
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: tag.color || '#888' }}
                                        />
                                        <span className="truncate flex-1">{tag.name}</span>
                                    </div>
                                </DropdownMenuItem>
                            )
                        })}
                        {currentTagIds.length > 0 && (
                            <>
                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                <DropdownMenuItem
                                    onClick={() => onTagChange([])}
                                    className="rounded-lg focus:bg-red-50 text-red-500 hover:text-red-600 justify-center font-medium text-xs"
                                >
                                    선택 해제
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Badge Filter */}
                <FilterButton
                    onClick={() => onBadgeChange(!isMustWatch)}
                    isActive={isMustWatch}
                    className={cn(
                        isMustWatch && "bg-yellow-500/10 border-yellow-500 text-yellow-600 dark:text-yellow-400"
                    )}
                >
                    <Award className="mr-2 h-4 w-4" />
                    닷슐랭
                    {isMustWatch && <Check className="ml-1.5 h-3 w-3" />}
                </FilterButton>
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <button
                    onClick={() => onViewModeChange("grid")}
                    className={cn(
                        "p-2 rounded-lg transition-all flex items-center gap-1.5",
                        viewMode === "grid"
                            ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    )}
                    title="카드 보기"
                >
                    <LayoutGrid size={18} />
                </button>
                <button
                    onClick={() => onViewModeChange("list")}
                    className={cn(
                        "p-2 rounded-lg transition-all flex items-center gap-1.5",
                        viewMode === "list"
                            ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    )}
                    title="리스트 보기"
                >
                    <List size={18} />
                </button>
            </div>
        </div>
    )
}
