import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/router';
import { API_URL, EventStatus, sessionRefreshTime, verifyContributionInterval } from './config';
import { getSessionExpiryAlert } from '../contexts/config';

const fetcher = (url) =>
  axios({
    url: url,
    method: 'get',
    withCredentials: true
  })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));

export const useSession = (userData, dispatch) => {
  const router = useRouter();
  useSWR(userData && userData._id ? `${API_URL}/user/session` : null, fetcher, {
    refreshInterval: sessionRefreshTime,
    refreshWhenHidden: false,
    onError: (error) => {
      if (error?.response?.status === 401) {
        dispatch({ type: 'reset' });
        dispatch({ type: 'setAlert', payload: getSessionExpiryAlert(dispatch) });
        // redirect to landing page, if session gets expired on admin page
        if (window.location.pathname === '/admin') {
          router.push('/');
        }
      }
    }
  });
};

export const useUser = (userData) => {
  const { data, error, mutate } = useSWR(
    userData && userData._id ? `${API_URL}/user/` : null,
    fetcher
  );
  const user = data?.user;
  if (error) return { errors: null, user: null };
  if (!user) return { errors: null, user: null };
  return { errors: null, user, mutate };
};

export const useContribution = ({ contribution: contributionData, eventStatus }, dispatch) => {
  const { data, error, mutate } = useSWR(
    contributionData &&
      eventStatus === EventStatus.DURING &&
      (contributionData.status === 'draft' || contributionData.status === 'pending')
      ? `${API_URL}/contribution/`
      : null,
    fetcher,
    {
      refreshInterval: verifyContributionInterval,
      refreshWhenHidden: false,
      onError: (error) => {
        if (error?.response?.status === 401) {
          dispatch({ type: 'reset' });
          dispatch({ type: 'setAlert', payload: getSessionExpiryAlert(dispatch) });
        }
      }
    }
  );
  const contribution = data?.contribution;
  if (error) return { errors: null, user: null };
  if (!contribution) return { errors: null, contribution: null };
  return { errors: null, contribution, mutate };
};

export const useContract = () => {
  const { data, error, mutate } = useSWR(`${API_URL}/contract`, fetcher);
  const contract = data?.contract;
  if (error) return { errors: null, contract: {} };
  if (!contract) return { errors: null, contract: {} };
  return { errors: null, contract, mutate };
};
