'use client'

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import type { ImgHTMLAttributes } from 'react'
import { useState } from 'react'
import { Skeleton } from './LoadingPrimitives'

interface FadeInImageProps
  extends Omit<HTMLMotionProps<'img'>, 'animate' | 'initial' | 'onLoad' | 'transition'> {
  containerClassName?: string
  onLoad?: ImgHTMLAttributes<HTMLImageElement>['onLoad']
}

export default function FadeInImage({
  containerClassName = '',
  className = '',
  onLoad,
  ...props
}: FadeInImageProps) {
  const [loaded, setLoaded] = useState(false)
  const reduceMotion = useReducedMotion()

  return (
    <span className={`relative block overflow-hidden ${containerClassName}`}>
      {!loaded && <Skeleton className="absolute inset-0 h-full w-full rounded-none" />}
      <motion.img
        {...props}
        className={className}
        initial={false}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
        onLoad={(event) => {
          setLoaded(true)
          onLoad?.(event)
        }}
      />
    </span>
  )
}
