import './globals.css';
import Script from 'next/script';
// Import the Three.js initialization module to apply patches early
import '../lib/three/initialize';
import ThreeVerification from './components/ThreeVerification';

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
              
              // Basic constants
              const constants = {
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
                DoubleSide: 2,
                
                // Math constants
                DEG2RAD: Math.PI / 180,
                RAD2DEG: 180 / Math.PI,
              };
              
              // Basic stubs for critical classes to prevent initialization errors
              constants.Vector3 = function(x, y, z) { 
                this.x = x || 0; 
                this.y = y || 0; 
                this.z = z || 0;
                this.isVector3 = true;
              };
              
              constants.Euler = function(x, y, z, order) {
                this.x = x || 0;
                this.y = y || 0;
                this.z = z || 0;
                this.order = order || 'XYZ';
                this.isEuler = true;
              };
              
              constants.Matrix4 = function() {
                this.elements = [
                  1, 0, 0, 0,
                  0, 1, 0, 0,
                  0, 0, 1, 0,
                  0, 0, 0, 1
                ];
                this.isMatrix4 = true;
              };
              
              constants.Color = function(r, g, b) {
                this.r = r || 0;
                this.g = g || 0;
                this.b = b || 0;
                this.isColor = true;
              };
              
              // Add the constants to window.THREE
              Object.assign(window.THREE, constants);
              console.log('THREE constants and stub classes pre-initialized in script tag');
            }
          `}
        </Script>
      </head>
      <body>
        {children}
        <ThreeVerification />
      </body>
    </html>
  );
}
