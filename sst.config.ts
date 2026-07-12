/// <reference path="./.sst/platform/config.d.ts" />

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export default $config({
  app(input) {
    return {
      name: "remnant-frontend",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    const apiUrl = requireEnv("NEXT_PUBLIC_API_URL");
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || apiUrl;
    const escrowEnabled = process.env.NEXT_PUBLIC_ESCROW_ENABLED || "false";

    const web = new sst.aws.Nextjs("RemnantWeb", {
      domain:
        $app.stage === "production"
          ? {
              name: "remnantmarket.co",
              redirects: ["www.remnantmarket.co"],
            }
          : undefined,
      environment: {
        NEXT_PUBLIC_API_URL: apiUrl,
        NEXT_PUBLIC_SOCKET_URL: socketUrl,
        NEXT_PUBLIC_ESCROW_ENABLED: escrowEnabled,
      },
    });

    return {
      url: web.url,
    };
  },
});
