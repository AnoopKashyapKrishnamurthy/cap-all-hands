'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, ChevronRight, Play, CheckCircle2, Sparkles } from 'lucide-react'
import useParticipantSpinner from './useParticipantSpinner'

export interface DirectoryUser {
    id: string ;
    display_name: string;
    avatar_url?: string | null;
    bio?: string | null;
}

interface PopcornStandupProps {
    users: DirectoryUser[]
}

export default function PopcornStandup({ users }: PopcornStandupProps) {
    const {
        status,
        remainingParticipants: remainingUsers,
        completedParticipants: completedUsers,
        selectedParticipant: currentSpeaker,
        flickerParticipant: flickerUser,
        spinNext: triggerNext,
        reset,
    } = useParticipantSpinner(users)

    const progress = users.length > 0 ? (completedUsers.length / users.length) * 100 : 0

    if (users.length === 0) return null

    return (
        <div className="w-full">
            {/* Progress Bar */}
            <div className="h-1.5 bg-gray-100 w-full relative overflow-hidden">
                <motion.div
                    className="absolute top-0 left-0 h-full bg-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeInOut", duration: 0.5 }}
                />
            </div>

            {/* FIX 3: Adjusted min-h and paddings for mobile */}
            <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center text-center min-h-[350px] md:min-h-[400px] justify-center relative overflow-hidden">

                {/* Background Animation when selecting */}
                <AnimatePresence>
                    {status === 'selecting' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50"
                        />
                    )}
                </AnimatePresence>

                <div className="relative z-10 w-full max-w-sm">
                    <AnimatePresence mode="wait">

                        {/* INITIAL STATE */}
                        {status === 'idle' && (
                            <motion.div
                                key="start"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="py-4"
                            >
                                <motion.div
                                    className="text-5xl md:text-6xl mb-4 md:mb-6 inline-block"
                                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1 }}
                                >
                                    🍿
                                </motion.div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Popcorn Standup</h2>
                                <p className="text-gray-500 mb-8 text-sm md:text-base">Who's going first? Let the popper decide.</p>
                                <button
                                    onClick={triggerNext}
                                    className="inline-flex items-center justify-center gap-2 w-full bg-gray-900 text-white px-8 py-3.5 md:py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all active:scale-95 shadow-md"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    Start the Popper
                                </button>
                            </motion.div>
                        )}

                        {/* SELECTING STATE (The Suspense) */}
                        {status === 'selecting' && (
                            <motion.div
                                key="selecting"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                                className="py-6 md:py-8"
                            >
                                <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-orange-500 mb-6 block animate-pulse">
                                    Popping Next...
                                </span>

                                <motion.div
                                    className="relative inline-block mb-4 md:mb-6"
                                    animate={{ y: [-5, 5, -5] }}
                                    transition={{ repeat: Infinity, duration: 0.2 }}
                                >
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-orange-200 shadow-2xl flex items-center justify-center overflow-hidden bg-white">
                                        {flickerUser?.avatar_url ? (
                                            <img
                                                src={flickerUser.avatar_url}
                                                alt="Flickering"
                                                className="w-full h-full object-cover opacity-80"
                                            />
                                        ) : (
                                            <span className="text-3xl md:text-4xl font-bold text-orange-300">
                                                {flickerUser?.display_name?.[0]}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>

                                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-400 mb-2 tracking-widest line-clamp-1 px-4">
                                    {flickerUser?.display_name.toUpperCase()}
                                </h2>
                            </motion.div>
                        )}

                        {/* SPEAKING STATE */}
                        {status === 'speaking' && (
                            <motion.div
                                key="speaking"
                                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ type: "spring", damping: 12, stiffness: 100 }}
                                className="py-4 w-full"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                >
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 md:mb-6">
                                        <Sparkles className="w-3 h-3" /> It's Your Turn
                                    </span>
                                </motion.div>

                                <div className="relative inline-block mb-4 md:mb-6">
                                    {currentSpeaker?.avatar_url ? (
                                        <img
                                            src={currentSpeaker.avatar_url}
                                            alt={currentSpeaker.display_name}
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-orange-100 border-4 border-white shadow-xl flex items-center justify-center text-3xl md:text-4xl font-bold text-orange-600">
                                            {currentSpeaker?.display_name?.[0]}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 bg-white p-1.5 md:p-2 rounded-full shadow-md border">
                                        <span className="flex h-2.5 w-2.5 md:h-3 md:w-3 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-green-500"></span>
                                        </span>
                                    </div>
                                </div>

                                {/* FIX 4: Word breaking for long names on mobile */}
                                <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-1 md:mb-2 tracking-tight break-words px-2">
                                    {currentSpeaker?.display_name}
                                </h2>
                                <p className="text-gray-500 text-xs md:text-sm mb-6 md:mb-10 px-4 line-clamp-2">
                                    {currentSpeaker?.bio || "Team Member"}
                                </p>

                                <div className="flex flex-col gap-2 md:gap-3 px-4 sm:px-0">
                                    <button
                                        onClick={triggerNext}
                                        className="w-full bg-orange-500 text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        {remainingUsers.length === 0 ? 'Finish Standup' : 'Pop Next Speaker'}
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={reset}
                                        className="text-gray-400 hover:text-gray-600 text-xs md:text-sm flex items-center justify-center gap-1 transition-colors py-2"
                                    >
                                        <RotateCcw className="w-3 h-3" /> Start Over
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* FINISHED STATE */}
                        {status === 'finished' && (
                            <motion.div
                                key="finished"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="py-6 md:py-8"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                >
                                    <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-green-500 mx-auto mb-4 md:mb-6" />
                                </motion.div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">That's Everyone!</h2>
                                <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">Great standup today, team.</p>
                                <button
                                    onClick={reset}
                                    className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-6 md:px-8 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 text-sm md:text-base"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset Standup
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            {/* "Still in the Popper" Bar */}
            {status !== 'idle' && status !== 'finished' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-gray-50/80 border-t px-4 md:px-6 py-3 md:py-4"
                >
                    <div className="flex gap-3 md:gap-4 items-center overflow-x-auto pb-1 md:pb-2 scrollbar-hide">
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                            In the Popper ({remainingUsers.length}):
                        </span>
                        {remainingUsers.map((user) => (
                            <motion.div
                                key={user.id}
                                layout
                                className="flex items-center gap-1.5 md:gap-2 opacity-50 shrink-0"
                            >
                                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-200 flex items-center justify-center text-[9px] md:text-[10px] font-bold overflow-hidden border border-white">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        user.display_name[0]
                                    )}
                                </div>
                                <span className="text-[10px] md:text-xs font-medium text-gray-600">{user.display_name}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    )
}
