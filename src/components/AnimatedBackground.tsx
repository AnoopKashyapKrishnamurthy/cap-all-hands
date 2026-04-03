// src/components/AnimatedBackground.tsx
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Abstract Blob 1 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-500/20 blur-[80px] animate-blob" />
      
      {/* Abstract Blob 2 */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[80px] animate-blob animation-delay-2000" />
      
      {/* Abstract Blob 3 */}
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/20 blur-[80px] animate-blob animation-delay-4000" />

      <div className="absolute bottom-[10%] right-[60%] w-[60%] h-[30%] rounded-full bg-purple-500/20 blur-[80px] animate-blob animation-delay-4000" />
    </div>
  )
}