/// <reference types="vite/client" />
// filepath: project/src/vite-env.d.ts
declare module "*.json" {
  const value: any;
  export default value;
}