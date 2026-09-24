interface SiteEnvironment {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

/** The application is exported by Next; Sites serves the exact generated assets. */
const worker = {
  fetch(request: Request, env: SiteEnvironment) {
    return env.ASSETS.fetch(request);
  },
};

export default worker;
