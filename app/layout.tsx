import './globals.css';
import Script from 'next/script';
// Import the Three.js initialization module to apply patches early
import '../lib/three/initialize';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Special script to ensure THREE constants are defined before any module loads */}
        <Script id="three-init" strategy="beforeInteractive">
          {`
            // Pre-define critical THREE constants to avoid initialization errors
            if (typeof window !== 'undefined') {
              window.THREE = window.THREE || {};
              Object.assign(window.THREE, {
                UnsignedByteType: 1009,
                ByteType: 1010,
                ShortType: 1011,
                UnsignedShortType: 1012,
                IntType: 1013,
                UnsignedIntType: 1014,
                FloatType: 1015,
                HalfFloatType: 1016,
                RGBAFormat: 1023,
                RGIntegerFormat: 1033,
                RedFormat: 1028,
                RGFormat: 1030,
                RedIntegerFormat: 1031,
                RGBAIntegerFormat: 1033,
                LinearEncoding: 3000,
                sRGBEncoding: 3001,
                LinearFilter: 1006,
                NearestFilter: 1003,
                ClampToEdgeWrapping: 1001,
                UVMapping: 300,
                LinearMipMapLinearFilter: 1008,
                NoToneMapping: 0,
                LinearSRGBColorSpace: 'Linear',
                SRGBColorSpace: 'srgb',
                NoBlending: 0,
                FrontSide: 0,
                BackSide: 1,
                DoubleSide: 2
              });
              console.log('THREE constants pre-initialized in script tag');
            }
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
