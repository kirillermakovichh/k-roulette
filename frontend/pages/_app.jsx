import { SignerProvider } from "@/state/signer";
import Layout from "@/components/Layout";
import "@/styles/globals.css";

const MyApp = ({ Component, pageProps }) => {
  return (
    <SignerProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SignerProvider>
  );
};

export default MyApp;
