import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import Header from '../components/common/header';
import Footer from '../components/common/footer';
import Alert from '../components/common/alert';
import CookieConsent from '../components/common/cookieConsent';
import { _getCookie } from '../lib/helper';
import { useAppContext } from '../contexts/state';
import Login from '../components/common/login';
import { projectName, applicationUrl } from '../lib/config';
export default function AppLayout({ children }) {
  const {
    state: { cookieConsent, alerts, showLogin },
    dispatch
  } = useAppContext();
  const headerDummyRef = useRef(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const ApplyStyle = () => {
    const element = headerDummyRef.current;
    if (element) {
      var position = element.getBoundingClientRect();
      if (position.top >= 0 && position.bottom <= window.innerHeight) {
        setIsNavVisible(true);
      } else if (position.top < window.innerHeight && position.bottom >= 0) {
        setIsNavVisible(true);
      } else {
        setIsNavVisible(false);
      }
    }
  };
  useEffect(() => {
    dispatch({ type: 'setCookieConsent', payload: !_getCookie('cookie_consent') });
    window.addEventListener('scroll', ApplyStyle);
    return function cleanup() {
      window.removeEventListener('scroll', ApplyStyle);
    };
    // eslint-disable-next-line
  }, []);

  const getHeaderStyle = () => {
    if (cookieConsent) {
      return alerts.length > 0 ? 'mt-6' : 'mt-10';
    } else {
      return '';
    }
  };

  return (
    <>
      <Head>
        <title>{projectName}</title>
        <meta
          name="description"
          content={`The ${projectName} is an open-source, not-for-profit decentralized application on the Ethereum blockchain for donating to research and impact “public goods” projects, which can accelerate the world’s transition to Net Zero carbon.`}
        />
        <meta
          name="keywords"
          content="climate change, climate action, public goods, quadratic funding, blockchain, decentralized application, dapp, Ethereum, zero knowledge proof, zkp, decentralized autonomous organization, dao"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:url" content={applicationUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={projectName} />
        <meta
          property="og:description"
          content={`The ${projectName} is an open-source, not-for-profit decentralized application on the Ethereum blockchain for donating to research and impact “public goods” projects, which can accelerate the world’s transition to Net Zero carbon.`}
        />
        <meta property="og:image" content={`${applicationUrl}/assets/images/projects-post.png`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "as8xqsnq6g");
        `
          }}></script>
      </Head>
      {cookieConsent && <CookieConsent />}
      <Header className={getHeaderStyle()} />
      <div ref={headerDummyRef}></div>

      <main
        style={{
          top: isNavVisible && alerts.length > 0 ? '13rem' : '0',
          transition: 'top .2s ease 0s',
          position: 'relative'
          // paddingTop: isNavVisible && alerts.length > 0 ? '0' : '10rem'
        }}>
        <Alert />
        {children}
        {showLogin && (
          <Login
            handleClose={() => dispatch({ type: 'setShowLogin', payload: false })}
            onKeyPress={() => dispatch({ type: 'setShowLogin', payload: false })}
          />
        )}
      </main>
      <Footer />
    </>
  );
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired
};
