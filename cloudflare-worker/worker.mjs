const PINATA_GATEWAY = 'https://ipfs.poa.earth';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // redirect bare poa.earth -> www.poa.earth
    if (url.hostname === 'poa.earth') {
      url.hostname = 'www.poa.earth';
      return Response.redirect(url.toString(), 301);
    }

    // Get CID from environment variable (set by CI/CD)
    const cid = env.SITE_CID;
    if (!cid) {
      return new Response('SITE_CID not configured', { status: 500 });
    }

    // proxy www.poa.earth to Pinata while keeping URL clean
    const upstreamUrl = new URL(PINATA_GATEWAY);
    upstreamUrl.pathname = `/ipfs/${cid}${url.pathname}`;
    upstreamUrl.search = url.search;

    const upstreamReq = new Request(upstreamUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body:
        request.method === 'GET' || request.method === 'HEAD'
          ? null
          : request.body,
      redirect: 'follow',
    });

    const upstreamRes = await fetch(upstreamReq);

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: upstreamRes.headers,
    });
  },
};
