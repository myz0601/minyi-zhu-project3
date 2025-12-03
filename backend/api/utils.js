export function wrapAsync(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function requireUser(req, res, next) {
  const username = req.cookies.username;
  if (!username) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  req.username = username;
  next();
}
