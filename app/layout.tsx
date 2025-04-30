import './globals.css';
// Import the Three.js initialization module to apply patches early
import '../lib/three/initialize';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
