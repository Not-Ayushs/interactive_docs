import { useEditor, EditorContent } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'

const Tiptap = () => {
    const editor = useEditor({
        editorProps: {
            attributes: {
                class: "focus:outline-none print:border-0 flex flex-col cursor-text pt-10 pr-14 pb-10 pl-14"
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

export default Tiptap