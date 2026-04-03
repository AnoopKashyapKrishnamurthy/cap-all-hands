'use client'

import { useState, useRef, useEffect } from 'react'

interface SectionItem {
    key: string
    value: string
}

interface SectionContent {
    items: SectionItem[]
}

interface EventSection {
    id: string
    title?: string
    section_type: string
    content: SectionContent
    is_visible: boolean
    display_order: number
}

interface EventSectionsProps {
    sections: EventSection[]
}

const ACCENT_COLORS = [
    {
        chip: '#0a84ff',
        glow: 'rgba(10,132,255,0.12)',
        border: 'rgba(10,132,255,0.2)',
        badge: { bg: 'rgba(10,132,255,0.12)', color: '#0a84ff', border: 'rgba(10,132,255,0.25)' },
    },
    {
        chip: '#bf5af2',
        glow: 'rgba(191,90,242,0.12)',
        border: 'rgba(191,90,242,0.2)',
        badge: { bg: 'rgba(191,90,242,0.12)', color: '#bf5af2', border: 'rgba(191,90,242,0.3)' },
    },
    {
        chip: '#32d74b',
        glow: 'rgba(50,215,75,0.10)',
        border: 'rgba(50,215,75,0.2)',
        badge: { bg: 'rgba(50,215,75,0.12)', color: '#32d74b', border: 'rgba(50,215,75,0.25)' },
    },
    {
        chip: '#ff9f0a',
        glow: 'rgba(255,159,10,0.10)',
        border: 'rgba(255,159,10,0.2)',
        badge: { bg: 'rgba(255,159,10,0.12)', color: '#ff9f0a', border: 'rgba(255,159,10,0.25)' },
    },
]

function GlassCard({
    label,
    value,
    sub,
    badge,
    accent,
    size = 'md',
    spanRow = false,
    style,
}: {
    label?: string
    value?: string
    sub?: string
    badge?: string
    accent?: (typeof ACCENT_COLORS)[0]
    size?: 'sm' | 'md' | 'lg' | 'xl'
    spanRow?: boolean
    style?: React.CSSProperties
}) {
    const fontSize =
        size === 'xl'
            ? 'clamp(36px, 5.5vw, 64px)'
            : size === 'lg'
            ? 'clamp(28px, 4vw, 48px)'
            : size === 'md'
            ? 'clamp(18px, 2.2vw, 26px)'
            : '14px'

    return (
        <div
            className="escard"
            style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 18,
                border: `0.5px solid ${accent?.border ?? 'rgba(255,255,255,0.09)'}`,
                background: accent
                    ? `rgba(255,255,255,0.04)`
                    : 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(40px)',
                padding: '24px 26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gridRow: spanRow ? 'span 2' : undefined,
                transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                ...style,
            }}
        >
            {/* Inner glow */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                    background: accent
                        ? `radial-gradient(ellipse 70% 60% at 40% 0%, ${accent.glow} 0%, transparent 65%)`
                        : 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 60%)',
                }}
            />
            {label && (
                <p
                    style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'rgba(245,245,247,0.28)',
                        marginBottom: 6,
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {label}
                </p>
            )}
            {value && (
                <p
                    style={{
                        fontSize,
                        fontWeight: size === 'xl' ? 700 : size === 'lg' ? 600 : 500,
                        color: '#f5f5f7',
                        letterSpacing: size === 'xl' ? '-0.04em' : '-0.02em',
                        lineHeight: 1.1,
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {value}
                </p>
            )}
            {sub && (
                <p
                    style={{
                        fontSize: 12,
                        color: 'rgba(245,245,247,0.55)',
                        marginTop: 4,
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {sub}
                </p>
            )}
            {badge && accent && (
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 9px',
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        background: accent.badge.bg,
                        color: accent.badge.color,
                        border: `0.5px solid ${accent.badge.border}`,
                        marginTop: 8,
                        width: 'fit-content',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {badge}
                </span>
            )}
        </div>
    )
}

function SlideView({
    section,
    isActive,
    index,
}: {
    section: EventSection
    isActive: boolean
    index: number
}) {
    const items = section.content?.items ?? []
    const accent = ACCENT_COLORS[index % ACCENT_COLORS.length]
    const heroItem = items[0]
    const rest = items.slice(1)

    // Determine bento layout - FIXED to prevent NaN
    const colCount = Math.max(1, Math.min(rest.length, 3))
    const gridCols =
        colCount === 1
            ? '1fr'
            : colCount === 2
            ? '1fr 1fr'
            : '1fr 1fr 1fr'

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                padding: '52px 60px 72px',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.9s cubic-bezier(0.4,0,0.2,1), transform 0.9s cubic-bezier(0.4,0,0.2,1)',
                pointerEvents: isActive ? 'all' : 'none',
            }}
        >
            {/* Chip */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '5px 12px',
                        borderRadius: 20,
                        border: '0.5px solid rgba(255,255,255,0.09)',
                        background: 'rgba(255,255,255,0.04)',
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'rgba(245,245,247,0.55)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <span
                        style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: accent.chip,
                            display: 'inline-block',
                        }}
                    />
                    {section.section_type}
                </div>
            </div>

            {/* Hero title */}
            {section.title && (
                <div style={{ marginBottom: 32 }}>
                    <h1
                        style={{
                            fontSize: 'clamp(44px, 6vw, 72px)',
                            fontWeight: 700,
                            letterSpacing: '-0.03em',
                            lineHeight: 1.0,
                            color: '#f5f5f7',
                            margin: 0,
                        }}
                    >
                        {section.title}
                    </h1>
                </div>
            )}

            {/* Bento Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: heroItem ? `1.6fr ${gridCols}` : gridCols,
                    gap: 12,
                    flex: 1,
                    minHeight: 0,
                }}
            >
                {/* Hero card spans rows */}
                {heroItem && (
                    <GlassCard
                        label={heroItem.key}
                        value={heroItem.value}
                        accent={accent}
                        size="lg"
                        spanRow
                        style={{ gridRow: `span ${Math.max(2, Math.ceil(rest.length / colCount))}` }}
                    />
                )}

                {/* Rest of items */}
                {rest.map((item, i) => (
                    <GlassCard
                        key={i}
                        label={item.key}
                        value={item.value}
                        accent={i === 0 ? accent : undefined}
                        size={rest.length <= 2 ? 'xl' : 'md'}
                    />
                ))}
            </div>
        </div>
    )
}

