/** @type {import('next').NextConfig} */
export default {
  transpilePackages: ["@alvarovillalbaa/agentcn-ui"],
  output: "export",
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
};
