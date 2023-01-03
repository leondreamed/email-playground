import fs from 'node:fs'
import path from 'node:path'

import { packageDirs } from '@dialect-inc/paths'
import * as ets from 'embedded-ts'
import type { z, ZodSchema } from 'zod'

import type { EmailSpecSchema } from '~/types/spec.js'

export class EmailSpec<Data extends ZodSchema | null> {
	static emailSpecMap = new Set<EmailSpec<any>>()

	static async loadAll() {
		await Promise.all(
			[...this.emailSpecMap].map(async (emailSpec) => {
				await emailSpec.load()
			})
		)
	}

	slug: string
	dataSchema: Data
	subject: string
	#text: string
	#html: string

	htmlTemplate: ets.TemplateFunction | undefined
	textTemplate: ets.TemplateFunction | undefined

	get uncompiledHtml() {
		return this.#html
	}

	constructor({ slug, html, text, subject, data }: EmailSpecSchema<Data>) {
		this.slug = slug
		this.#html = html
		this.#text = text
		this.subject = subject
		this.dataSchema = data
		EmailSpec.emailSpecMap.add(this)
	}

	async load() {
		let emailHtml: string
		if (typeof window === 'undefined') {
			emailHtml = await fs.promises.readFile(
				path.join(packageDirs.emails, 'dist-emails', this.slug),
				'utf8'
			)
		} else {
			const { default: htmlUrl } = await import(
				`../../dist-emails/${this.slug}.html?url`
			)
			const response = await fetch(htmlUrl, { cache: 'no-store' })
			emailHtml = await response.text()
		}

		this.htmlTemplate = await ets.compile(emailHtml)
		this.textTemplate = await ets.compile(this.#text)
	}

	async render(...data: Data extends ZodSchema ? [data: z.infer<Data>] : []) {
		if (this.htmlTemplate === undefined || this.textTemplate === undefined) {
			throw new Error('load() must be called before render()')
		}

		const html = await this.htmlTemplate(data[0])
		const text = await this.textTemplate(data[0])

		return { subject: this.subject, html, text }
	}
}

export function defineEmailSpec<Data extends ZodSchema | null>(
	specSchema: EmailSpecSchema<Data>
): EmailSpec<Data> {
	return new EmailSpec<Data>(specSchema)
}

const getSpecsDir = () => path.join(packageDirs.emails, 'src/specs')

/**
	Returns a map from spec slug to spec
*/
export async function importEmailSpecs(): Promise<
	Record<string, EmailSpec<any>>
> {
	const specsDir = getSpecsDir()
	let specFileNames = await fs.promises.readdir(specsDir)
	specFileNames = specFileNames.filter(
		(specFileName) =>
			specFileName.endsWith('.ts') && specFileName !== 'index.ts'
	)
	return Object.fromEntries(
		await Promise.all(
			specFileNames.map(async (specFileName) => {
				const specFilePath = path.join(specsDir, specFileName)
				const specSlug = path.parse(specFileName).name
				const { default: spec } = await import(specFilePath)
				return [specSlug, spec]
			})
		)
	)
}