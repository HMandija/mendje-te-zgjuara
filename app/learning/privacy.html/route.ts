export function GET(request: Request) {
  return Response.redirect(new URL('/privacy', request.url), 307);
}
