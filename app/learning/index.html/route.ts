// Preserve old personal links, including their token fragment on HTTP redirects.
export function GET(request: Request) {
  const url = new URL(request.url);
  return Response.redirect(new URL(url.searchParams.get('student') === '1' ? '/student' : '/', url), 307);
}
