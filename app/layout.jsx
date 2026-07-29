import './globals.css';
import { Urbanist } from 'next/font/google';
import { site } from '@/lib/content';
import { SCENE_OBJECTS } from '@/lib/models';

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500'],
  variable: '--font-urbanist',
  display: 'swap',
});

export const metadata = {
  title: site.title,
  description: site.description,
};

export const viewport = {
  themeColor: '#0c1117',
};

/* Start the model downloads from the HTML itself. Without these the browser
   can't discover them until the JS bundle has loaded, React has hydrated and
   the Scene chunk has been dynamically imported — measured at ~730 ms of dead
   air before the first byte of geometry was even requested. `low` priority
   keeps them from competing with the CSS/JS needed to paint the page. */
const MODEL_PRELOADS = SCENE_OBJECTS.filter((o) => !o.procedural).map(
  (o) => `/models/${o.file}.glb`
);

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={urbanist.variable}>
      <head>
        {MODEL_PRELOADS.map((href) => (
          /* crossOrigin is required, not optional: three's FileLoader issues
             its request with credentials: 'same-origin', and a bare
             as="fetch" preload uses 'include'. The mismatch makes the browser
             discard the preload and fetch every model a second time. */
          <link
            key={href}
            rel="preload"
            as="fetch"
            href={href}
            crossOrigin="anonymous"
            fetchPriority="low"
          />
        ))}
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
