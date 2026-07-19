import { ImageResponse } from "next/og";

export const alt = "Remnant Market Nigeria - every useful piece can find a new home";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#f7fbf9",
          color: "#102a25",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "flex-start",
            display: "flex",
            flexDirection: "column",
            maxWidth: "970px",
          }}
        >
          <div style={{ alignItems: "center", color: "#006c52", display: "flex", fontSize: 34, fontWeight: 800 }}>
            <svg
              viewBox="0 0 60 60"
              width="52"
              height="52"
              fill="none"
              style={{ marginRight: 14 }}
            >
              <path
                d="M19 4.5 55 26 45.5 43.2c-1.2 2.2-4.4 2-5.3-.4-2.3-6.1-10.6-7.5-14.8-2.5-4.7 5.5-.2 13.9 7 13.1 2.7-.3 4.5 2.7 2.9 4.9L33.9 60 4.5 43.8 19 4.5Z"
                stroke="#006c52"
                strokeWidth="3.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Remnant Market Nigeria
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 70,
              fontWeight: 800,
              lineHeight: 1.08,
              marginTop: 32,
            }}
          >
            Sell, trade, donate, repair, or recycle useful things.
          </div>
          <div style={{ color: "#49645d", display: "flex", fontSize: 28, marginTop: 34 }}>
            Every useful piece can find a new home.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
