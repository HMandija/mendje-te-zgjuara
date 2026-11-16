import vinext from 'vinext';
import { defineConfig, type ViteDevServer } from 'vite';
import {secureBrowserResponse} from './lib/browser-security.mjs';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';

const codingContentTypes:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.wav':'audio/wav','.mp3':'audio/mpeg','.ogg':'audio/ogg','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.zip':'application/zip'};

export default defineConfig(async () => {
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= 'false';
  process.env.WRANGLER_SEND_METRICS ??= 'false';
  const { cloudflare } = await import('@cloudflare/vite-plugin');
  return {
    define: { 'process.env.STANDALONE_DEPLOY': JSON.stringify('true') },
    plugins: [{
      name:'coding-assets-security',
      configureServer(server:ViteDevServer){
        const directory=resolve(server.config.publicDir,'coding-lab');
        server.middlewares.use((request,response,next)=>{
          const url=new URL(request.url||'/','http://localhost');
          if(!url.pathname.startsWith('/coding-lab/')||!['GET','HEAD'].includes(request.method||''))return next();
          const secured=secureBrowserResponse(new Response(null),new Request(url),'');
          secured.headers.forEach((value,key)=>response.setHeader(key,value));
          const file=resolve(directory,url.pathname.slice('/coding-lab/'.length));
          if(!file.startsWith(directory+sep)||!/^\/coding-lab\/[\w./-]+$/.test(url.pathname)){response.statusCode=404;response.end();return;}
          // Serve only public editor assets before the framework's opaque-origin dev guard.
          void stat(file).then(info=>{
            if(!info.isFile()){response.statusCode=404;response.end();return;}
            response.setHeader('Content-Type',codingContentTypes[extname(file)]||'application/octet-stream');
            if(request.method==='HEAD')response.end();
            else createReadStream(file).on('error',next).pipe(response);
          }).catch(()=>{response.statusCode=404;response.end();});
        });
      }
    },vinext(), cloudflare({
      configPath: '.cloudflare/wrangler.json',
      viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
      inspectorPort: false,
    })],
  };
});
