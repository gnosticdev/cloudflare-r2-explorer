import { Layout } from '@/components/Layout'
import type { R2Bindings, R2ObjectsCustom } from '@/types'
import type { R2ObjectBody } from '@cloudflare/workers-types'
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { cors } from 'hono/cors'
import { showRoutes } from 'hono/dev'
import { createContext } from 'hono/jsx'
import { jsxRenderer } from 'hono/jsx-renderer'
import { R2BucketList } from './components/List'
import { apiRoutes } from './routes'

const app = new Hono<{ Bindings: R2Bindings }>()
// Register middlewares
app.use('*', cors())
// Add a middleware to check for basic auth
app.use('*', async (c, next) => {
	const auth = basicAuth({
		username: c.env.USERNAME,
		password: c.env.PASSWORD
	})
	return auth(c, next)
})
// basic logger middleware
app.notFound((c) => {
	return c.html('<p>No page here</p>')
})

// middleware that renders jsx components to html
app.get(
	'*',
	jsxRenderer(({ children }) => {
		return <Layout>{children}</Layout>
	})
)

// examples from hono docs
// app.route('/examples', examples)

// api routes are prefixed with /api
app.route('/api', apiRoutes)

export const ClientContext = createContext<{
	r2Objects: R2ObjectsCustom | null
	uploadMessage: 'waiting' | 'success' | 'failed'
}>({ r2Objects: null, uploadMessage: 'waiting' })

// R2 bucket interface + upload form
app.get('/', async (c) => {
	const listOptions: R2ListOptions & { include: (keyof R2ObjectBody)[] } = {
		include: ['customMetadata', 'httpMetadata'],
		limit: 20
	}
	const r2ObjectsList = (await c.env.BUCKET_NAME.list(
		listOptions
	)) as R2ObjectsCustom
	return c.render(
		<ClientContext.Provider
			value={{ r2Objects: r2ObjectsList, uploadMessage: 'waiting' }}
		>
			<R2BucketList />
		</ClientContext.Provider>
	)
})

showRoutes(app, { colorize: true })

export default app
