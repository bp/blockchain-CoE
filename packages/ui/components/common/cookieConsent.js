import Link from 'next/link';
import styles from '../../styles/cookieconsent.module.scss';
import Button from './button';
import { _setCookie } from '../../lib/helper';
import { useAppContext } from '../../contexts/state';

const CookieConsent = () => {
  const { dispatch } = useAppContext();

  const handleAcceptCookie = () => {
    _setCookie('cookie_consent', true, 180);
    dispatch({ type: 'setCookieConsent', payload: false });
  };
  return (
    <div className={styles.cookieConsent}>
      <div className={['container', styles.cookieContent].join(' ')}>
        <div className={styles.content}>
          We use Cookies according to our{' '}
          <Link href="/privacypolicy">
            <a>Privacy policy</a>
          </Link>{' '}
          to help us improve the site by using some of your browsing data. Do you agree to help us
          improve the site by collecting your browsing data?
        </div>
        <Button
          tabIndex="0"
          role="button"
          className={['btn', 'btn-secondary'].join(' ')}
          title="Agree"
          onClick={handleAcceptCookie}
        />
      </div>
    </div>
  );
};

export default CookieConsent;
