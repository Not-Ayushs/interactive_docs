export default function FeatureShow() {
    return (
        <div>
            <h1 className="text-white text-center text-5xl">Feature Show</h1>
            <div className=" relaive big-box bg-white w-120 h-80 flex justify-center">
                <div className="hover:z-2 hover:left-15 hover:top-24 hover:bg-yellow-600 hover:w-90 hover:h-50 z-3 absolute left-10 top-18 bg-red-600 w-100 h-50"></div>
                <div className="hover:z-3 hover:left-10 hover:top-18 hover:bg-red-600 hover:w-100 hover:h-50 z-2 absolute left-15 top-24 bg-yellow-600 w-90 h-50"></div>
                <div className="z-1 absolute left-20 top-30 bg-green-600 w-80 h-50"></div>
                
            </div>
        </div>
    );
}
// hover:z-2 absolute hover:left-15 hover:top-24 hover:bg-yellow-600 hover:w-90 hover:h-50
// hover:z-3 absolute hover:left-10 hover:top-18 hover:bg-red-600 hover:w-100 hover:h-50