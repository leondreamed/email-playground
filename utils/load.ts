import { EmailSpec } from './spec.js'

export async function loadEmails() {
	await EmailSpec.loadAll()
}