import React from 'react';
import styles from '../../styles/signup.module.scss';
import { API_URL, projectName } from '../../lib/config';
import Button from './button';
import useRequest from '../../lib/use-request';
import { useAppContext } from '../../contexts/state.js';
import { getCustomError, getApiSuccessResponse } from '../../contexts/config';

const SignUp = () => {
  const { doRequest, loading } = useRequest();
  const [email, setEmail] = React.useState('');
  const { dispatch } = useAppContext();

  const validateEmail = (email) => {
    const regex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase());
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const getNotified = async () => {
    if (email) {
      if (validateEmail(email)) {
        const res = await doRequest({
          url: `${API_URL}/notification`,
          method: `POST`,
          body: { email }
        });
        if (res) {
          setEmail('');
          dispatch({
            type: 'setAlert',
            payload: getApiSuccessResponse(
              'Thanks for subscribing, you will be notified on the future updates',
              dispatch
            )
          });
        }
      } else {
        dispatch({
          type: 'setAlert',
          payload: getCustomError('Wrong email id', 'Please enter a valid email address', dispatch)
        });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      getNotified();
    }
  };

  return (
    <section className={styles.signup}>
      <div className={['container', styles.content].join(' ')}>
        <div className={styles.text}>Sign up to get updates on {projectName}</div>
        <div className={styles.form}>
          <input
            type="text"
            aria-label="Enter your email address"
            aria-required="true"
            placeholder="Enter your email address"
            name="email"
            value={email}
            onChange={handleChange}
          />
          <Button
            className={['btn', email ? 'btn-primary' : 'btn-tertiary'].join(' ')}
            onClick={getNotified}
            onKeyDown={handleKeyDown}
            title={'Get notified'}
            disabled={loading}
            loading={loading}
          />
        </div>
      </div>
    </section>
  );
};

export default SignUp;
