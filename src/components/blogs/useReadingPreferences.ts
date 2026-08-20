'use client'

import { useCallback, useEffect, useState } from 'react'

export type FontSizePreference = 'small' | 'medium' | 'large'
export type LineSpacingPreference = 'compact' | 'comfortable' | 'spacious'

const FONT_SIZE_KEY = 'cap-blog-reader-font-size'
const LINE_SPACING_KEY = 'cap-blog-reader-line-spacing'

const fontSizes: FontSizePreference[] = ['small', 'medium', 'large']
const lineSpacings: LineSpacingPreference[] = ['compact', 'comfortable', 'spacious']

const isFontSize = (value: string | null): value is FontSizePreference =>
  value !== null && fontSizes.includes(value as FontSizePreference)

const isLineSpacing = (value: string | null): value is LineSpacingPreference =>
  value !== null && lineSpacings.includes(value as LineSpacingPreference)

export function useReadingPreferences() {
  const [fontSize, setFontSizeState] = useState<FontSizePreference>('medium')
  const [lineSpacing, setLineSpacingState] = useState<LineSpacingPreference>('comfortable')

  useEffect(() => {
    try {
      const savedFontSize = window.localStorage.getItem(FONT_SIZE_KEY)
      const savedLineSpacing = window.localStorage.getItem(LINE_SPACING_KEY)
      if (isFontSize(savedFontSize)) setFontSizeState(savedFontSize)
      if (isLineSpacing(savedLineSpacing)) setLineSpacingState(savedLineSpacing)
    } catch {
      // Storage can be unavailable in privacy modes; defaults remain usable.
    }
  }, [])

  const setFontSize = useCallback((value: FontSizePreference) => {
    setFontSizeState(value)
    try {
      window.localStorage.setItem(FONT_SIZE_KEY, value)
    } catch {
      // The in-memory preference still applies when storage is unavailable.
    }
  }, [])

  const setLineSpacing = useCallback((value: LineSpacingPreference) => {
    setLineSpacingState(value)
    try {
      window.localStorage.setItem(LINE_SPACING_KEY, value)
    } catch {
      // The in-memory preference still applies when storage is unavailable.
    }
  }, [])

  return { fontSize, lineSpacing, setFontSize, setLineSpacing }
}
