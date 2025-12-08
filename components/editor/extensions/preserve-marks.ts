import { Extension } from '@tiptap/core';

/**
 * PreserveMarks Extension (우선순위 개선 버전)
 *
 * 블록 타입별 우선순위:
 * 1. 헤더(H1/H2/H3): 제목 자체 스타일 우선, 탈출 시 사용자 설정 폰트로 복원
 * 2. 리스트/인용구: 기존 마크(fontSize, bold, italic) 보존
 *
 * 동작 방식:
 * - 헤더에서 Enter → 일반 텍스트로 → editor.storage.userSetFontSize 적용
 * - 리스트/인용구에서 Enter → 일반 텍스트로 → 기존 마크 복원
 */
export const PreserveMarks = Extension.create({
    name: 'preserveMarks',

    addKeyboardShortcuts() {
        return {
            Enter: ({ editor }) => {
                const { $from } = editor.state.selection;

                // 현재 블록 타입 확인
                const isInList = editor.isActive('bulletList') || editor.isActive('orderedList');
                const isInHeading = editor.isActive('heading');
                const isInBlockquote = editor.isActive('blockquote');

                // 구조적 블록이 아니면 기본 동작
                if (!isInList && !isInHeading && !isInBlockquote) {
                    return false;
                }

                // 현재 마크 저장 (리스트/인용구용)
                const currentMarks = editor.state.storedMarks || $from.marks();

                // 기본 Enter 동작 허용
                setTimeout(() => {
                    if (editor.isDestroyed) return;

                    // 블록 탈출 확인
                    const stillInList = editor.isActive('bulletList') || editor.isActive('orderedList');
                    const stillInHeading = editor.isActive('heading');
                    const stillInBlockquote = editor.isActive('blockquote');

                    // 헤더에서 탈출 → 사용자 설정 폰트 적용
                    if (isInHeading && !stillInHeading) {
                        const userSetFontSize = (editor.storage as any).userSetFontSize || '18px';
                        editor.chain().focus().setFontSize(userSetFontSize).run();
                        return;
                    }

                    // 리스트 또는 인용구에서 탈출 → 기존 마크 복원
                    const exitedListOrQuote = (isInList && !stillInList) ||
                        (isInBlockquote && !stillInBlockquote);

                    if (exitedListOrQuote) {
                        // 1. 저장된 마크가 있으면 복원
                        if (currentMarks && currentMarks.length > 0) {
                            currentMarks.forEach((mark) => {
                                editor.chain().focus().setMark(mark.type.name, mark.attrs).run();
                            });
                        }
                        // 2. 마크가 없어도 사용자 설정 폰트는 강제 적용 (안전 장치)
                        else {
                            const userSetFontSize = (editor.storage as any).userSetFontSize || '18px';
                            editor.chain().focus().setFontSize(userSetFontSize).run();
                        }
                    }
                }, 10);

                return false; // 기본 동작 허용
            },
            Backspace: ({ editor }) => {
                const { selection } = editor.state;
                const { empty, $from } = selection;

                // 리스트 안에 있고, 선택이 비어있고, 리스트 아이템의 시작지점일 때
                // (즉, 내용이 없는 리스트 아이템에서 백스페이스를 눌러 리스트를 지우려는 경우)
                const isInList = editor.isActive('bulletList') || editor.isActive('orderedList');
                const isAtStart = $from.parentOffset === 0;

                if (isInList && empty && isAtStart) {
                    // 사용자 설정 폰트 가져오기
                    const userSetFontSize = (editor.storage as any).userSetFontSize || '18px';

                    // 리스트 해제 (Lift logic handled by standard delete, but we want to intercept to styling)
                    // Tiptap의 기본 Backspace는 liftListItem을 수행함.
                    // 우리는 그것을 수행하고 나서 폰트 사이즈를 강제할 것임.

                    // 잠시 후 실행 (기본 동작 완료 후)
                    setTimeout(() => {
                        if (editor.isDestroyed) return;
                        // 리스트에서 빠져나왔는지 확인
                        const stillInList = editor.isActive('bulletList') || editor.isActive('orderedList');
                        if (!stillInList) {
                            editor.chain().focus().setFontSize(userSetFontSize).run();
                        }
                    }, 10);

                    return false; // 기본 동작 실행
                }
                return false;
            }
        };
    },
});
