import { useEffect, useState, type ReactElement, Fragment } from 'react'
import parse, { type HTMLReactParserOptions, Element, type DOMNode } from 'html-react-parser'
import { renderMarkdown, type TocItem } from '@/lib/markdown-renderer'
import { MarkdownImage } from '@/components/markdown-image'
import { CodeBlock } from '@/components/code-block'
import { GitHubLinkPreview } from '@/components/github-link-preview'

type MarkdownRenderResult = {
	content: ReactElement | null
	toc: TocItem[]
	loading: boolean
}

function parseGitHubRepoUrl(url: string): { owner: string; repo: string } | null {
	try {
		const parsed = new URL(url)
		if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') return null
		const [owner, repo, ...rest] = parsed.pathname.split('/').filter(Boolean)
		if (!owner || !repo || rest.length > 0) return null
		return { owner, repo }
	} catch {
		return null
	}
}

function textContent(nodes: DOMNode[] = []): string {
	return nodes
		.map(node => {
			if (node.type === 'text') return node.data || ''
			if (node instanceof Element) return textContent(node.children as DOMNode[])
			return ''
		})
		.join('')
		.trim()
}

function getStandaloneGitHubRepoLink(domNode: Element): { href: string; owner: string; repo: string; label: string } | null {
	if (domNode.name !== 'p') return null

	const visibleChildren = (domNode.children as DOMNode[]).filter(node => !(node.type === 'text' && !(node.data || '').trim()))
	if (visibleChildren.length !== 1) return null

	const anchor = visibleChildren[0]
	if (!(anchor instanceof Element) || anchor.name !== 'a') return null

	const href = anchor.attribs?.href || ''
	const repo = parseGitHubRepoUrl(href)
	if (!repo) return null

	return {
		href,
		...repo,
		label: textContent(anchor.children as DOMNode[])
	}
}

export function useMarkdownRender(markdown: string): MarkdownRenderResult {
	const [content, setContent] = useState<ReactElement | null>(null)
	const [toc, setToc] = useState<TocItem[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		let cancelled = false

		async function render() {
			setLoading(true)
			try {
				const { html, toc } = await renderMarkdown(markdown)
				if (!cancelled) {
					// Extract pre elements and replace with placeholders before parsing
					const codeBlocks: Array<{ placeholder: string; code: string; preHtml: string }> = []
					let processedHtml = html.replace(/<pre\s+data-code="([^"]*)"([^>]*)>([\s\S]*?)<\/pre>/g, (match, codeAttr, attrs, content) => {
						const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`
						// Decode HTML entities in code attribute
						const code = codeAttr
							.replace(/&quot;/g, '"')
							.replace(/&#39;/g, "'")
							.replace(/&lt;/g, '<')
							.replace(/&gt;/g, '>')
							.replace(/&amp;/g, '&')
						codeBlocks.push({
							placeholder,
							code,
							preHtml: `${content}`
						})
						return placeholder
					})

					// Parse HTML and replace img elements and code block placeholders
					const options: HTMLReactParserOptions = {
						replace(domNode: DOMNode) {
							if (domNode instanceof Element && domNode.name === 'p') {
								const githubRepo = getStandaloneGitHubRepoLink(domNode)
								if (githubRepo) {
									return <GitHubLinkPreview {...githubRepo} />
								}
							}

							if (domNode instanceof Element && domNode.name === 'img') {
								const { src, alt, title } = domNode.attribs
								return <MarkdownImage src={src} alt={alt} title={title} />
							}
							// Handle code block placeholders in text nodes
							if (domNode.type === 'text' && domNode.data && domNode.data.includes('__CODE_BLOCK_')) {
								const text = domNode.data
								const result = text.split(/(__CODE_BLOCK_\d+__)/).filter(Boolean)

								return (
									<>
										{result.map((item, index) => {
											if (item.startsWith('__CODE_BLOCK_')) {
												const block = codeBlocks.find(b => b.placeholder === item)
												if (block) {
													const preElement = parse(block.preHtml) as ReactElement
													return (
														<CodeBlock key={block.placeholder} code={block.code}>
															{preElement}
														</CodeBlock>
													)
												}
											} else {
												return item ? <Fragment key={index}>{item}</Fragment> : null
											}
										})}
									</>
								)
							}
						}
					}
					const reactContent = parse(processedHtml, options) as ReactElement
					setContent(reactContent)
					setToc(toc)
				}
			} catch (error) {
				console.error('Markdown render error:', error)
				if (!cancelled) {
					setContent(null)
					setToc([])
				}
			} finally {
				if (!cancelled) {
					setLoading(false)
				}
			}
		}

		render()

		return () => {
			cancelled = true
		}
	}, [markdown])

	return { content, toc, loading }
}
