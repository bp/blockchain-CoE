import PropTypes from 'prop-types';
import styles from '../../styles/login.module.scss';
import Button from './button';
import { API_URL, getSigningMessage, projectName } from '../../lib/config';
import { useAppContext } from '../../contexts/state.js';
import useRequest from '../../lib/use-request';
import Metamask from '../../lib/Metamask';
import { getNetworkNotSupportedAlert } from '../../contexts/config';

const Login = ({ handleClose }) => {
  const { dispatch } = useAppContext();

  const { doRequest: doGetUserRequest, loading: getUserLoading } = useRequest();
  const { doRequest: doPostUserRequest, loading: postUserLoading } = useRequest();
  const { doRequest: doLoginRequest, loading: loginLoading } = useRequest();

  const handleModalClose = () => {
    handleClose(false);
  };

  const handleKeyPress = () => {
    handleClose(false);
  };

  const handleLogin = async () => {
    try {
      // remove network alert if already present
      dispatch({ type: 'removeAlert', payload: { type: 'networkError' } });
      const metamask = new Metamask();
      const signerAddress = await metamask.createCustomConnection();
      let nonce;
      //api call to get the nonce value for the user
      const res = await doGetUserRequest({
        url: `${API_URL}/user/address?address=${signerAddress}`,
        method: 'GET'
      });
      if (res?.data?.user === null) {
        //if user is not present creates a new user
        const newResp = await doPostUserRequest({
          url: `${API_URL}/user`,
          method: `POST`,
          body: {
            address: signerAddress
          }
        });
        nonce = newResp?.data?.user?.nonce;
      } else {
        nonce = res?.data?.user?.nonce;
      }
      const signingMessage = await getSigningMessage(nonce, signerAddress);
      let signature = await metamask.signMessage(signingMessage);
      if (signature) {
        const res = await doLoginRequest({
          url: `${API_URL}/login`,
          method: `POST`,
          body: {
            address: signerAddress,
            signature
          }
        });
        if (res?.data?.user) {
          dispatch({ type: 'setSessionExpired', payload: false });
          dispatch({ type: 'setUser', payload: res.data.user });
          handleModalClose();
        } else {
          console.log(`failure`);
        }
      }
    } catch (err) {
      if (err.message === 'Network not supported') {
        dispatch({ type: 'setAlert', payload: getNetworkNotSupportedAlert(dispatch) });
        handleModalClose();
      }
    }
  };

  return (
    <div
      role="dialog"
      id="dialog"
      aria-labelledby="dialog_label"
      aria-modal="true"
      className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.wallets}>
          <div className={styles.header}>
            <div className={styles.head}>Connect your wallet</div>
            <div
              className={styles.icon}
              onClick={handleModalClose}
              onKeyPress={handleKeyPress}
              role="button"
              tabIndex="0">
              &times;
            </div>
          </div>
          <article>
            To donate to {projectName} projects, please connect your MetaMask wallet.
          </article>
          <figure>
            <img src="/assets/images/metamask_right.png" alt="metamask" />
          </figure>
          <div className={styles.btn}>
            <Button
              tabIndex="0"
              role="button"
              className={['btn', 'btn-primary', styles.signInBtn].join(' ')}
              title="Sign in"
              onClick={handleLogin}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
              loading={loginLoading || postUserLoading || getUserLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  handleClose: PropTypes.func
};

export default Login;
