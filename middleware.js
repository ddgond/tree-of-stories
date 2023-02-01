function requestToString(req) {
  return `${req.method} ${req.url}`;
}

function passesFilter(req) {
  const url = new URL(req.url);
  if (url.pathname.startsWith("/_next")) {
    return false;
  }
  return true;
}

export function middleware(req) {
  if (process.env.DEBUGGING && passesFilter(req)) {
    console.log(requestToString(req));
  }
}