export default function EventSections({ sections }: EventSectionsProps) {
    const activeSections = (sections ?? [])
        .filter((s) => s.is_visible)
        .sort((a, b) => a.display_order - b.display_order)

    const [current, setCurrent] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [progressKey, setProgressKey] = useState(0)
    const touchStartX = useRef<number | null>(null)

    const DURATION = 8000

    useEffect(() => {
        if (isHovered || activeSections.length <= 1) return
        const t = setInterval(() => {
            setCurrent((c) => (c + 1) % activeSections.length)
            setProgressKey((k) => k + 1)
        }, DURATION)
        return () => clearInterval(t)
    }, [isHovered, activeSections.length])

    if (!activeSections.length) return null

    const prev = () => {
        setCurrent((c) => (c - 1 + activeSections.length) % activeSections.length)
        setProgressKey((k) => k + 1)
    }
    const next = () => {
        setCurrent((c) => (c + 1) % activeSections.length)
        setProgressKey((k) => k + 1)
    }
    const goTo = (i: number) => {
        setCurrent(i)
        setProgressKey((k) => k + 1)
    }

    return (
        <section style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 16px' }}>
            {/* Note: In a production app, you might want to move these keyframes to a global CSS file */}
            <style>{`
                @keyframes drift {
                    0%,100% { transform: translate(0,0) scale(1); }
                    33% { transform: translate(40px,-30px) scale(1.08); }
                    66% { transform: translate(-30px,40px) scale(0.95); }
                }
                @keyframes progressIn {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .escard:hover {
                    border-color: rgba(255,255,255,0.18) !important;
                    background: rgba(255,255,255,0.07) !important;
                    transform: scale(1.015) !important;
                }
                .navbtn { opacity: 0; pointer-events: none; transition: opacity 0.2s, background 0.25s, transform 0.25s; }
                .esroot:hover .navbtn { opacity: 1; pointer-events: all; }
                .navbtn:hover { background: rgba(255,255,255,0.14) !important; color: #fff !important; transform: translateY(-50%) scale(1.08) !important; }
                .dot-btn { transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
                .dot-btn:hover { background: rgba(255,255,255,0.4) !important; }
            `}</style>

            <div
                className="esroot"
                style={{
                    position: 'relative',
                    height: 640,
                    borderRadius: 28,
                    overflow: 'hidden',
                    background: '#000',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
                    cursor: 'default',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
                onTouchEnd={(e) => {
                    if (touchStartX.current === null) return
                    const dx = e.changedTouches[0].clientX - touchStartX.current
                    if (Math.abs(dx) > 44) dx < 0 ? next() : prev()
                    touchStartX.current = null
                }}
            >
                {/* Background orbs */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <div
                        style={{
                            position: 'absolute',
                            width: 560,
                            height: 560,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(10,132,255,0.18) 0%, transparent 70%)',
                            filter: 'blur(90px)',
                            top: -100,
                            left: -80,
                            animation: 'drift 22s ease-in-out infinite',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            width: 480,
                            height: 480,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(191,90,242,0.14) 0%, transparent 70%)',
                            filter: 'blur(90px)',
                            bottom: -60,
                            right: -60,
                            animation: 'drift 28s ease-in-out infinite reverse',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            width: 320,
                            height: 320,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(50,215,75,0.08) 0%, transparent 70%)',
                            filter: 'blur(90px)',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%,-50%)',
                            animation: 'drift 18s ease-in-out infinite',
                        }}
                    />
                    {/* Grid lines */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                            backgroundSize: '80px 80px',
                            WebkitMaskImage:
                                'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
                            maskImage:
                                'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
                        }}
                    />
                </div>

                {/* Progress bar */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: 'rgba(255,255,255,0.06)',
                        zIndex: 40,
                    }}
                >
                    <div
                        key={progressKey}
                        style={{
                            height: '100%',
                            background:
                                'linear-gradient(90deg, rgba(10,132,255,0.7), rgba(191,90,242,0.7))',
                            borderRadius: '0 1px 1px 0',
                            animation: `progressIn ${DURATION}ms linear forwards`,
                            animationPlayState: isHovered ? 'paused' : 'running',
                        }}
                    />
                </div>

                {/* Slide counter */}
                <div
                    style={{
                        position: 'absolute',
                        top: 24,
                        right: 28,
                        zIndex: 30,
                        fontSize: 11,
                        color: 'rgba(245,245,247,0.28)',
                        letterSpacing: '0.08em',
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {current + 1} / {activeSections.length}
                </div>

                {/* Slides */}
                <div style={{ position: 'absolute', inset: 0 }}>
                    {activeSections.map((section, idx) => (
                        <SlideView
                            key={section.id}
                            section={section}
                            isActive={idx === current}
                            index={idx}
                        />
                    ))}
                </div>

                {/* Bottom bar with dots */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 72,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                        zIndex: 30,
                        gap: 6,
                    }}
                >
                    {activeSections.map((_, idx) => (
                        <button
                            key={idx}
                            className="dot-btn"
                            onClick={() => goTo(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                            style={{
                                height: 2,
                                width: idx === current ? 28 : 20,
                                borderRadius: 2,
                                border: 'none',
                                outline: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                background:
                                    idx === current
                                        ? 'rgba(255,255,255,0.88)'
                                        : 'rgba(255,255,255,0.2)',
                            }}
                        />
                    ))}
                </div>

                {/* Nav buttons */}
                <button
                    className="navbtn"
                    onClick={prev}
                    aria-label="Previous"
                    style={{
                        position: 'absolute',
                        left: 20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.07)',
                        border: '0.5px solid rgba(255,255,255,0.09)',
                        backdropFilter: 'blur(20px)',
                        color: 'rgba(255,255,255,0.6)',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 18,
                        zIndex: 30,
                    }}
                >
                    ‹
                </button>
                <button
                    className="navbtn"
                    onClick={next}
                    aria-label="Next"
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.07)',
                        border: '0.5px solid rgba(255,255,255,0.09)',
                        backdropFilter: 'blur(20px)',
                        color: 'rgba(255,255,255,0.6)',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 18,
                        zIndex: 30,
                    }}
                >
                    ›
                </button>

                {/* Watermark */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 46,
                        right: 60,
                        zIndex: 5,
                        fontSize: 10,
                        color: 'rgba(245,245,247,0.28)',
                        letterSpacing: '0.12em',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        opacity: 0.4,
                    }}
                >
                    CAP - All Hands
                </div>
            </div>
        </section>
    )
}