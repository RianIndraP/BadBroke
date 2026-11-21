interface PagefindResultData {
	url: string;
	excerpt: string;
	meta: Record<string, string | undefined>;
}

interface PagefindModule {
	options?: (options: { excerptLength?: number }) => Promise<void> | void;
	search: (query: string) => Promise<{
		results: { data: () => Promise<PagefindResultData> }[];
	}>;
}

const dialog = document.querySelector<HTMLDialogElement>("#search-dialog");
const input = document.querySelector<HTMLInputElement>("#search-input");
const list = document.querySelector<HTMLUListElement>("#search-results");
const empty = document.querySelector<HTMLElement>("#search-empty");
const none = document.querySelector<HTMLElement>("#search-none");
const error = document.querySelector<HTMLElement>("#search-error");
const errorText = document.querySelector<HTMLElement>("#search-error-text");
const status = document.querySelector<HTMLElement>("#search-status");
const queryLabel = document.querySelector<HTMLElement>("[data-search-query]");

if (
	dialog &&
	input &&
	list &&
	empty &&
	none &&
	error &&
	errorText &&
	status &&
	queryLabel
) {
	const isDev = import.meta.env.DEV;
	let pagefind: PagefindModule | null = null;
	let loadPromise: Promise<PagefindModule> | null = null;
	let lastTrigger: HTMLElement | null = null;
	let previousOverflow = "";
	let timer: number | undefined;
	let request = 0;
	let activeIndex = -1;

	const formatTag = (tag: string) =>
		tag.replace(/-+/g, " ").replace(/^./, (char) => char.toUpperCase());

	const reset = () => {
		request += 1;
		activeIndex = -1;
		list.replaceChildren();
		list.hidden = true;
		empty.hidden = false;
		none.hidden = true;
		error.hidden = true;
		status.textContent = "";
		input.removeAttribute("aria-activedescendant");
		input.setAttribute("aria-expanded", "false");
	};

	const showError = (message?: string) => {
		list.hidden = true;
		empty.hidden = true;
		none.hidden = true;
		error.hidden = false;
		status.textContent = "";
		input.setAttribute("aria-expanded", "false");
		errorText.textContent =
			message ?? "Pencarian gagal dimuat. Coba muat ulang halaman.";
	};

	const loadPagefind = () => {
		if (pagefind) return Promise.resolve(pagefind);
		if (loadPromise) return loadPromise;

		loadPromise = (async () => {
			const path = "/pagefind/pagefind.js";
			const module = (await import(
				/* @vite-ignore */ path
			)) as PagefindModule;

			await module.options?.({ excerptLength: 24 });
			pagefind = module;
			return module;
		})().catch((caught) => {
			loadPromise = null;
			throw caught;
		});

		return loadPromise;
	};

	const optionsNow = () =>
		Array.from(list.querySelectorAll<HTMLElement>('[role="option"]'));

	const setActive = (index: number) => {
		const options = optionsNow();
		if (options.length === 0) {
			activeIndex = -1;
			input.removeAttribute("aria-activedescendant");
			return;
		}

		activeIndex = (index + options.length) % options.length;
		options.forEach((option, position) => {
			option.setAttribute(
				"aria-selected",
				position === activeIndex ? "true" : "false",
			);
		});

		const active = options[activeIndex];
		input.setAttribute("aria-activedescendant", active.id);
		active.scrollIntoView({ block: "nearest" });
	};

	const render = (items: PagefindResultData[], query: string) => {
		list.replaceChildren();

		if (items.length === 0) {
			empty.hidden = true;
			error.hidden = true;
			none.hidden = false;
			queryLabel.textContent = query;
			status.textContent = `Tidak ada hasil untuk ${query}.`;
			input.setAttribute("aria-expanded", "false");
			return;
		}

		empty.hidden = true;
		none.hidden = true;
		error.hidden = true;
		list.hidden = false;
		input.setAttribute("aria-expanded", "true");

		items.forEach((item, index) => {
			const option = document.createElement("li");
			option.id = `search-result-${index}`;
			option.setAttribute("role", "option");
			option.setAttribute("aria-selected", "false");

			const link = document.createElement("a");
			link.href = item.url;
			link.className = "search-option";
			link.tabIndex = -1;

			const title = document.createElement("span");
			title.className = "search-option-title";
			title.textContent = item.meta.title ?? item.url;

			const excerpt = document.createElement("span");
			excerpt.className = "search-excerpt";
			excerpt.innerHTML = item.excerpt;

			link.append(title, excerpt);

			const tags = (item.meta.tags ?? "")
				.split(",")
				.map((tag) => tag.trim())
				.filter(Boolean);

			if (tags.length > 0) {
				const tagList = document.createElement("span");
				tagList.className = "search-tags";
				for (const tag of tags) {
					const tagItem = document.createElement("span");
					tagItem.className = "search-tag";
					tagItem.textContent = formatTag(tag);
					tagList.append(tagItem);
				}
				link.append(tagList);
			}

			option.append(link);
			option.addEventListener("pointerenter", () => setActive(index));
			list.append(option);
		});

		status.textContent = `${items.length} hasil untuk ${query}.`;
		setActive(0);
	};

	const runSearch = async (query: string) => {
		const current = request;
		list.hidden = true;
		empty.hidden = true;
		none.hidden = true;
		error.hidden = true;
		status.textContent = "Mencari...";
		input.setAttribute("aria-expanded", "false");

		try {
			const module = await loadPagefind();
			if (current !== request) return;

			const found = await module.search(query);
			if (current !== request) return;

			const items = await Promise.all(
				found.results.slice(0, 8).map((result) => result.data()),
			);
			if (current !== request) return;

			render(items, query);
		} catch {
			if (current !== request) return;
			showError();
		}
	};

	const openDialog = (trigger?: HTMLElement | null) => {
		if (dialog.open) return;

		lastTrigger =
			trigger ??
			(document.activeElement instanceof HTMLElement
				? document.activeElement
				: null);
		previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		input.value = "";
		reset();
		dialog.showModal();
		input.focus();

		if (isDev) {
			showError(
				"Pencarian hanya aktif di hasil build. Jalankan npm run build lalu npm run preview.",
			);
			return;
		}

		loadPagefind().catch(() => showError());
	};

	for (const trigger of document.querySelectorAll<HTMLElement>(
		"[data-search-open]",
	)) {
		trigger.hidden = false;
		trigger.addEventListener("click", (event) => {
			event.preventDefault();
			openDialog(trigger);
		});
	}

	for (const chip of document.querySelectorAll<HTMLButtonElement>(
		"[data-search-tag]",
	)) {
		chip.addEventListener("click", () => {
			input.value = chip.dataset.searchTag ?? "";
			input.dispatchEvent(new Event("input", { bubbles: true }));
			input.focus();
		});
	}

	document
		.querySelector<HTMLElement>("[data-search-close]")
		?.addEventListener("click", () => dialog.close());

	dialog.addEventListener("click", (event) => {
		if (event.target === dialog) dialog.close();
	});

	dialog.addEventListener("close", () => {
		document.body.style.overflow = previousOverflow;
		lastTrigger?.focus();
	});

	input.addEventListener("input", () => {
		if (isDev) return;

		window.clearTimeout(timer);
		const query = input.value.trim();

		if (!query) {
			reset();
			return;
		}

		request += 1;
		empty.hidden = true;
		none.hidden = true;
		error.hidden = true;
		list.hidden = true;
		status.textContent = "Mencari...";

		timer = window.setTimeout(() => {
			void runSearch(query);
		}, 80);
	});

	input.addEventListener("keydown", (event) => {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			if (optionsNow().length === 0) return;
			event.preventDefault();
			setActive(activeIndex + (event.key === "ArrowDown" ? 1 : -1));
			return;
		}

		if (event.key === "Enter" && activeIndex >= 0) {
			const link = optionsNow()[activeIndex]?.querySelector("a");
			if (!link) return;
			event.preventDefault();
			link.click();
		}
	});

	document.addEventListener("keydown", (event) => {
		const target = event.target;
		const typing =
			target instanceof HTMLElement &&
			(target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.tagName === "SELECT" ||
				target.isContentEditable);

		if (
			(event.ctrlKey || event.metaKey) &&
			event.key.toLowerCase() === "k"
		) {
			event.preventDefault();
			openDialog();
			return;
		}

		if (event.key === "/" && !typing && !dialog.open) {
			event.preventDefault();
			openDialog();
		}
	});
}
