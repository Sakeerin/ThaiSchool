// Rich Text Editor Component - TipTap-based

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon,
    Heading1,
    Heading2,
    Heading3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface RichTextEditorProps {
    content?: string;
    onChange?: (content: string) => void;
    placeholder?: string;
    className?: string;
    editable?: boolean;
}

export function RichTextEditor({
    content = '',
    onChange,
    placeholder = 'เริ่มพิมพ์เนื้อหา...',
    className,
    editable = true,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline hover:text-blue-800',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[200px] p-4',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = window.prompt('URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = window.prompt('Image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const ToolbarButton = ({
        onClick,
        isActive,
        children,
        title,
    }: {
        onClick: () => void;
        isActive?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                'p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                isActive && 'bg-gray-200 dark:bg-gray-600'
            )}
        >
            {children}
        </button>
    );

    return (
        <div className={cn('border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden', className)}>
            {editable && (
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    {/* Headings */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        title="Heading 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                    {/* Text formatting */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        title="Strikethrough"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive('code')}
                        title="Code"
                    >
                        <Code className="w-4 h-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                    {/* Lists */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numbered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="Quote"
                    >
                        <Quote className="w-4 h-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                    {/* Media */}
                    <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Add Link">
                        <LinkIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={addImage} title="Add Image">
                        <ImageIcon className="w-4 h-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                    {/* Undo/Redo */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        title="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </ToolbarButton>
                </div>
            )}
            <EditorContent
                editor={editor}
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
        </div>
    );
}

// Read-only renderer for displaying rich text content
export function RichTextViewer({ content, className }: { content: string; className?: string }) {
    return (
        <div
            className={cn(
                'prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert',
                className
            )}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}

export default RichTextEditor;
