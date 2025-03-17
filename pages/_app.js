import "@/styles/globals.css";
import '../styles/globals.css';  // นำเข้าฟายล์ global CSS ที่นี่

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
