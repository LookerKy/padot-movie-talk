"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Hash, Plus, X, Trash2, Loader2 } from "lucide-react";
import { cn, TAG_COLORS } from "@/lib/utils";
import { deleteTagAction } from "@/app/actions/tag";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/shared/confirm-modal";

interface Tag {
    id: string;
    name: string;
    color?: string | null;
}

interface TagPickerProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    availableTags: Tag[];
    onTagDelete?: (tagId: string) => void;
}

export function TagPicker({ selectedTags, onTagsChange, availableTags, onTagDelete }: TagPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

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

    const handleDeleteClick = (e: React.MouseEvent, tag: Tag) => {
        e.stopPropagation();
        setTagToDelete(tag);
    };

    const handleConfirmDelete = async () => {
        if (!tagToDelete) return;

        startTransition(async () => {
            const res = await deleteTagAction(tagToDelete.id);
            if (res.success) {
                if (selectedTags.includes(tagToDelete.name)) {
                    onTagsChange(selectedTags.filter(t => t !== tagToDelete.name));
                }
                router.refresh();
                if (onTagDelete) onTagDelete(tagToDelete.id);
                setTagToDelete(null);
            } else {
                alert(res.error || "삭제 실패");
            }
        });
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
                                    <div className="flex items-center gap-2">
                                        {isSelected && <Check size={14} className="text-padot-blue-400" />}
                                        <div
                                            role="button"
                                            onClick={(e) => handleDeleteClick(e, tag)}
                                            className="p-1 text-gray-500 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
                                            title="태그 삭제"
                                        >
                                            {isPending && tagToDelete?.id === tag.id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={12} />
                                            )}
                                        </div>
                                    </div>
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

            <ConfirmModal
                isOpen={!!tagToDelete}
                onClose={() => setTagToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="태그 삭제"
                description={`'${tagToDelete?.name}' 태그를 정말 삭제하시겠습니까?\n삭제된 태그는 복구할 수 없으며,\n모든 리뷰에서 제거됩니다.`}
                confirmText="삭제하기"
                isDestructive
                isLoading={isPending}
            />
        </div>
    );
}
