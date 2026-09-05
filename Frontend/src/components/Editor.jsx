import { useEditor, EditorContent } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'

import { TaskItem, TaskList } from '@tiptap/extension-list'
import StarterKit from '@tiptap/starter-kit'

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2 p-3 bg-zinc-800/50 border-b border-zinc-700/50 rounded-t-xl mb-4">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${editor.isActive('bold') ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'}`}
            >
                Bold
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${editor.isActive('italic') ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'}`}
            >
                Italic
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${editor.isActive('strike') ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'}`}
            >
                Strike
            </button>
            <div className="w-[1px] h-6 bg-zinc-700 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'}`}
            >
                H1
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'}`}
            >
                H2
            </button>
            <div className="w-[1px] h-6 bg-zinc-700 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'}`}
            >
                Bullet List
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'}`}
            >
                Ordered List
            </button>
        </div>
    );
};

const Editor = ({title, onChange}) => {
    const editor = useEditor({
        editorProps: {
            attributes: {
                class: "focus:outline-none print:border-0 bg-transparent flex flex-col cursor-text pt-2 pr-7 pb-7 pl-7 w-full min-h-[300px] text-white"
            },
        },
        extensions: [StarterKit, TaskList,TaskItem.configure({nested: true,}),], // define your extension array
        content: title || "", // initial content
        onUpdate: ({ editor }) => {
            if (onChange) {
                onChange(editor.getHTML());
            }
        }
    })

    return (
        <div className="w-full flex flex-col bg-zinc-900 rounded-xl border border-zinc-800/80">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="flex-1" />
            <FloatingMenu editor={editor}></FloatingMenu>
            <BubbleMenu editor={editor}></BubbleMenu>
        </div>
    )
}

export default Editor