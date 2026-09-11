// alpinejs ships no TypeScript declarations. Minimal ambient shim so
// `import Alpine from "alpinejs"` typechecks; Alpine's API surface is
// untyped (any) as a result — acceptable for now, revisit if that bites.
declare module "alpinejs";
