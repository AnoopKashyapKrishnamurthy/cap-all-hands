export interface SentenceSegment {
  text: string
  start: number
  end: number
}

interface IntlSentencePart {
  segment: string
  index: number
}

interface IntlSentenceSegmenter {
  segment(input: string): Iterable<IntlSentencePart>
}

type SegmenterConstructor = new (
  locales?: string | string[],
  options?: { granularity: 'sentence' },
) => IntlSentenceSegmenter

const trimRange = (text: string, start: number, end: number): SentenceSegment | null => {
  let trimmedStart = start
  let trimmedEnd = end

  while (trimmedStart < trimmedEnd && /\s/.test(text[trimmedStart])) trimmedStart += 1
  while (trimmedEnd > trimmedStart && /\s/.test(text[trimmedEnd - 1])) trimmedEnd -= 1

  if (trimmedStart === trimmedEnd) return null

  return {
    text: text.slice(trimmedStart, trimmedEnd),
    start: trimmedStart,
    end: trimmedEnd,
  }
}

const isAbbreviation = (text: string, periodIndex: number) => {
  const prefix = text.slice(Math.max(0, periodIndex - 12), periodIndex + 1).toLowerCase()
  return (
    /(?:^|\s)(?:mr|mrs|ms|dr|prof|sr|jr|st|vs|etc)\.$/.test(prefix) ||
    /(?:^|\s)(?:e\.g|i\.e|u\.s|u\.k)\.$/.test(prefix) ||
    /(?:^|\s)[a-z]\.$/.test(prefix)
  )
}

const fallbackSegment = (text: string): SentenceSegment[] => {
  const result: SentenceSegment[] = []
  let sentenceStart = 0
  let index = 0

  while (index < text.length) {
    const character = text[index]
    const isTerminal = character === '.' || character === '!' || character === '?'

    if (!isTerminal) {
      index += 1
      continue
    }

    if (
      character === '.' &&
      (isAbbreviation(text, index) || /\d/.test(text[index - 1] ?? '') && /\d/.test(text[index + 1] ?? ''))
    ) {
      index += 1
      continue
    }

    let end = index + 1
    while (end < text.length && /[.!?]/.test(text[end])) end += 1
    while (end < text.length && /["'\u2019\u201d)\]]/.test(text[end])) end += 1

    if (end === text.length || /\s/.test(text[end])) {
      const segment = trimRange(text, sentenceStart, end)
      if (segment) result.push(segment)
      sentenceStart = end
    }

    index = end
  }

  const remainder = trimRange(text, sentenceStart, text.length)
  if (remainder) result.push(remainder)
  return result
}

const mergeStandaloneAbbreviations = (text: string, segments: SentenceSegment[]) => {
  const result: SentenceSegment[] = []

  segments.forEach((segment) => {
    const previous = result[result.length - 1]
    const isStandaloneAbbreviation = /^(?:mr|mrs|ms|dr|prof|sr|jr|st|vs|e\.g|i\.e)\.$/i.test(
      previous?.text ?? '',
    )

    if (previous && isStandaloneAbbreviation) {
      previous.end = segment.end
      previous.text = text.slice(previous.start, segment.end).trim()
    } else {
      result.push({ ...segment })
    }
  })

  return result
}

export function segmentSentences(text: string, locale = 'en'): SentenceSegment[] {
  if (!text.trim()) return []

  const Segmenter = (Intl as typeof Intl & { Segmenter?: SegmenterConstructor }).Segmenter
  if (!Segmenter) return fallbackSegment(text)

  try {
    const segmenter = new Segmenter(locale, { granularity: 'sentence' })
    const result: SentenceSegment[] = []

    for (const part of segmenter.segment(text)) {
      const segment = trimRange(text, part.index, part.index + part.segment.length)
      if (segment) result.push(segment)
    }

    return result.length ? mergeStandaloneAbbreviations(text, result) : fallbackSegment(text)
  } catch {
    return fallbackSegment(text)
  }
}
