interface BlogQueryResult {
	total: number
	briefs: BlogRoute[]
}

type FullBlog = BlogFile & BlogProps

interface BlogRoute extends BlogProps {
	route: string
}

interface BlogFile {
	filename: string
  content: string
}

interface BlogProps {
	id: string
	title: string
	categories: string
	published: string
	created_at: string
	last_updated: string
}