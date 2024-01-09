import type { CustomMetadata } from '@/routes'

export interface R2ObjectWithMetadata extends R2Object {
	customMetadata: CustomMetadata
}
export type R2ObjectsCustom = R2Objects & {
	objects: R2ObjectWithMetadata[]
}

export type R2Bindings = {
	[K in keyof Env]: Env[K]
}
