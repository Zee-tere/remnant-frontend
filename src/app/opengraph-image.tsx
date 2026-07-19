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
          <div style={{ color: "#006c52", display: "flex", fontSize: 34, fontWeight: 800 }}>
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
