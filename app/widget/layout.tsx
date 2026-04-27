import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Omniweb AI Widget",
  description: "AI assistant widget",
}

/**
 * Minimal layout for the embeddable widget — no global site shell,
 * no fonts, no analytics. Just the widget itself in a transparent body.
 */
export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "transparent", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  )
}
