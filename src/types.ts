import { Status, Type } from '../sveltekit/src/lib/structs';

export interface EmailData {
	id?: number,
	to: string,
	from: string,
	subject: string,
	body: string,
	html_body?: string
}

export interface Ticket {
	project?: string,
	author?: string,
	timestamp?: string,
	assigned_to?: string,
	status: Status,
	resolution?: string,
	type: Type,
	severity: number,
	priority: number,
	title: string,
	description: string,
	reproduction_steps?: string,
	expected_result?: string,
	email_data?: {
		description_plain?: string,
		description_html?: string,
		reproduction_plain?: string,
		reproduction_html?: string,
		expected_plain?: string,
		expected_html?: string
	}
}

export interface Project {
	id?: string,
	name: string,
	admin: string,
	users: [string]
}