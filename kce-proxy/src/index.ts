export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return handleOptions(request);
		}

		if (url.pathname === '/external') {
			return proxyExternal(request, url);
		}

		if (url.pathname === '/internal') {
			return proxyInternal(request, url);
		}

		return new Response('Not found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;

function handleOptions(request: Request): Response {
	return new Response(null, {
		status: 204,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Max-Age': '86400',
		},
	});
}

async function proxyExternal(request: Request, url: URL): Promise<Response> {
	const sid1 = url.searchParams.get('sid1');
	const sid2 = url.searchParams.get('sid2');
	const eventdate = url.searchParams.get('eventdate');

	if (!sid1 || !sid2 || !eventdate) {
		return withCors(
			request,
			new Response('Missing parameters: sid1, sid2, eventdate are required', {
				status: 400,
			}),
		);
	}

	const targetUrl = `https://swrailway.gov.ua/timetable/eltrain/?sid1=${encodeURIComponent(
		sid1,
	)}&sid2=${encodeURIComponent(sid2)}&eventdate=${encodeURIComponent(eventdate)}`;

	const upstreamRes = await fetch(targetUrl, {
		method: 'GET',
		headers: {
			// Simple UA to look more like a browser
			'User-Agent': 'kce-proxy/1.0 (+https://panichev-oleg.github.io/kce)',
		},
	});

	const body = await upstreamRes.arrayBuffer();
	const resp = new Response(body, {
		status: upstreamRes.status,
		statusText: upstreamRes.statusText,
		headers: upstreamRes.headers,
	});

	return withCors(request, resp);
}

async function proxyInternal(request: Request, url: URL): Promise<Response> {
	const gid = url.searchParams.get('gid') ?? '1';
	const rid = url.searchParams.get('rid') ?? '480';
	const reverse = url.searchParams.get('reverse');
	const eventdate = url.searchParams.get('eventdate');

	if (!reverse || !eventdate) {
		return withCors(
			request,
			new Response('Missing parameters: reverse and eventdate are required', {
				status: 400,
			}),
		);
	}

	const targetUrl = `https://swrailway.gov.ua/timetable/eltrain/?gid=${encodeURIComponent(
		gid,
	)}&rid=${encodeURIComponent(rid)}&reverse=${encodeURIComponent(reverse)}&eventdate=${encodeURIComponent(eventdate)}&half=1&count=5`;

	const upstreamRes = await fetch(targetUrl, {
		method: 'GET',
		headers: {
			'User-Agent': 'kce-proxy/1.0 (+https://panichev-oleg.github.io/kce)',
		},
	});

	const body = await upstreamRes.arrayBuffer();
	const resp = new Response(body, {
		status: upstreamRes.status,
		statusText: upstreamRes.statusText,
		headers: upstreamRes.headers,
	});

	return withCors(request, resp);
}

function withCors(request: Request, response: Response): Response {
	const newHeaders = new Headers(response.headers);

	newHeaders.set('Access-Control-Allow-Origin', '*');
	newHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
	newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
	newHeaders.set('Vary', 'Origin');

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders,
	});
}
