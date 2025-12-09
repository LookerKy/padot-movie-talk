"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Hash, Plus, X } from "lucide-react";
import { cn, TAG_COLORS } from "@/lib/utils";

interface Tag {
    id: string;
    name: string;
    color?: string | null;
}

interface TagPickerProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    availableTags: Tag[];
}

export function TagPicker({ selectedTags, onTagsChange, availableTags }: TagPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredTags = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleTag = (tagName: string) => {
        if (selectedTags.includes(tagName)) {
            onTagsChange(selectedTags.filter(t => t !== tagName));
        } else {
            onTagsChange([...selectedTags, tagName]);
        }
    };

    const createNewTag = () => {
        if (search && !selectedTags.includes(search)) {
            toggleTag(search);
            setSearch("");
        }
    };

    return (
        <div className="space-y-3" ref={containerRef}>
            {/* Selected Tags Display */}
            <div className="flex flex-wrap gap-3 min-h-[32px]">
                {selectedTags.map(tag => (
                    <Badge
                        key={tag}
                        className="bg-white/10 text-white hover:bg-white/20 border-0 px-3 py-1.5 flex items-center gap-2 text-sm font-medium transition-all"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className="text-white/50 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </Badge>
                ))}

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-sm text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
                >
                    <Plus size={14} />
                    <span>태그 추가</span>
                </button>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-64 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-white/10">
                        <input
                            autoFocus
                            placeholder="태그 검색 또는 생성..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    // Prevent duplicate submission during IME composition (Korean)
                                    if (e.nativeEvent.isComposing) return;
                                    e.preventDefault();
                                    createNewTag();
                                }
                            }}
                            className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none px-2 py-1"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1">
                        <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
                            TAGS
                        </div>
                        {filteredTags.map(tag => {
                            const isSelected = selectedTags.includes(tag.name);
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => toggleTag(tag.name)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors group",
                                        isSelected ? "bg-padot-blue-500/20 text-padot-blue-300" : "text-gray-300 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn("w-2 h-2 rounded-full", isSelected ? "ring-2 ring-padot-blue-400 ring-offset-1 ring-offset-zinc-900" : "")}
                                            style={{ backgroundColor: tag.color || TAG_COLORS[tag.name.length % TAG_COLORS.length] }}
                                        />
                                        <span>{tag.name}</span>
                                    </div>
                                    {isSelected && <Check size={14} className="text-padot-blue-400" />}
                                </button>
                            )
                        })}

                        {search && !availableTags.find(t => t.name === search) && (
                            <button
                                type="button"
                                onClick={createNewTag}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                <Plus size={14} />
                                <span>"{search}" 생성</span>
                            </button>
                        )}

                        {filteredTags.length === 0 && !search && (
                            <div className="px-4 py-8 text-center text-xs text-gray-600">
                                사용 가능한 태그가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
