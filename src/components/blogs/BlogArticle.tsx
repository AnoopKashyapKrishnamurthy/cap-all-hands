'use client'

import { memo, useEffect, useRef, type CSSProperties } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { segmentSentences } from './sentenceSegmentation'
import type { FontSizePreference, LineSpacingPreference } from './useReadingPreferences'

export interface BlogSentence {
  id: string
  text: string
}

interface BlogArticleProps {
  content: string
  activeSentenceIndex: number | null
  fontSize: FontSizePreference
  lineSpacing: LineSpacingPreference
  onSentencesChange(sentences: BlogSentence[]): void
}

const READABLE_BLOCK_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,td,th'
const SENTENCE_SELECTOR = '[data-blog-sentence-index]'

const fontSizes: Record<FontSizePreference, string> = {
  small: '1rem',
  medium: '1.125rem',
  large: '1.25rem',
}

const lineHeights: Record<LineSpacingPreference, string> = {
  compact: '1.55',
  comfortable: '1.8',
  spacious: '2.05',
}

const MarkdownBody = memo(function MarkdownBody({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  )
})

const unwrapSentenceFragments = (root: HTMLElement) => {
  const parents = new Set<Node>()
  root.querySelectorAll<HTMLElement>(SENTENCE_SELECTOR).forEach((element) => {
    if (element.parentNode) parents.add(element.parentNode)
    element.replaceWith(document.createTextNode(element.textContent ?? ''))
  })
  parents.forEach((parent) => parent.normalize())
}

const readableTextNodes = (block: HTMLElement) => {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const textNode = node as Text
      const parent = textNode.parentElement
      if (!textNode.data.trim() || !parent) return NodeFilter.FILTER_REJECT
      if (parent.closest('pre,code,[aria-hidden="true"]')) return NodeFilter.FILTER_REJECT
      return parent.closest(READABLE_BLOCK_SELECTOR) === block
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    },
  })

  let current = walker.nextNode()
  while (current) {
    nodes.push(current as Text)
    current = walker.nextNode()
  }
  return nodes
}

export default function BlogArticle({
  content,
  activeSentenceIndex,
  fontSize,
  lineSpacing,
  onSentencesChange,
}: BlogArticleProps) {
  const articleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const article = articleRef.current
    if (!article) return

    unwrapSentenceFragments(article)
    const sentences: BlogSentence[] = []
    const blocks = Array.from(article.querySelectorAll<HTMLElement>(READABLE_BLOCK_SELECTOR))

    blocks.forEach((block, blockIndex) => {
      const textNodes = readableTextNodes(block)
      const blockText = textNodes.map((node) => node.data).join('')
      const segments = segmentSentences(blockText)
      if (!segments.length) return

      const indexedSegments = segments.map((segment, sentenceIndex) => {
        const index = sentences.length
        sentences.push({ id: `${blockIndex}-${sentenceIndex}`, text: segment.text })
        return { ...segment, index }
      })

      let nodeStart = 0
      textNodes.forEach((textNode) => {
        const nodeEnd = nodeStart + textNode.data.length
        const overlaps = indexedSegments.filter(
          (segment) => segment.start < nodeEnd && segment.end > nodeStart,
        )

        if (overlaps.length) {
          const fragment = document.createDocumentFragment()
          let cursor = 0

          overlaps.forEach((segment) => {
            const localStart = Math.max(segment.start, nodeStart) - nodeStart
            const localEnd = Math.min(segment.end, nodeEnd) - nodeStart
            if (localStart > cursor) fragment.append(textNode.data.slice(cursor, localStart))

            const span = document.createElement('span')
            span.dataset.blogSentenceIndex = String(segment.index)
            span.className = 'rounded-sm decoration-clone transition-colors duration-150'
            span.textContent = textNode.data.slice(localStart, localEnd)
            fragment.append(span)
            cursor = localEnd
          })

          if (cursor < textNode.data.length) fragment.append(textNode.data.slice(cursor))
          textNode.replaceWith(fragment)
        }

        nodeStart = nodeEnd
      })
    })

    onSentencesChange(sentences)
    return () => {
      unwrapSentenceFragments(article)
    }
  }, [content, onSentencesChange])

  useEffect(() => {
    const article = articleRef.current
    if (!article) return

    article.querySelectorAll<HTMLElement>(SENTENCE_SELECTOR).forEach((element) => {
      const isActive = Number(element.dataset.blogSentenceIndex) === activeSentenceIndex
      element.classList.toggle('bg-amber-200/70', isActive)
      element.classList.toggle('ring-2', isActive)
      element.classList.toggle('ring-amber-300/40', isActive)
    })

    if (activeSentenceIndex === null) return
    const activeFragments = Array.from(article.querySelectorAll<HTMLElement>(
      `[data-blog-sentence-index="${activeSentenceIndex}"]`,
    ))
    if (!activeFragments.length) return

    const firstBounds = activeFragments[0].getBoundingClientRect()
    const lastFragment = activeFragments[activeFragments.length - 1]
    const lastBounds = lastFragment.getBoundingClientRect()
    const viewportPadding = 96
    const isAboveViewport = firstBounds.top < viewportPadding
    const isBelowViewport = lastBounds.bottom > window.innerHeight - viewportPadding
    const isOutsideViewport = isAboveViewport || isBelowViewport
    if (!isOutsideViewport) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scrollTarget = isAboveViewport ? activeFragments[0] : lastFragment
    scrollTarget.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
  }, [activeSentenceIndex])

  const articleStyle = {
    fontSize: fontSizes[fontSize],
    '--reader-line-height': lineHeights[lineSpacing],
  } as CSSProperties

  return (
    <article
      ref={articleRef}
      aria-label="Blog content"
      style={articleStyle}
      className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-p:font-serif prose-p:text-gray-800 prose-a:text-green-700 prose-a:no-underline hover:prose-a:underline prose-img:rounded-sm prose-blockquote:border-l-black prose-blockquote:italic selection:bg-green-100 [&_blockquote]:!leading-[var(--reader-line-height)] [&_li]:!leading-[var(--reader-line-height)] [&_p]:!leading-[var(--reader-line-height)]"
    >
      <MarkdownBody content={content} />
    </article>
  )
}
