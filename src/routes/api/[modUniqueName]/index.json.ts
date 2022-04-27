import type { RequestHandler } from '@sveltejs/kit';
import { getRawContentUrl } from '$lib/helpers/get-raw-content-url';
import { getModReadme } from '$lib/helpers/api/get-mod-readme';
import { getAllMarkdownImages } from '$lib/helpers/api/get-markdown-images';
import { getImageMap } from '$lib/helpers/api/get-image-map';
import { readFromStore } from '$lib/helpers/read-from-store';
import { modList } from '$lib/store';

type Params = {
	modUniqueName: string;
};

export const get: RequestHandler<Params> = async ({ params }) => {
	const { modUniqueName } = params;

	const mod = (await readFromStore(modList)).find(({ uniqueName }) => uniqueName === modUniqueName);

	if (!mod) {
		return {
			status: 500,
			error: new Error(`Failed to find mod ${modUniqueName}`),
		};
	}

	const rawContentUrl = getRawContentUrl(mod);
	const readme = await getModReadme(mod);
	const images = getAllMarkdownImages(readme);
	const externalImages = rawContentUrl ? await getImageMap(rawContentUrl, images) : {};

	return {
		body: JSON.stringify({
			...(readme ? { readme } : undefined),
			externalImages,
		}),
	};
};
