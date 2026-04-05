import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Logo() {
    return (
        <Link
            href="/"
            className="inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg transition-all"
        >

            {/* Typography */}
            <div className="flex items-baseline gap-2">
                <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="text-slate-900 font-extrabold text-2xl tracking-tight group-hover:text-orange-500 transition-colors duration-300"
                >
                    CAP
                </motion.span>

                <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="text-slate-500 font-medium text-sm tracking-wide border-l-[1.5px] border-slate-300 pl-2 mt-1"
                >
                    All-Hands
                </motion.span>
            </div>
        </Link>
    );
}