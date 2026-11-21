import { useEffect, useMemo, useRef, useState } from "react";
import {
	forceCenter,
	forceCollide,
	forceLink,
	forceManyBody,
	forceSimulation,
	type SimulationLinkDatum,
	type SimulationNodeDatum,
} from "d3-force";
import type { GraphEdge, GraphNode } from "../lib/graph";

interface Props {
	nodes: GraphNode[];
	edges: GraphEdge[];
	topics: { tag: string; count: number }[];
	labelIds: string[];
}

interface SimNode extends GraphNode, SimulationNodeDatum {}
interface SimLink extends SimulationLinkDatum<SimNode> {}

const ALL_TOPICS = "__all__";

const tagLabel = (tag: string) =>
	tag.replace(/-+/g, " ").replace(/^./, (char) => char.toUpperCase());

const radiusFor = (node: GraphNode) => 5 + Math.sqrt(node.degree) * 2.6;

export default function GraphExplorer({
	nodes,
	edges,
	topics,
	labelIds,
}: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [activeTag, setActiveTag] = useState(ALL_TOPICS);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const selectedRef = useRef<string | null>(null);
	const drawRef = useRef<(() => void) | null>(null);

	selectedRef.current = selectedId;

	const visibleNodes = useMemo(
		() =>
			activeTag === ALL_TOPICS
				? nodes
				: nodes.filter((node) => node.tags.includes(activeTag)),
		[nodes, activeTag],
	);

	const visibleEdges = useMemo(() => {
		const ids = new Set(visibleNodes.map((node) => node.id));
		return edges.filter(
			(edge) => ids.has(edge.source) && ids.has(edge.target),
		);
	}, [edges, visibleNodes]);

	const selected = nodes.find((node) => node.id === selectedId) ?? null;

	useEffect(() => {
		drawRef.current?.();
	}, [selectedId]);

	useEffect(() => {
		const canvas = canvasRef.current;
		const shell = canvas?.parentElement;
		if (!canvas || !shell || visibleNodes.length === 0) return;

		const context = canvas.getContext("2d");
		if (!context) return;

		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		const simNodes: SimNode[] = visibleNodes.map((node) => ({ ...node }));
		const byId = new Map(simNodes.map((node) => [node.id, node]));
		const simEdges: SimLink[] = visibleEdges.flatMap((edge) => {
			const source = byId.get(edge.source);
			const target = byId.get(edge.target);
			return source && target ? [{ source, target }] : [];
		});

		const adjacency = new Map<string, Set<string>>(
			simNodes.map((node) => [node.id, new Set<string>()]),
		);
		for (const link of simEdges) {
			const source = (link.source as SimNode).id;
			const target = (link.target as SimNode).id;
			adjacency.get(source)?.add(target);
			adjacency.get(target)?.add(source);
		}

		const labelled = new Set(labelIds);
		let width = Math.max(1, shell.clientWidth);
		let height = Math.max(1, shell.clientHeight);
		let hoveredId: string | null = null;
		let touchTap: {
			id: string | null;
			startX: number;
			startY: number;
			moved: boolean;
		} | null = null;
		let drag: {
			node: SimNode;
			pointerId: number;
			startX: number;
			startY: number;
			moved: boolean;
		} | null = null;

		const simulation = forceSimulation(simNodes)
			.force(
				"link",
				forceLink<SimNode, SimLink>(simEdges)
					.id((node) => node.id)
					.distance(72)
					.strength(0.45),
			)
			.force("charge", forceManyBody().strength(-150))
			.force("center", forceCenter(width / 2, height / 2))
			.force(
				"collide",
				forceCollide<SimNode>().radius((node) => radiusFor(node) + 12),
			);

		const colours = () => {
			const styles = getComputedStyle(document.documentElement);
			const read = (name: string, fallback: string) =>
				styles.getPropertyValue(name).trim() || fallback;

			return {
				ink: read("--ink", "#15191b"),
				muted: read("--muted", "#59635e"),
				line: read("--line", "#d8ddd8"),
				accent: read("--accent", "#0e6b4f"),
				surface: read("--surface", "#fbfcfa"),
			};
		};

		let palette = colours();

		const truncate = (text: string, maxWidth: number) => {
			if (context.measureText(text).width <= maxWidth) return text;

			let cut = text;
			while (cut.length > 1) {
				cut = cut.slice(0, -1);
				if (context.measureText(`${cut}...`).width <= maxWidth) break;
			}
			return `${cut}...`;
		};

		const draw = () => {
			const focusId = hoveredId ?? selectedRef.current;
			const highlighted = focusId
				? new Set([focusId, ...(adjacency.get(focusId) ?? [])])
				: null;

			context.clearRect(0, 0, width, height);

			for (const link of simEdges) {
				const source = link.source as SimNode;
				const target = link.target as SimNode;
				const lit =
					highlighted !== null &&
					highlighted.has(source.id) &&
					highlighted.has(target.id);

				context.beginPath();
				context.moveTo(source.x ?? 0, source.y ?? 0);
				context.lineTo(target.x ?? 0, target.y ?? 0);
				context.strokeStyle = lit ? palette.accent : palette.line;
				context.lineWidth = lit ? 1.6 : 1;
				context.globalAlpha = highlighted
					? lit
						? 0.85
						: 0.12
					: 0.55;
				context.stroke();
			}

			context.globalAlpha = 1;

			for (const node of simNodes) {
				const x = Math.min(
					width - radiusFor(node) - 2,
					Math.max(radiusFor(node) + 2, node.x ?? width / 2),
				);
				const y = Math.min(
					height - radiusFor(node) - 2,
					Math.max(radiusFor(node) + 2, node.y ?? height / 2),
				);
				node.x = x;
				node.y = y;

				const lit = highlighted === null || highlighted.has(node.id);
				const focused = focusId === node.id;

				context.beginPath();
				context.arc(x, y, radiusFor(node) + (focused ? 1.5 : 0), 0, Math.PI * 2);
				context.fillStyle = lit ? (highlighted ? palette.accent : palette.ink) : palette.muted;
				context.globalAlpha = lit ? (highlighted ? 0.95 : 0.55) : 0.18;
				context.fill();
				context.globalAlpha = 1;
			}

			context.font = '12px "Geist Variable", ui-sans-serif, system-ui, sans-serif';
			context.textBaseline = "middle";

			const labelNode = (node: SimNode, focused: boolean) => {
				const text = truncate(
					node.title,
					Math.min(180, Math.max(80, width * 0.42)),
				);
				const textWidth = context.measureText(text).width;
				const x = node.x ?? 0;
				const y = node.y ?? 0;
				const radius = radiusFor(node);
				const left = x + radius + 8 + textWidth > width - 8;
				const boxX = left ? x - radius - 8 - textWidth : x + radius + 8;
				const boxY = y - 9;

				context.fillStyle = palette.surface;
				context.globalAlpha = 0.88;
				context.beginPath();
				context.roundRect(boxX - 4, boxY, textWidth + 8, 18, 4);
				context.fill();
				context.globalAlpha = 1;

				context.fillStyle = focused ? palette.accent : palette.ink;
				context.fillText(text, boxX, y);
			};

			for (const node of simNodes) {
				const focused = focusId === node.id;
				const dimmed =
					highlighted !== null && !highlighted.has(node.id);

				if (dimmed && !focused) continue;
				if (focused || labelled.has(node.id)) labelNode(node, focused);
			}
		};

		drawRef.current = draw;

		const setCanvasSize = () => {
			width = Math.max(1, shell.clientWidth);
			height = Math.max(1, shell.clientHeight);
			const dpr = Math.min(2, window.devicePixelRatio || 1);

			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			context.setTransform(dpr, 0, 0, dpr, 0, 0);

			simulation.force("center", forceCenter(width / 2, height / 2));
			draw();
		};

		setCanvasSize();

		if (reducedMotion) {
			simulation.stop();
			for (let index = 0; index < 300; index += 1) simulation.tick();
			draw();
		} else {
			simulation.on("tick", draw);
			simulation.alpha(1).restart();
		}

		const pointerPosition = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			return { x: event.clientX - rect.left, y: event.clientY - rect.top };
		};

		const nodeAt = (x: number, y: number) => {
			for (let index = simNodes.length - 1; index >= 0; index -= 1) {
				const node = simNodes[index];
				const dx = x - (node.x ?? 0);
				const dy = y - (node.y ?? 0);
				if (Math.hypot(dx, dy) <= radiusFor(node) + 6) return node;
			}
			return null;
		};

		const onPointerDown = (event: PointerEvent) => {
			const { x, y } = pointerPosition(event);
			const node = nodeAt(x, y);

			if (!node) {
				if (event.pointerType !== "mouse") {
					touchTap = { id: null, startX: x, startY: y, moved: false };
					setSelectedId(null);
				}
				return;
			}

			hoveredId = node.id;
			draw();

			if (event.pointerType !== "mouse") {
				touchTap = { id: node.id, startX: x, startY: y, moved: false };
				return;
			}

			event.preventDefault();
			canvas.setPointerCapture(event.pointerId);
			node.fx = node.x;
			node.fy = node.y;
			simulation.alphaTarget(0.12).restart();
			drag = {
				node,
				pointerId: event.pointerId,
				startX: x,
				startY: y,
				moved: false,
			};
		};

		const onPointerMove = (event: PointerEvent) => {
			const { x, y } = pointerPosition(event);

			if (touchTap) {
				if (
					!touchTap.moved &&
					Math.hypot(x - touchTap.startX, y - touchTap.startY) > 8
				) {
					touchTap.moved = true;
				}
				return;
			}

			if (drag) {
				if (
					!drag.moved &&
					Math.hypot(x - drag.startX, y - drag.startY) > 4
				) {
					drag.moved = true;
				}
				if (drag.moved) {
					drag.node.fx = x;
					drag.node.fy = y;
				}
				return;
			}

			const node = nodeAt(x, y);
			const nextId = node?.id ?? null;

			if (nextId !== hoveredId) {
				hoveredId = nextId;
				canvas.style.cursor = node ? "pointer" : "default";
				draw();
			}
		};

		const finishInteraction = (event: PointerEvent) => {
			if (touchTap) {
				const tap = touchTap;
				touchTap = null;
				hoveredId = null;
				if (!tap.moved) setSelectedId(tap.id);
				draw();
				return;
			}

			if (!drag) return;

			const { node, moved } = drag;
			drag = null;
			node.fx = null;
			node.fy = null;
			simulation.alphaTarget(0);
			simulation.alpha(0.35).restart();

			if (canvas.hasPointerCapture(event.pointerId)) {
				canvas.releasePointerCapture(event.pointerId);
			}

			if (moved) {
				draw();
				return;
			}

			window.location.assign(`/catatan/${node.id}/`);
		};

		const cancelInteraction = () => {
			touchTap = null;
			hoveredId = null;
			if (!drag) {
				draw();
				return;
			}

			drag.node.fx = null;
			drag.node.fy = null;
			drag = null;
			simulation.alphaTarget(0);
			simulation.alpha(0.35).restart();
			draw();
		};

		const onPointerLeave = () => {
			if (drag) return;
			hoveredId = null;
			canvas.style.cursor = "default";
			draw();
		};

		canvas.addEventListener("pointerdown", onPointerDown);
		canvas.addEventListener("pointermove", onPointerMove);
		canvas.addEventListener("pointerup", finishInteraction);
		canvas.addEventListener("pointercancel", cancelInteraction);
		canvas.addEventListener("pointerleave", onPointerLeave);

		const resizeObserver = new ResizeObserver(setCanvasSize);
		resizeObserver.observe(shell);

		const themeObserver = new MutationObserver(() => {
			palette = colours();
			draw();
		});
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});

		return () => {
			simulation.stop();
			resizeObserver.disconnect();
			themeObserver.disconnect();
			drawRef.current = null;
			canvas.removeEventListener("pointerdown", onPointerDown);
			canvas.removeEventListener("pointermove", onPointerMove);
			canvas.removeEventListener("pointerup", finishInteraction);
			canvas.removeEventListener("pointercancel", cancelInteraction);
			canvas.removeEventListener("pointerleave", onPointerLeave);
		};
	}, [visibleNodes, visibleEdges, labelIds]);

	const chooseTag = (tag: string) => {
		setActiveTag(tag);
		setSelectedId(null);
	};

	const filterClass = (active: boolean) =>
		`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors ${
			active
				? "border-accent bg-accent-soft text-accent"
				: "border-line text-muted hover:border-accent hover:text-accent"
		}`;

	return (
		<div>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div
					className="flex flex-wrap gap-2"
					role="group"
					aria-label="Filter topik">
					<button
						type="button"
						aria-pressed={activeTag === ALL_TOPICS}
						className={filterClass(activeTag === ALL_TOPICS)}
						onClick={() => chooseTag(ALL_TOPICS)}>
						Semua
					</button>
					{topics.map(({ tag, count }) => (
						<button
							key={tag}
							type="button"
							aria-pressed={activeTag === tag}
							className={filterClass(activeTag === tag)}
							onClick={() => chooseTag(tag)}>
							{tagLabel(tag)}
							<span className="ml-1.5 text-xs opacity-70" aria-hidden="true">
								{count}
							</span>
						</button>
					))}
				</div>
				<a
					href="/topik/"
					className="inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-4 transition-colors hover:text-accent">
					Semua topik
				</a>
			</div>

			{nodes.length === 0 ? (
				<div className="mt-4 border-t border-line/70 py-12 text-muted">
					<p>Belum ada catatan yang dipublikasikan.</p>
					<a
						href="/catatan/"
						className="mt-2 inline-block underline underline-offset-4 hover:text-accent">
						Lihat arsip
					</a>
				</div>
			) : (
				<div className="relative mt-4 h-[380px] w-full overflow-hidden sm:h-[60vh] sm:min-h-[420px] sm:max-h-[640px]">
					<canvas
						ref={canvasRef}
						className="absolute inset-0 size-full touch-pan-y"
						role="img"
						aria-label={`Peta ${nodes.length} catatan yang saling terhubung. Gunakan arsip atau pencarian untuk menjelajah.`}
					/>
					<noscript>
						<div className="relative flex h-full items-center justify-center p-6 text-center">
							<p className="max-w-sm text-muted">
								Peta catatan membutuhkan JavaScript.{" "}
								<a
									href="/catatan/"
									className="underline underline-offset-4 hover:text-accent">
									Lihat semua catatan
								</a>
								.
							</p>
						</div>
					</noscript>
				</div>
			)}

			<div aria-live="polite">
				{selected && (
					<div className="mt-4 rounded-[14px] border border-line bg-surface p-4 sm:p-5">
						<p className="text-xs tracking-wide text-muted uppercase">
							Catatan dipilih
						</p>
						<h3 className="mt-1 font-serif text-2xl leading-snug">
							{selected.title}
						</h3>
						<p className="mt-2 max-w-2xl text-pretty leading-relaxed text-muted">
							{selected.summary}
						</p>
						{selected.tags.length > 0 && (
							<ul className="mt-3 flex flex-wrap gap-2" aria-label="Topik catatan">
								{selected.tags.map((tag) => (
									<li key={tag}>
										<a href={`/topik/${tag}/`} className="chip">
											{tagLabel(tag)}
										</a>
									</li>
								))}
							</ul>
						)}
						<div className="mt-4 flex flex-wrap gap-2">
							<a
								href={`/catatan/${selected.id}/`}
								className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-paper transition-opacity hover:opacity-90">
								Baca catatan
							</a>
							<button
								type="button"
								className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
								onClick={() => setSelectedId(null)}>
								Tutup
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
