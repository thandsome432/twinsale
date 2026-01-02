// pages/_app.js
import '../styles/globals.css'; // This loads Tailwind

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}