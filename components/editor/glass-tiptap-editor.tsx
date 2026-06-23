"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { TextStyle } from "@tiptap/extension-text-style"
import TextAlign from "@tiptap/extension-text-align"
import { FontSize } from "./extensions/font-size"
import { PreserveMarks } from "./extensions/preserve-marks"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Link2,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Sparkles,
    Type,
    Minus,
    Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ToolbarButtonProps {
    onClick: () => void
    isActive?: boolean
    children: React.ReactNode
    title: string
}

const ToolbarButton = ({ onClick, isActive, children, title }: ToolbarButtonProps) => (
    <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
            e.preventDefault() // Prevent focus loss
            onClick()
        }}
        className={cn(
            "h-9 w-9 p-0 transition-all duration-300 hover:scale-105",
            "bg-secondary/50 backdrop-blur-md border border-gray-400 dark:border-border rounded-xl",
            "hover:bg-secondary hover:border-primary/30 hover:shadow-lg hover:shadow-purple-500/20",
            "group relative overflow-hidden",
            isActive && "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-400/50 shadow-lg shadow-purple-500/20"
        )}
        title={title}
    >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/20 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <div className="relative z-10 text-muted-foreground group-hover:text-foreground transition-colors">
            {children}
        </div>
    </Button>
)

interface GlassTiptapEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

