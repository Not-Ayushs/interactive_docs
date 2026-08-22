import { useEditor, EditorContent } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'

import { TaskItem, TaskList } from '@tiptap/extension-list'
import StarterKit from '@tiptap/starter-kit'

const Editor = ({title, onChange}) => {
    const editor = useEditor({
        editorProps: {
            attributes: {
                class: "focus:outline-none print:border-0 rounded-xl bg-zinc-900 flex flex-col cursor-text pt-5 pr-7 pb-7 pl-7 w-full min-h-[300px]"
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
        <div className="w-full ">
            <EditorContent editor={editor} />
            <FloatingMenu editor={editor}></FloatingMenu>
            <BubbleMenu editor={editor}></BubbleMenu>
        </div>
    )
}

export default Editor