import React, { createContext, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { API_URL, EventStatus } from '../lib/config';
import useRequest from '../lib/use-request';
import { useUser, useContribution, useSession, useContract } from '../lib/hooks';
import { getKycAlert, getContributionAlert, getUSDCBalanceAlert } from './config';

const AppContext = createContext();

const initialState = {
  user: {},
  basket: { 1: '', 2: '', 3: '', 4: '', 5: '' },
  hasBasketFetched: false,
  contract: {},
  projects: [],
  eventStatus: null,
  canContribute: false,
  usdcBalanceLoading: false,
  contribution: {},
  alerts: [],
  cookieConsent: false,
  contributionCount: [
    { _id: '1', projectId: '1', count: 0 },
    { _id: '2', projectId: '2', count: 0 },
    { _id: '3', projectId: '3', count: 0 },
    { _id: '4', projectId: '4', count: 0 },
    { _id: '5', projectId: '5', count: 0 }
  ],
  totalContributionCount: 0,
  showLogin: false
};

const AppWrapper = ({ children }) => {
  function reducer(state, action) {
    switch (action.type) {
      case 'setUser':
        return {
          ...state,
          user: action.payload
        };
      case 'setBasket':
        return {
          ...state,
          basket: action.payload
        };
      case 'sethasBasketFetched':
        return {
          ...state,
          hasBasketFetched: action.payload
        };
      case 'setContract':
        return {
          ...state,
          contract: action.payload
        };
      case 'setProjects':
        return {
          ...state,
          projects: action.payload
        };
      case 'setEventStatus':
        return {
          ...state,
          eventStatus: action.payload
        };
      case 'setCanContribute':
        return {
          ...state,
          canContribute: action.payload
        };
      case 'setAlert':
        return {
          ...state,
          alerts: [
            ...state.alerts.filter((alert) => alert.type !== action.payload.type),
            action.payload
          ]
        };
      case 'removeAlert':
        return {
          ...state,
          alerts: state.alerts.filter((alert) => alert.type !== action.payload.type)
        };
      case 'removeAlerts':
        return {
          ...state,
          alerts: []
        };
      case 'setUsdcBalanceLoading':
        return {
          ...state,
          usdcBalanceLoading: action.payload
        };
      case 'setSessionExpired':
        return {
          ...state,
          sessionExpired: action.payload
        };
      case 'setContribution':
        return {
          ...state,
          contribution: action.payload
        };
      case 'reset':
        return {
          ...state,
          user: {},
          alerts: [],
          contribution: {}
        };
      case 'setCookieConsent':
        return {
          ...state,
          cookieConsent: action.payload
        };
      case 'setContributionCount':
        return {
          ...state,
          contributionCount: action.payload
        };
      case 'setTotalContributionCount':
        return {
          ...state,
          totalContributionCount: action.payload
        };
      case 'setShowLogin':
        return {
          ...state,
          showLogin: action.payload
        };
      default:
        throw new Error();
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  const [countdown, setCountdown] = React.useState(0);
  const [documentVisibility, setDocumentVisibility] = React.useState(true);
  const { doRequest } = useRequest();
  const { user: latestUserData } = useUser(state.user);
  useSession(state.user, dispatch);
  const { contract: latestContractData, mutate: mutateContract } = useContract();

  const { contribution: latestContributionData } = useContribution(state, dispatch);
  const [modeOfPayment, setModeOfPayment] = React.useState('bpRelay');

  const [timerDetails, setTimerDetails] = React.useState({
    days: '--',
    hours: '--',
    minutes: '--',
    seconds: '--'
  });

  useEffect(() => {
    if (latestUserData) {
      if (Object.values(state.user).toString() !== Object.values(latestUserData).toString()) {
        dispatch({ type: 'setUser', payload: latestUserData });
      }
    }
  }, [latestUserData, state.user]);

  useEffect(() => {
    if (latestContributionData && state.contribution.status) {
      if (latestContributionData.status !== state.contribution.status) {
        dispatch({ type: 'setContribution', payload: latestContributionData });
        fetchContribution();
        fetchProjects();
      }
    }
    // eslint-disable-next-line
  }, [latestContributionData, state.contribution]);

  useEffect(() => {
    const status =
      state.eventStatus === EventStatus.DURING &&
      !state.contribution.status &&
      !state.contract.c &&
      !state.contract.hasReachedMaximumLimit &&
      state.user.role !== 'admin';
    dispatch({ type: 'setCanContribute', payload: status });
  }, [state.eventStatus, state.contribution, state.contract, state.user]);

  useEffect(() => {
    if (Object.values(state.contract).toString() !== Object.values(latestContractData).toString()) {
      dispatch({ type: 'setContract', payload: latestContractData });
    }
  }, [latestContractData, state.contract]);

  useEffect(() => {
    let contributions;
    contributions = async function () {
      const res = await axios({
        method: 'GET',
        url: `${API_URL}/contribution/succeeded`
      });
      if (res?.data) {
        const userContribution = res.data;
        dispatch({ type: 'setContributionCount', payload: userContribution.count });
        dispatch({ type: 'setTotalContributionCount', payload: userContribution.totalCount });
      }
    };
    if (state.eventStatus === EventStatus.DURING || state.eventStatus === EventStatus.POST) {
      contributions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestContributionData, state.contribution, state.user, state.eventStatus]);

  async function fetchProjects() {
    try {
      const res = await axios({
        url: `${API_URL}/projects`,
        method: 'get',
        withCredentials: true
      });
      if (res?.data?.projects) {
        const projects = res.data.projects;
        if (projects.length) {
          dispatch({ type: 'setProjects', payload: projects });
        }
      }
      // eslint-disable-next-line  no-empty
    } catch {}
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios({
          url: `${API_URL}/user`,
          method: 'GET',
          withCredentials: true
        });
        if (res?.data?.user) {
          dispatch({ type: 'setUser', payload: res.data.user });
        }
        // eslint-disable-next-line  no-empty
      } catch {}
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchBasket() {
      const res = await doRequest({
        url: `${API_URL}/basket`,
        method: 'GET'
      });
      if (res?.data?.basket) {
        dispatch({ type: 'sethasBasketFetched', payload: true });
        dispatch({ type: 'setBasket', payload: res.data.basket });
      }
    }

    async function storeBasket() {
      await doRequest({
        url: `${API_URL}/basket`,
        method: `POST`,
        body: {
          ...state.basket
        }
      });
    }

    if (state.user._id) {
      let isBasketEmpty = true;
      for (let i in state.basket) {
        if (state.basket[i] !== '') {
          isBasketEmpty = false;
          break;
        }
      }
      if (isBasketEmpty) {
        fetchBasket();
      } else {
        storeBasket();
      }
    }

    if (state.user.kyc && state.eventStatus === EventStatus.DURING && state.user.role !== 'admin') {
      if (state.user.kyc === 'A') {
        if (!state.user.kycCompleteRead) {
          dispatch({
            type: 'setAlert',
            payload: getKycAlert(state.user.kyc, dispatch, markKycRead)
          });
        }
      } else if (
        state.user.kyc === 'D' ||
        state.user.kyc === 'R'
        // state.user.kyc === 'Not Started'
      ) {
        dispatch({ type: 'setAlert', payload: getKycAlert(state.user.kyc, dispatch) });
      }
    }
    if (state.user._id) {
      dispatch({ type: 'removeAlert', payload: { type: 'session' } });
      dispatch({ type: 'removeAlert', payload: { type: 'blockchainNetwork' } });
      if (state.eventStatus === EventStatus.DURING || state.eventStatus === EventStatus.POST) {
        fetchContribution();
      }
    }
    fetchProjects();
    // eslint-disable-next-line
  }, [state.user, state.eventStatus]);

  useEffect(() => {
    if (state.contribution.relayTransactionHash) {
      dispatch({ type: 'setBasket', payload: { 1: '', 2: '', 3: '', 4: '', 5: '' } });
    }
    if (state.contribution.status === 'draft') {
      setModeOfPayment('userPay');
    }
  }, [state.contribution]);

  useEffect(() => {
    let intervalID;
    let timeInSecs = countdown;
    if (state.eventStatus != EventStatus.POST) {
      intervalID = setInterval(() => {
        if (timeInSecs === 0) {
          if (state.eventStatus === EventStatus.PRE) {
            if (state.contract.startDate && state.contract.endDate) {
              const { startDate, endDate } = state.contract;
              const diffInSeconds = endDate - startDate;
              setCountdown(diffInSeconds);
              dispatch({ type: 'setEventStatus', payload: EventStatus.DURING });
            }
          } else if (state.eventStatus === EventStatus.DURING) {
            clearInterval(intervalID);
            dispatch({ type: 'setEventStatus', payload: EventStatus.POST });
          }
        } else {
          var days = Math.floor(timeInSecs / 60 / 60 / 24);
          var hours = Math.floor((timeInSecs / 60 / 60) % 24);
          var minutes = Math.floor((timeInSecs / 60) % 60);
          var seconds = Math.floor(timeInSecs % 60);
          setTimerDetails({
            days: ('0' + days).slice(-2),
            hours: ('0' + hours).slice(-2),
            minutes: ('0' + minutes).slice(-2),
            seconds: ('0' + seconds).slice(-2)
          });
          timeInSecs -= 1;
        }
      }, 1000);
    }
    return () => {
      clearInterval(intervalID);
    };
  }, [state.eventStatus, countdown, state.contract]);

  const handleActivityTrue = () => {
    setDocumentVisibility(true);
  };

  const handleActivityFalse = () => {
    setDocumentVisibility(false);
  };

  useEffect(() => {
    window.addEventListener('blur', handleActivityFalse);
    window.addEventListener('focus', handleActivityTrue);
    return () => {
      window.removeEventListener('focus', handleActivityTrue);
      document.removeEventListener('blur', handleActivityFalse);
    };
  }, []);

  useEffect(() => {
    if (state.contract.startDate && state.contract.endDate) {
      const { startDate, endDate } = state.contract;
      let diffInSeconds = 0;
      const currentTime = Math.floor(Date.now() / 1000);
      if (startDate > currentTime) {
        diffInSeconds = startDate - currentTime;
        dispatch({ type: 'setEventStatus', payload: EventStatus.PRE });
      } else if (endDate > currentTime) {
        diffInSeconds = endDate - currentTime;
        dispatch({ type: 'setEventStatus', payload: EventStatus.DURING });
      } else {
        diffInSeconds = 0;
        dispatch({ type: 'setEventStatus', payload: EventStatus.POST });
      }
      setCountdown(diffInSeconds);
    }
  }, [state.contract, documentVisibility]);

  async function markKycRead() {
    doRequest({
      url: `${API_URL}/user/mark-kyc-read`,
      method: 'PATCH',
      body: {}
    });
  }

  async function fetchContribution() {
    try {
      const res = await axios({
        url: `${API_URL}/contribution`,
        method: 'GET',
        withCredentials: true
      });
      if (res?.data?.contribution) {
        const contribution = res?.data?.contribution;
        if (contribution) {
          // const { relayTransactionHash, status } = contribution;
          dispatch({ type: 'setContribution', payload: contribution });
          // We dont want to show draft alert after voting end
          if (contribution?.status === 'draft' && state.eventStatus === EventStatus.POST) {
            dispatch({ type: 'removeAlert', payload: { type: 'contribution' } });
          } else {
            dispatch({ type: 'setAlert', payload: getContributionAlert(contribution, dispatch) });
          }
        }
      }
      // eslint-disable-next-line  no-empty
    } catch (err) {}
  }

  async function checkHaveEnoughUSDC(totalAmount) {
    try {
      dispatch({ type: 'setUsdcBalanceLoading', payload: true });
      const res = await axios({
        url: `${API_URL}/contract/usdcBalance?address=${state.user.address}`,
        method: 'GET',
        withCredentials: true
      });
      if (res?.data?.balance) {
        const balance = res.data.balance;
        if (balance < totalAmount) {
          dispatch({ type: 'setAlert', payload: getUSDCBalanceAlert(dispatch) });
          dispatch({ type: 'setUsdcBalanceLoading', payload: false });
          return false;
        } else {
          dispatch({ type: 'removeAlert', payload: { type: 'usdcBalance' } });
          dispatch({ type: 'setUsdcBalanceLoading', payload: false });
          return true;
        }
      }
    } catch {
      dispatch({ type: 'setUsdcBalanceLoading', payload: false });
      return false;
    }
  }

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        timerDetails,
        fetchProjects,
        mutateContract,
        fetchContribution,
        checkHaveEnoughUSDC,
        modeOfPayment,
        setModeOfPayment
      }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext);

AppWrapper.propTypes = {
  children: PropTypes.node.isRequired
};

export { useAppContext, AppWrapper };
