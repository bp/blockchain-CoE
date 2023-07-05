import { getMaximumContributionError } from '../contexts/config';

export const _keyBy = (objectArr, key) => {
  var respObj = {};
  objectArr.forEach((item) => {
    respObj[item[key]] = item;
  });
  return respObj;
};

export const _currencyFormatter = (amount) =>
  amount ? amount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : 0;

export const verifyMetamaskSelectedAccount = async (singedInAddress) => {
  if (window.ethereum) {
    return window.ethereum.selectedAddress === singedInAddress;
  }
  return null;
};

export const _setCookie = (cname, cvalue, exdays) => {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
};

export const _getCookie = (cname) => {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

export const getSectionStyle = (alerts, cookieConsent) => {
  if (alerts?.length > 0) {
    return cookieConsent ? 'mt-6' : '';
  } else {
    return cookieConsent ? 'pt-20' : 'pt-10';
  }
};

export const checkContributionLimit = (basket, dispatch) => {
  let donations = Object.values(basket);
  const totalAmount = donations.reduce((total, current) => total + Number(current), 0);
  if (totalAmount > 9999) {
    dispatch({ type: 'setAlert', payload: getMaximumContributionError(dispatch) });
    return false;
  } else {
    dispatch({ type: 'removeAlert', payload: { type: 'contributionLimit' } });
    return true;
  }
};
