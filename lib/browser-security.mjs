// Only the standalone gateway creates nonces. Never trust a client-supplied one.
export function createScriptNonce() {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))));
}

export function browserPolicy(nonce) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "script-src-attr 'none'",
    // React, motion and charts require inline styles, not inline scripts.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "worker-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'self'",
  ].join('; ');
}

/** @param {Response} response @param {Request} request @param {string} policy */
export function secureBrowserResponse(response, request, policy) {
  // Keep streaming bodies, status, redirects and all Set-Cookie headers intact.
  const secured = new Response(response.body, response);
  const headers = secured.headers;
  headers.set('Content-Security-Policy', policy);
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self), autoplay=(self)');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.delete('X-Powered-By');
  const url = new URL(request.url);
  if (url.protocol === 'https:') headers.set('Strict-Transport-Security', 'max-age=15552000');
  const type = headers.get('Content-Type') || '';
  if (url.pathname.startsWith('/api/') || type.includes('text/html') || type.includes('text/x-component')) {
    // Per-response nonces and personal responses must never be shared by caches.
    headers.set('Cache-Control', 'private, no-store');
    headers.set('CDN-Cache-Control', 'no-store');
    headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
    headers.delete('ETag');
  }
  return secured;
}
