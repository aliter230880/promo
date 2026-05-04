const STORE_KEY = "__promo_os_runtime_store__";

function createStore() {
  return {
    jobs: new Map(),
    idempotency: new Map(),
    channelEvents: new Map(),
    postHashes: new Map()
  };
}

export function getRuntimeStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = createStore();
  }
  return globalThis[STORE_KEY];
}
