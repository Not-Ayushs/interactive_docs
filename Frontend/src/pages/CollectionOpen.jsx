import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import Background from '../components/Background.jsx';
import Foreground from '../components/Foreground.jsx';
import CapsuleButton from '../components/CapsuleButton.jsx';
import { FiArrowLeft, FiFolder } from 'react-icons/fi';

export default function CollectionOpen() {
    const { collectionName } = useParams();
    const navigate = useNavigate();
    const decodedName = collectionName ? decodeURIComponent(collectionName) : 'Untitled Collection';

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0A0E15]">
            <AppNavbar />
            <Background />

            {/* Collection Header Bar */}
            <div className="fixed top-16 sm:top-20 left-0 w-full z-30 px-4 sm:px-12 py-3 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md border-b border-zinc-800/60 shadow-md">
                <div className="flex items-center gap-4">
                    <CapsuleButton
                        type="outline"
                        onClick={() => navigate('/app/collections')}
                        className="py-1.5 px-4 text-xs"
                    >
                        <FiArrowLeft className="text-sm" />
                        <span className="hidden sm:inline">Back</span>
                    </CapsuleButton>

                    <div className="h-5 w-[1px] bg-zinc-700" />

                    <div className="flex items-center gap-2">
                        <FiFolder className="text-white text-lg shrink-0" />
                        <h1 className="text-white font-bold text-sm sm:text-base tracking-wide truncate max-w-[150px] sm:max-w-xs">
                            {decodedName}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Document Cards View filtered by collectionName */}
            <Foreground className="pt-36" collectionName={decodedName} />
        </div>
    );
}