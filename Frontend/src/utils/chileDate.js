const CHILE_TIME_ZONE = "America/Santiago";

function parseIsoDateOnly(value) {
	if (typeof value !== "string") return null;
	const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return null;

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function parseDateForChile(value) {
	if (!value) return null;
	if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

	const isoDateOnly = parseIsoDateOnly(value);
	if (isoDateOnly) return isoDateOnly;

	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateForChile(value, options = {}) {
	const parsed = parseDateForChile(value);
	if (!parsed) return "Fecha por confirmar";

	return new Intl.DateTimeFormat("es-CL", {
		timeZone: CHILE_TIME_ZONE,
		...options
	}).format(parsed);
}
