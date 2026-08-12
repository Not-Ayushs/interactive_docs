import { useCurrentEditor } from '@tiptap/react'


export default function Modal({showModal, setShowModal}) {
    return(
        <>
            {showModal && <div className="h-[89vh] bg-zinc-950 w-[36vw] z-100 rounded-xl absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">Modal</div>}
            <div>
                
            </div>
        </>
    )
}


const EditorJSONPreview = () => {
  const { editor } = useCurrentEditor()

  return <pre>{JSON.stringify(editor.getJSON(), null, 2)}</pre>
}