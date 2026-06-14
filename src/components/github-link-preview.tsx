'use client'

import { ExternalLink, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import GithubSVG from '@/svgs/github.svg'

type GitHubLinkPreviewProps = {
	href: string
	owner: string
	repo: string
	label?: string
}

type RepoMeta = {
	description: string | null
	full_name: string
	html_url: string
	stargazers_count: number
}

function formatStars(count: number) {
	if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`
	return String(count)
}

export function GitHubLinkPreview({ href, owner, repo, label }: GitHubLinkPreviewProps) {
	const [meta, setMeta] = useState<RepoMeta | null>(null)

	useEffect(() => {
		const controller = new AbortController()

		fetch(`https://api.github.com/repos/${owner}/${repo}`, { signal: controller.signal })
			.then(res => (res.ok ? res.json() : null))
			.then((data: RepoMeta | null) => {
				if (data) setMeta(data)
			})
			.catch(error => {
				if (error?.name !== 'AbortError') console.warn('Failed to load GitHub preview:', error)
			})

		return () => controller.abort()
	}, [owner, repo])

	const fullName = meta?.full_name || label || `${owner}/${repo}`
	const description = meta?.description || 'GitHub 仓库'
	const stars = meta?.stargazers_count
	const imageUrl = useMemo(() => `https://opengraph.githubassets.com/1/${owner}/${repo}`, [owner, repo])

	return (
		<a href={meta?.html_url || href} target='_blank' rel='noopener noreferrer' className='github-link-preview'>
			<div className='github-link-preview__site'>
				<ExternalLink size={16} />
				<span>github.com</span>
			</div>

			<div className='github-link-preview__body'>
				<img src={imageUrl} alt='' loading='lazy' className='github-link-preview__image' />

				<div className='github-link-preview__content'>
					<div className='github-link-preview__title'>
						<GithubSVG className='github-link-preview__icon' />
						<span>{fullName}</span>
						{typeof stars === 'number' && (
							<span className='github-link-preview__stars'>
								<Star size={13} />
								{formatStars(stars)}
							</span>
						)}
					</div>
					<div className='github-link-preview__description'>{description}</div>
				</div>
			</div>
		</a>
	)
}
