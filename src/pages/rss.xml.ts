import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { siteConfig } from "../config";
import { prepareNotes } from "../lib/notes";

export const GET: APIRoute = async (context) => {
	const entries = await getCollection("catatan");
	const notes = prepareNotes(entries, { strict: import.meta.env.PROD });

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: context.site ?? new URL(siteConfig.url),
		items: notes.map((note) => ({
			title: note.title,
			pubDate: note.date,
			description: note.summary,
			link: `/catatan/${note.id}/`,
			categories: note.tags,
		})),
		customData: "<language>id</language>",
	});
};
