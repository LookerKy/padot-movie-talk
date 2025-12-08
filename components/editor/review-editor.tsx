"use client";

import GlassTiptapEditor from "./glass-tiptap-editor";

interface ReviewEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export function ReviewEditor({ content, onChange, placeholder }: ReviewEditorProps) {
    return (
        <GlassTiptapEditor
            content={content}
            onChange={onChange}
        />
    );
}

