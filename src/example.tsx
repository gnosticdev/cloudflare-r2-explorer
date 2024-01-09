import { Hono } from 'hono'
import { html } from 'hono/html'
import { ErrorBoundary, type FC } from 'hono/jsx'
import { jsxRenderer } from 'hono/jsx-renderer'
import { Suspense } from 'hono/jsx/streaming'
import { streamSSE } from 'hono/streaming'
import type { Bindings } from 'hono/types'

const app = new Hono<{ Bindings: Bindings }>()
app.basePath('/examples')

interface SiteData {
	title: string
	description: string
	image: string
	children?: unknown
}

const Layout = (props: SiteData) => html`
<html>
<head>
  <meta charset="UTF-8">
  <title>${props.title}</title>
  <meta name="description" content="${props.description}">
  <head prefix="og: http://ogp.me/ns#">
  <meta property="og:type" content="article">
  <!-- More elements slow down JSX, but not template literals. -->
  <meta property="og:title" content="${props.title}">
  <meta property="og:image" content="${props.image}">
</head>
<body>
  ${props.children}
</body>
</html>
`

app.get('/sse', async (c) => {
	let id = 0
	return streamSSE(c, async (stream) => {
		while (true) {
			const message = `It is ${new Date().toISOString()}`
			await stream.writeSSE({
				data: message,
				event: 'update',
				id: `${id++}`
			})
			await stream.sleep(1000)
		}
	})
})

app.get(
	'*',
	jsxRenderer(
		({ children }) => {
			return (
				<html lang="en">
					<body>
						<h1>SSR Streaming</h1>
						{children}
					</body>
				</html>
			)
		},
		{ stream: true }
	)
)

type AProps = {
	message: string
}

const AsyncComponent: FC<AProps> = async (props) => {
	await new Promise((r) => setTimeout(() => r, 1000))
	return <div>{props.message}</div>
}

app.get('/suspense', async (c) => {
	const message = 'Loading...'
	return c.render(
		<html lang="en">
			<body>
				<ErrorBoundary fallback={<div>Out of Service</div>}>
					<Suspense fallback={<div>Suspense...</div>}>
						<AsyncComponent message={message} />
					</Suspense>
				</ErrorBoundary>
			</body>
		</html>
	)
})

export default app
