import "@/styles/globals.css";
import Head from 'next/head';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Forums CEC</title>
        <meta key="X-Powered-By" name="X-Powered-By" content={null} />
      </Head>
      <Layout >
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
