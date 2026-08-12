import { useEditor, EditorContent } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'

import { TaskItem, TaskList } from '@tiptap/extension-list'
import StarterKit from '@tiptap/starter-kit'

const Editor = ({title}) => {
    const editor = useEditor({
        editorProps: {
            attributes: {
                class: "focus:outline-none print:border-0 rounded-xl bg-zinc-900 flex flex-col cursor-text pt-5 pr-7 pb-7 pl-7"
            },
        },
        extensions: [StarterKit, TaskList,TaskItem.configure({nested: true,}),], // define your extension array
        content: `<h1>${title}</h1>`, // initial content
    })

    return (
        <>
            <EditorContent editor={editor} />
            <FloatingMenu editor={editor}></FloatingMenu>
            <BubbleMenu editor={editor}>copy|paste|select All</BubbleMenu>
        </>
    )
}

export default Editor