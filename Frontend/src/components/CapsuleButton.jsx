export default function CapsuleButton({label, type}){
    return (
        <>
            <button className={`align-center justify-center px-5 py-2 rounded-full ${type === "active" ? "bg-white text-black cursor-pointer" :" text-white bg-transparent border-2 border-amber-50 hover:bg-amber-50 hover:text-black cursor-pointer" }`}>{label}</button>
        </>
    )
}