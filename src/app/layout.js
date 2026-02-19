import "./globals.css";

export const metadata = {
  title: "TradeLog — Trading Journal & Activity Tracker",
  description: "Log trades, analyze psychology, and track performance metrics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
