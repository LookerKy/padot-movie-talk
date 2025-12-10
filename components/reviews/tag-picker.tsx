"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Hash, Plus, X, Trash2, Loader2 } from "lucide-react";
import { cn, TAG_COLORS } from "@/lib/utils";
import { deleteTagAction, createTagAction } from "@/app/actions/tag";
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
    onTagCreate?: (tag: Tag) => void;
}

export function TagPicker({ selectedTags, onTagsChange, availableTags, onTagDelete, onTagCreate }: TagPickerProps) {
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
            startTransition(async () => {
                const res = await createTagAction(search);
                if (res.success && res.tag) {
                    if (onTagCreate) {
                        onTagCreate(res.tag);
                    }
                    // Add to selected tags immediately
                    toggleTag(res.tag.name);
                    setSearch("");
                } else {
                    alert(res.error || "태그 생성 실패");
                }
            });
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
                {selectedTags.map(tagName => {
                    const tagInfo = availableTags.find(t => t.name === tagName);
                    return (
                        <Badge
                            key={tagName}
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border-0 px-3 py-1.5 flex items-center gap-2 text-sm font-medium transition-all"
                        >
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: tagInfo?.color || TAG_COLORS[tagName.length % TAG_COLORS.length] }}
                            />
                            {tagName}
                            <button
                                type="button"
                                onClick={() => toggleTag(tagName)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </Badge>
                    );
                })}

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-gray-400 dark:border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
                >
                    <Plus size={14} />
                    <span>태그 추가</span>
                </button>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-64 mt-2 bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-border">
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
                            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none px-2 py-1"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1">
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
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
                                        isSelected
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn("w-2 h-2 rounded-full", isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-popover" : "")}
                                            style={{ backgroundColor: tag.color || TAG_COLORS[tag.name.length % TAG_COLORS.length] }}
                                        />
                                        <span>{tag.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isSelected && <Check size={14} className="text-primary" />}
                                        <div
                                            role="button"
                                            onClick={(e) => handleDeleteClick(e, tag)}
                                            className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
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
                                disabled={isPending}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
                            >
                                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                <span>"{search}" 생성</span>
                            </button>
                        )}

                        {filteredTags.length === 0 && !search && (
                            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
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
