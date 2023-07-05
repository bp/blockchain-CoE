/* eslint-disable react/prop-types */
import '../styles/globals.scss';
import '../styles/responsive.scss';
import AppLayout from '../layouts/applayout';
import { AppWrapper } from '../contexts/state';

function MyApp({ Component, pageProps }) {
  return (
    <AppWrapper>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </AppWrapper>
  );
}

export default MyApp;
