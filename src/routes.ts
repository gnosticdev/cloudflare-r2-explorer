import type { R2Bindings } from '@/types'
import { ReadableStream } from '@cloudflare/workers-types'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import {
	flatten,
	instance,
	object,
	picklist,
	safeParse,
	string,
	type Output
} from 'valibot'

type DataResponse = {
	message: string
	data?: unknown
}

const apiRoutes = new Hono<{ Bindings: R2Bindings }>()

apiRoutes.get('/download/:key', async (c) => {
	const key = c.req.param('key').split('.')[0]
	const r2Object = await c.env.BUCKET_NAME.get(key)

	if (r2Object === null) {
		return c.json({
			error: 'not found, did you forget to use the api?'
		})
	}
	// Return the mp3 file as a download
	const file = await r2Object.blob()
	c.header('Content-Type', 'audio/mpeg')
	c.header('Content-Disposition', `attachment; filename="${key}.mp3"`)
	return c.json<DataResponse>({
		message: `downloaded object for ${key}`,
		data: file
	})
})

const formSchema = object({ key: string('no key found'), file: instance(File) })
const fileExts = ['mp3', 'wav', 'ogg', 'mp4'] as const
const fileExtSchema = picklist(fileExts, 'no file extension found')
const metadataSchema = object({
	fileType: string('no file type found'),
	fileName: string('no file name found'),
	fileExtension: fileExtSchema,
	fileSize: string('no file size found')
})
export type CustomMetadata = Output<typeof metadataSchema>

apiRoutes.post(
	'/upload',
	validator('form', (value, ctx) => {
		const parsed = safeParse(formSchema, value)
		if (parsed.success) {
			console.log('parsed form', parsed.output)
			return parsed.output
		}
		console.error(flatten(parsed.issues))
		return
	}),
	async (ctx) => {
		const body = await ctx.req.parseBody()
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		const file = body['file'] as File
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		const key = body['key'] as string

		const formData = Object.fromEntries(await ctx.req.formData())
		const fileExtension = file.name.split('.').pop() as Output<
			typeof fileExtSchema
		>
		const metadata = safeParse(metadataSchema, {
			fileExtension,
			fileName: file.name,
			fileSize: file.size.toString(),
			fileType: file.type
		} satisfies CustomMetadata)
		if (!metadata.success) {
			const { issues } = metadata
			console.error(issues)
			return ctx.json<DataResponse>({
				message: 'error in file metadata',
				data: issues
			})
		}

		console.dir('formData', formData)

		const res = await ctx.env.BUCKET_NAME.put(
			key,
			file.stream() as ReadableStream<Uint8Array>,
			{
				customMetadata: metadata.output
			}
		)

		console.log(JSON.stringify(res))

		return ctx.json<DataResponse>({
			message: `uploaded object for ${key}`
		})
	}
)

apiRoutes.get('/load/:key', async (ctx) => {
	const key = ctx.req.param('key')
	// return only the first 100_000 bytes of the audio file
	const range: R2Range = {
		length: 100_000
	}
	console.log('loading key', key)
	// get the first 100_000 bytes (10kb) of the audio file
	const r2object = await ctx.env.BUCKET_NAME.get(key, {
		range
	})

	const arrayBuffer = await r2object.arrayBuffer()

	return ctx.newResponse(arrayBuffer, {
		headers: {
			'Content-Type': 'audio/mpeg',
			'Content-Disposition': `attachment; filename="${r2object.customMetadata}.mp3"`
		}
	})
})

export { apiRoutes }
