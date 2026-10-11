import handler from "vinext/server/fetch-handler";

export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    const headers = new Headers(request.headers);
    for (const name of [...headers.keys()]) {
      if (name.startsWith("oai-authenticated-user-")) headers.delete(name);
    }
    headers.delete('x-mendje-country');
    const country=request.cf?.country;
    if(typeof country==='string')headers.set('x-mendje-country',country);
    const url=new URL(request.url);
    if(env.DB&&request.method==='GET'&&!url.pathname.startsWith('/api/')&&!url.pathname.includes('.')&&!url.pathname.startsWith('/_next/')){
      const day=new Date().toISOString().slice(0,10);
      // Fixed known paths only: no URLs, query strings or personal identifiers.
      const path=['/','/demo','/teacher','/teacher/login','/student','/admin'].includes(url.pathname)?url.pathname:'/other';
      ctx.waitUntil(env.DB.batch([
        env.DB.prepare('INSERT INTO traffic_days(day,path,count) VALUES(?,?,1) ON CONFLICT(day,path) DO UPDATE SET count=count+1').bind(day,path),
        env.DB.prepare('DELETE FROM traffic_days WHERE day<?').bind(new Date(Date.now()-30*86400000).toISOString().slice(0,10)),
      ]).catch(()=>{console.error('Traffic counters unavailable');}));
    }
    return handler.fetch(new Request(request, { headers }), env, ctx);
  },
};
