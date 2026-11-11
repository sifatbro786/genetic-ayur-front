// Tiny immutable get/set by dot path ("announcement.text", "options.0.value").
// Used by the dashboard's schema-driven forms.

const toKeys = (path) => (Array.isArray(path) ? path : String(path).split("."));

export function getIn(obj, path) {
    return toKeys(path).reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

export function setIn(obj, path, value) {
    const [head, ...rest] = toKeys(path);
    const base = Array.isArray(obj) ? [...obj] : { ...(obj || {}) };
    base[head] = rest.length ? setIn(base[head], rest, value) : value;
    return base;
}