const GlassTiptapEditor = ({ content: initialContent, onChange, placeholder = " " }: GlassTiptapEditorProps) => {
    const [activeFontSize, setActiveFontSize] = useState("24px")
    // 사용자가 마지막으로 "설정한" 폰트 사이즈 (구조 변경 시 복원용)
    const [userSetFontSize, setUserSetFontSize] = useState("24px")
    // 트랜잭션 핸들러 내에서 최신 state 접근을 위한 ref
    const userSetFontSizeRef = React.useRef("24px")
    // 트랜잭션 간 폰트 사이즈 추적 (리스트 변환 시 마크 소실 방지용)
    const lastKnownFontSizeRef = React.useRef("24px")

    // 플랫폼 감지 (Mac 여부)
    const [isMac] = useState(() =>
        typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf('MAC') >= 0
    )

    const modifier = isMac ? "⌘" : "Ctrl"
    const modifierKey = isMac ? "Cmd" : "Ctrl"

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass:
                    "before:content-[attr(data-placeholder)] before:text-white/40 before:float-left before:pointer-events-none",
            }),
            TextStyle,
            FontSize,
            // UnderlineExtension is explicitly reported as duplicate, removing it to test if StarterKit or another ext provides it.
            // If functionality breaks, we'll revert. But usually StarterKit doesn't have it.
            // Check: maybe it's instantiated twice?
            // Actually, let's just comment it out.
            // UnderlineExtension, 
            TextAlign.configure({
                types: ['heading', 'paragraph', 'bulletList', 'orderedList'],
            }),
            PreserveMarks, // Preserve font size when exiting lists
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: cn(
                    "min-h-[500px] p-8 focus:outline-none relative z-10",
                    "prose prose-lg max-w-none font-sans dark:prose-invert text-[24px]",
                    "transition-all duration-300",
                    "text-foreground leading-relaxed",
                    "selection:bg-purple-500/30 selection:text-foreground",
                    "[&>h1]:text-4xl [&>h1]:font-bold [&>h1]:text-foreground [&>h1]:mb-6 [&>h1]:mt-8",
                    "[&>h2]:text-3xl [&>h2]:font-semibold [&>h2]:text-foreground/95 [&>h2]:mb-4 [&>h2]:mt-6",
                    "[&>h3]:text-2xl [&>h3]:font-medium [&>h3]:text-foreground/90 [&>h3]:mb-3 [&>h3]:mt-5",
                    "[&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-foreground/90",
                    "[&>ul]:mb-6 [&>ul]:text-foreground/90",
                    "[&>ol]:mb-6 [&>ol]:text-foreground/90",
                    // List styles are handled by standard CSS inheritance usually, 
                    // but we can add specific padding if needed. Tiptap usually nests lists properly.
                    "[&>ul]:pl-6",
                    "[&>ol]:pl-6",
                    "[&_li]:mb-2 [&_li]:text-foreground/90",
                    "[&_li::marker]:!text-foreground/70", // Force marker
                    "[&_li]:!text-foreground/90", // Force list text
                    "[&>blockquote]:border-l-4 [&>blockquote]:border-purple-400 [&>blockquote]:pl-6 [&>blockquote]:py-3 [&>blockquote]:italic [&>blockquote]:text-muted-foreground [&>blockquote]:bg-purple-500/5 [&>blockquote]:backdrop-blur-sm [&>blockquote]:rounded-r-xl [&>blockquote]:my-6",
                    "[&>pre]:bg-muted/50 [&>pre]:backdrop-blur-sm [&>pre]:p-6 [&>pre]:rounded-xl [&>pre]:font-mono [&>pre]:text-sm [&>pre]:text-foreground [&>pre]:overflow-x-auto [&>pre]:border [&>pre]:border-gray-200 dark:[&>pre]:border-border",
                    "[&>code]:bg-purple-500/10 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono [&>code]:text-purple-600 dark:[&>code]:text-purple-300",
                    "[&_a]:text-purple-500 dark:[&_a]:text-purple-300 [&_a]:underline [&_a]:decoration-purple-500/30 [&_a]:underline-offset-2",
                    "[&_strong]:!text-foreground [&_b]:!text-foreground", // Force Bold
                    "hover:[&_a]:decoration-purple-500 [&_a]:transition-colors"
                ),
            },
        },
        // Use onTransaction to catch all state changes including stored marks
        onTransaction: ({ editor }) => {
            const attrs = editor.getAttributes('textStyle');

            // 구조적 블록(헤더, 인용구)일 때는 activeFontSize를 업데이트하지 않음 (드롭다운 표시 유지)
            // 리스트는 내부 텍스트의 폰트 사이즈를 따르도록 허용
            const isInStructuralBlock = editor.isActive('heading') ||
                editor.isActive('blockquote');

            if (!isInStructuralBlock) {
                // 리스트 내부여도 텍스트 스타일이 있으면 그것을 표시
                const currentSize = attrs.fontSize || '24px';
                setActiveFontSize(currentSize);

                // 유효한 폰트 사이즈가 감지되면 Ref 업데이트
                if (attrs.fontSize) {
                    lastKnownFontSizeRef.current = attrs.fontSize;
                }
            } else {
                // 구조적 블록 내부 (헤더 등)에서도 폰트 사이즈가 있다면 추적
                if (attrs.fontSize) {
                    lastKnownFontSizeRef.current = attrs.fontSize;
                }
            }

            // 🚨 리스트 입력 규칙(Input Rule) 대응:
            // 마크다운(- space)으로 리스트 생성 시 마크가 소실되는 현상 감지 및 복구
            const isInList = editor.isActive('bulletList') || editor.isActive('orderedList');
            if (isInList && !attrs.fontSize) {
                const targetSize = lastKnownFontSizeRef.current;

                // 현재 폰트가 없고, 이전 폰트가 기본값이 아닐 때 복원 시도
                if (targetSize && targetSize !== '24px') {
                    // 무한 루프 방지 및 안전한 실행을 위해 setTimeout 사용
                    setTimeout(() => {
                        if (editor.isDestroyed || editor.isActive('heading')) return; // 헤더는 제외

                        // 다시 한 번 확인 (사용자가 지웠을 수도 있으므로)
                        const currentAttrs = editor.getAttributes('textStyle');
                        if (!currentAttrs.fontSize) {
                            editor.chain()
                                .focus()
                                .setMark('textStyle', { fontSize: targetSize })
                                .run();
                        }
                    }, 0);
                }
            }

            // 🚨 Sticky Font Size Logic (빈 줄 클릭 시 폰트 유지)
            // 커서가 빈 줄(내용 없음)로 이동했을 때, 사용자가 설정한 폰트 사이즈(예: 24px)를 강제 적용
            const { selection } = editor.state;
            const { $from } = selection;
            const isNodeEmpty = $from.parent.content.size === 0;
            const isDefaultNode = $from.parent.type.name === 'paragraph';

            if (selection.empty && isNodeEmpty && isDefaultNode) {
                const currentFontSize = attrs.fontSize;
                const userPreferredSize = userSetFontSizeRef.current;

                // 현재 폰트 사이즈가 없고(기본 18px 상태), 사용자가 설정한 폰트가 18px이 아닐 때
                if (!currentFontSize && userPreferredSize && userPreferredSize !== '24px') {
                    // 즉시 마크 적용 (setTimeout 없이, 다음 입력부터 적용되도록)
                    // 주의: onTransaction 내에서 직접 dispatch하면 루프 위험이 있으므로
                    // setTimeout을 사용하여 비동기로 처리
                    setTimeout(() => {
                        if (editor.isDestroyed) return;

                        // 다시 확인 (상태가 변했을 수 있음)
                        const currentAttrs = editor.getAttributes('textStyle');
                        const isStillEmpty = editor.state.selection.$from.parent.content.size === 0;

                        if (!currentAttrs.fontSize && isStillEmpty) {
                            editor.chain()
                                .setMark('textStyle', { fontSize: userPreferredSize })
                                .run();
                        }
                    }, 0);
                }
            }

            onChange(editor.getHTML())
        },
        immediatelyRender: false
    })

    const fontSizes = [
        { label: "18px", value: "18px" },
        { label: "20px", value: "20px" },
        { label: "22px", value: "22px" },
        { label: "24px", value: "24px" },
        { label: "32px", value: "32px" },
        { label: "40px", value: "40px" },
    ]

    const setFontSize = (size: string) => {
        // 사용자가 설정한 폰트 사이즈 저장
        setUserSetFontSize(size)
        userSetFontSizeRef.current = size

        // Use setTimeout to ensure editor focus happens after Dropdown interaction closes
        setTimeout(() => {
            editor?.chain().focus().setFontSize(size).run()
        }, 0)
    }

    const setLink = useCallback(() => {
        const previousUrl = editor?.getAttributes("link").href
        const url = window.prompt("URL", previousUrl)

        if (url === null) {
            return
        }

        if (url === "") {
            editor?.chain().focus().extendMarkRange("link").unsetLink().run()
            return
        }

        editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }, [editor])

    // 제목 토글 (제목 자체 스타일 우선)
    const toggleHeading = useCallback((level: 1 | 2 | 3) => {
        editor?.chain().focus().toggleHeading({ level }).run()
    }, [editor])

    // 인용구 토글 (마크 보존)
    const toggleBlockquote = useCallback(() => {
        if (!editor) return

        // 현재 폰트 사이즈와 정렬 캡처 (실제 적용된 값)
        const currentFontSize = editor.getAttributes('textStyle').fontSize || userSetFontSize;
        const currentTextAlign = editor.isActive({ textAlign: 'center' }) ? 'center'
            : editor.isActive({ textAlign: 'right' }) ? 'right' : 'left';

        // 현재 선택 범위 저장
        const { from, to } = editor.state.selection;
        const hasSelection = from !== to;

        // 마크 먼저 설정
        const chain = editor.chain().focus();

        // 선택된 텍스트가 있으면 전체 선택, 없으면 현재 줄 선택
        if (!hasSelection) {
            const { $from } = editor.state.selection;
            chain.setTextSelection({ from: $from.start(), to: $from.end() });
        }

        // 마크 먼저 설정
        chain
            .setFontSize(currentFontSize)
            .setTextAlign(currentTextAlign)
            .run();

        // 인용구 토글
        setTimeout(() => {
            if (!editor || editor.isDestroyed) return;
            editor.chain().focus().toggleBlockquote().run()
        }, 10)
    }, [editor, userSetFontSize])

    // 구분선 삽입 (마크 보존)
    const insertDivider = useCallback(() => {
        if (!editor) return

        // 현재 폰트 사이즈와 정렬 캡처
        const currentFontSize = editor.getAttributes('textStyle').fontSize || userSetFontSize;
        const currentTextAlign = editor.isActive({ textAlign: 'center' }) ? 'center'
            : editor.isActive({ textAlign: 'right' }) ? 'right' : 'left';

        let chain = editor.chain().focus()

        // 리스트 안에 있으면 먼저 빠져나오기
        if (editor.isActive('bulletList') || editor.isActive('orderedList')) {
            chain = chain.liftListItem('listItem')
        }

        // 구분선 삽입
        chain.setHorizontalRule().run()

        // 마크 복원
        setTimeout(() => {
            if (!editor || editor.isDestroyed) return;
            editor.chain()
                .focus()
                .setFontSize(currentFontSize)
                .setTextAlign(currentTextAlign)
                .run()
        }, 10)
    }, [editor, userSetFontSize])

    // 리스트 토글 (keepMarks 옵션으로 자동 보존)
    const toggleList = useCallback((type: 'bulletList' | 'orderedList') => {
        if (!editor) return

        // 현재 폰트 사이즈 캡처
        const currentFontSize = editor.getAttributes('textStyle').fontSize || userSetFontSize;

        // 체인 시작
        let chain = editor.chain().focus();

        if (type === 'bulletList') {
            chain = chain.toggleBulletList();
        } else {
            chain = chain.toggleOrderedList();
        }

        // 리스트 토글 후 폰트 사이즈 재적용
        chain.command(({ tr, state, dispatch }) => {
            if (dispatch) {
                const { selection } = state;
                // 현재 선택된 블록(리스트 아이템)의 텍스트에 폰트 사이즈 적용
                tr.addMark(
                    selection.from,
                    selection.to,
                    state.schema.marks.textStyle.create({ fontSize: currentFontSize })
                );
            }
            return true;
        }).run();

    }, [editor, userSetFontSize])

    // activeFontSize 변경 시 userSetFontSize 자동 업데이트
    // (일반 텍스트일 때만 - 헤더/리스트/인용구는 제외)
    useEffect(() => {
        if (editor && !editor.isDestroyed) {
            // 구조적 블록(헤더, 인용구)이 아닐 때만 업데이트
            // 리스트는 허용
            const isInStructuralBlock = editor.isActive('heading') ||
                editor.isActive('blockquote');

            if (!isInStructuralBlock && activeFontSize) {
                userSetFontSizeRef.current = activeFontSize;
            }
        }
    }, [editor, activeFontSize, userSetFontSize])

    if (!editor) {
        return null
    }

    // Calculate words and characters
    // Manual count using editor.getText() since CharacterCount extension is optional
    const contentText = editor.getText();
    const wordCount = contentText.split(/\s+/).filter(Boolean).length;
    const charCount = contentText.length;

    return (
        <div className="relative w-full">
            <div className="w-full glass-card overflow-hidden relative z-10">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-500/5 pointer-events-none" />

                <div className="flex flex-wrap items-center gap-2 p-4 md:p-6 border-b border-gray-400 dark:border-border/50 bg-background/30 backdrop-blur-sm relative">
                    <div className="flex items-center gap-1">
                        <div className="flex items-center gap-2 mr-4 hidden md:flex">
                            <div className="p-2 bg-purple-500/10 backdrop-blur-sm rounded-xl border border-purple-400/20">
                                <Sparkles className="h-4 w-4 text-purple-500 dark:text-purple-300" />
                            </div>
                        </div>

                        {/* Font Size Button */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 gap-1 bg-secondary/50 backdrop-blur-md border border-gray-400 dark:border-border rounded-xl hover:bg-secondary text-foreground"
                                >
                                    <Type className="h-4 w-4" />
                                    <span className="text-xs">{activeFontSize}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                onCloseAutoFocus={(e) => e.preventDefault()}
                                align="start"
                                className="w-[120px] p-1.5 backdrop-blur-xl border border-border shadow-2xl rounded-xl"
                            >
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mb-0.5">
                                    Size
                                </div>
                                {fontSizes.map(({ label, value }) => (
                                    <DropdownMenuItem
                                        key={value}
                                        onSelect={() => {
                                            setFontSize(value)
                                        }}
                                        className="rounded-lg focus:bg-purple-500/10 focus:text-purple-600 dark:focus:text-purple-400 cursor-pointer flex justify-between items-center py-2"
                                    >
                                        <span className={cn(activeFontSize === value ? "font-medium" : "")}>{label}</span>
                                        {activeFontSize === value && <Check className="h-3 w-3 text-purple-500" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Separator orientation="vertical" className="h-6 mx-3 bg-border hidden md:block" />

                        <ToolbarButton
                            onClick={() => toggleHeading(1)}
                            isActive={editor.isActive("heading", { level: 1 })}
                            title="Heading 1"
                        >
                            <Heading1 className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => toggleHeading(2)}
                            isActive={editor.isActive("heading", { level: 2 })}
                            title="Heading 2"
                        >
                            <Heading2 className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => toggleHeading(3)}
                            isActive={editor.isActive("heading", { level: 3 })}
                            title="Heading 3"
                        >
                            <Heading3 className="h-4 w-4" />
                        </ToolbarButton>
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-3 bg-border hidden md:block" />

                    <div className="flex items-center gap-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            isActive={editor.isActive("bold")}
                            title={`Bold (${modifierKey}+B)`}
                        >
                            <Bold className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            isActive={editor.isActive("italic")}
                            title={`Italic (${modifierKey}+I)`}
                        >
                            <Italic className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            isActive={editor.isActive("underline")}
                            title={`Underline (${modifierKey}+U)`}
                        >
                            <Underline className="h-4 w-4" />
                        </ToolbarButton>
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-3 bg-border hidden md:block" />

                    <div className="flex items-center gap-1">
                        <ToolbarButton
                            onClick={() => toggleList('bulletList')}
                            isActive={editor.isActive("bulletList")}
                            title="Bullet List"
                        >
                            <List className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => toggleList('orderedList')}
                            isActive={editor.isActive("orderedList")}
                            title="Numbered List"
                        >
                            <ListOrdered className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={toggleBlockquote}
                            isActive={editor.isActive("blockquote")}
                            title="Quote"
                        >
                            <Quote className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={insertDivider}
                            title="Divider"
                        >
                            <Minus className="h-4 w-4" />
                        </ToolbarButton>
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-3 bg-border hidden md:block" />

                    <div className="flex items-center gap-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign("left").run()}
                            isActive={editor.isActive({ textAlign: "left" })}
                            title="Align Left"
                        >
                            <AlignLeft className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign("center").run()}
                            isActive={editor.isActive({ textAlign: "center" })}
                            title="Align Center"
                        >
                            <AlignCenter className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign("right").run()}
                            isActive={editor.isActive({ textAlign: "right" })}
                            title="Align Right"
                        >
                            <AlignRight className="h-4 w-4" />
                        </ToolbarButton>
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-3 bg-border hidden md:block" />

                    <div className="flex items-center gap-1">
                        <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Insert Link">
                            <Link2 className="h-4 w-4" />
                        </ToolbarButton>
                    </div>
                </div>

                <div className="relative">
                    <EditorContent editor={editor} />
                </div>

                <div className="flex items-center justify-between px-8 py-6 border-t border-gray-400 dark:border-border/50 bg-muted/20 backdrop-blur-xl text-sm text-muted-foreground relative">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <Type className="h-4 w-4 text-purple-500/70" />
                            Words: <span className="text-foreground font-medium">{wordCount}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            Characters: <span className="text-foreground font-medium">{charCount}</span>
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                        <kbd className="px-2 py-1 bg-background backdrop-blur-sm rounded-lg text-xs border border-border shadow-sm">
                            {modifier}B
                        </kbd>
                        <span>Bold</span>
                        <kbd className="px-2 py-1 bg-background backdrop-blur-sm rounded-lg text-xs border border-border shadow-sm">
                            {modifier}I
                        </kbd>
                        <span>Italic</span>
                        <kbd className="px-2 py-1 bg-background backdrop-blur-sm rounded-lg text-xs border border-border shadow-sm">
                            {modifier}U
                        </kbd>
                        <span>Underline</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GlassTiptapEditor
