import type { ZodSchema } from 'zod'

export interface EmailSpecSchema<Data extends ZodSchema | null> {
	slug: string
	html: string
	text: string
	data: Data
	subject: string
}