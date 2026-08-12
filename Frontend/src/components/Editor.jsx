import { useEditor, EditorContent } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'

const Editor = () => {
    const editor = useEditor({
        editorProps: {
            attributes: {
                class: "focus:outline-none print:border-0 rounded-xl bg-zinc-900 flex flex-col cursor-text pt-5 pr-7 pb-7 pl-7"
            },
        },
        extensions: [StarterKit], // define your extension array
        content: '<p>Hello World!</p>', // initial content
    })

    return (
        <>
            <EditorContent editor={editor} />
            <FloatingMenu editor={editor}>-</FloatingMenu>
            <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
        </>
    )
}

export default Editor