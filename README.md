# URL Shortener bit.ly - Kenny

requirements:
- shortens a url
- looks up short url and redirect (301/302)
  - 301 is probably wrong, since we might possibly give the user a way to change or delete urls in the future (browser caches the 301 redirect?)
- HTTP routes
- frontend for users to create new shortened urls

questions:
- bit.ly likely serves over 100k or more DAU
- scalablility to 1k+ rps or more
- how to store urls? might be a ton like over 1B
- what other future features is needed? bit.ly has link tracking, custom landing pages

routes:
POST `/api/url/` -> creates a new short url
GET `/*/` -> redirect to long url if found

decisions:
- random base62 (alphanumerical) string generated
- database to store the data -> postgresql & drizzle orm (most familiar)
- cache? for redirect url yes -> just in memory map first, redis if requirements need it
- frontend -> react, shadcn, tailwind (most familiar)
- backend and frontend deployed on? railway.app serve from single origin backend for now.
