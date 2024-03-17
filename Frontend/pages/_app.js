import "@/styles/globals.css";
import Head from 'next/head';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Forums CEC</title>
      </Head>
      <Layout >
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
