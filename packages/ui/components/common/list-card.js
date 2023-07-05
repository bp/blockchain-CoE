/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/list-card.module.scss';
import Button from './button';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/state.js';
import {
  EventStatus,
  API_URL,
  checkConversion,
  getContributionAdvice,
  applicationUrl,
  projectName
} from '../../lib/config';
import useRequest from '../../lib/use-request';
import { checkContributionLimit, _currencyFormatter } from '../../lib/helper';
import { getCopyToClipboardAlert } from '../../contexts/config';

const ListCard = ({
  data: { title, img, shortdesc, org, goal, id },
  showInput,
  contributions,
  hasBorder = false
}) => {
  const router = useRouter();
  const { doRequest } = useRequest();
  const {
    state: { basket, user, projects, canContribute, eventStatus, contribution, contract },
    dispatch
  } = useAppContext();
  const [value, setValue] = useState('');
  const [yourContribution, setYourContribution] = useState(0);
  const [userContribution, setUserContribution] = useState(0);
  const [totalContribution, setTotalContribution] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCopyLink, setShowCopyLink] = useState(false);

  const handleCardClick = () => router.push(`/projects/${id}`);

  const handleCardKeyDown = (e) => {
    e.stopPropagation();
    if (e.keyCode === 13) {
      router.push(`/projects/${id}`);
    }
  };

  useEffect(() => {
    if (projects.length) {
      const thisProject = projects.find((project) => project.id === id);
      if (thisProject) {
        setYourContribution(checkConversion(thisProject.yourContribution));
        setUserContribution(thisProject.userContribution);
        setTotalContribution(thisProject.totalContribution);
      }
    }
    return () => {
      setYourContribution(0);
      setUserContribution(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const handleClick = (e) => {
    e.stopPropagation();
    setShowTooltip(true);
  };

  const handleTooltip = (e, status) => {
    e.stopPropagation();
    setShowTooltip(status);
  };

  const handleAddToBasket = (e) => {
    e.stopPropagation();
    let donations = { ...basket, [id]: value };
    if (value) {
      if (checkContributionLimit(donations, dispatch)) {
        if (user && user._id && value !== basket[id]) {
          doRequest({
            url: `${API_URL}/basket`,
            method: `POST`,
            body: { ...basket, [id]: value }
          });
          
        }
        dispatch({ type: 'setBasket', payload: { ...basket, [id]: value } });
        setValue('');
      }
    }
  };

  const handleInputChange = (e) => {
    if (e.key === '.' || e.target.value > 9999) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    if (e.target.value) {
      setValue(parseInt(e.target.value, 10));
    } else {
      setValue('');
    }
  };

  const handleOnInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]*/g, '');
  };

  const getBtnStyle = () => {
    if (value > 0) {
      return 'btn-primary';
    } else return 'btn-tertiary';
  };

  const getBtnTitle = () => {
    if (basket[id] > 0) return 'Update amount';
    else return 'Add to basket';
  };

  const handleGoToBasket = (e) => {
    e.stopPropagation();
    router.push(`/basket`);
  };

  const handleRemoveFromBasket = (e) => {
    e.stopPropagation();
    if (user && user._id) {
      doRequest({
        url: `${API_URL}/basket`,
        method: `POST`,
        body: {
          ...basket,
          [id]: ''
        }
      });
    }
    dispatch({ type: 'setBasket', payload: { ...basket, [id]: '' } });
  };

  const shareToSocialMedia = (e, item) => {
    e.stopPropagation();
    if (item === 'fb') {
      let shareURL = `https://www.facebook.com/sharer/sharer.php?kid_directed_site=0&sdk=joey&u=${applicationUrl}&display=page&ref=plugin`;
      window.open(shareURL, '_blank');
    } else if (item === 'tw') {
      let shareURL = 'http://twitter.com/share?'; //url base
      var params = {
        url: applicationUrl,
        text: `I just donated to ${projectName}`,
        //via: "sometwitterusername",
        hashtags: `${projectName}`
      };
      for (var prop in params) shareURL += '&' + prop + '=' + encodeURIComponent(params[prop]);
      window.open(shareURL, '_blank');
    } else if (item === 'email') {
      window.open(
        `mailto:?subject=I wanted you to see this site&body=Check out this site ${applicationUrl}.`,
        '_blank'
      );
    } else if (item === 'link') {
      navigator.clipboard.writeText(`${applicationUrl}/projects/${id}`);
      setShowCopyLink(true);
      dispatch({ type: 'setAlert', payload: getCopyToClipboardAlert(dispatch) });
      setTimeout(() => {
        dispatch({ type: 'removeAlert', payload: { type: 'copyToClipboard' } });
      }, 2000);
    }
  };

  const borderClass = hasBorder ? styles.withBorder : '';
  const getIcon = (item) => {
    if (item === 'facebook') {
      return (
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 310">
          <path
            id="XMLID_835_"
            d="M81.703,165.106h33.981V305c0,2.762,2.238,5,5,5h57.616c2.762,0,5-2.238,5-5V165.765h39.064
		c2.54,0,4.677-1.906,4.967-4.429l5.933-51.502c0.163-1.417-0.286-2.836-1.234-3.899c-0.949-1.064-2.307-1.673-3.732-1.673h-44.996
		V71.978c0-9.732,5.24-14.667,15.576-14.667c1.473,0,29.42,0,29.42,0c2.762,0,5-2.239,5-5V5.037c0-2.762-2.238-5-5-5h-40.545
		C187.467,0.023,186.832,0,185.896,0c-7.035,0-31.488,1.381-50.804,19.151c-21.402,19.692-18.427,43.27-17.716,47.358v37.752H81.703
		c-2.762,0-5,2.238-5,5v50.844C76.703,162.867,78.941,165.106,81.703,165.106z"
          />
        </svg>
      );
    } else if (item === 'twitter') {
      return (
        <svg viewBox="328 355 335 276" xmlns="http://www.w3.org/2000/svg">
          <path
            d="
        M 630, 425
        A 195, 195 0 0 1 331, 600
        A 142, 142 0 0 0 428, 570
        A  70,  70 0 0 1 370, 523
        A  70,  70 0 0 0 401, 521
        A  70,  70 0 0 1 344, 455
        A  70,  70 0 0 0 372, 460
        A  70,  70 0 0 1 354, 370
        A 195, 195 0 0 0 495, 442
        A  67,  67 0 0 1 611, 380
        A 117, 117 0 0 0 654, 363
        A  65,  65 0 0 1 623, 401
        A 117, 117 0 0 0 662, 390
        A  65,  65 0 0 1 630, 425
        Z"
          />
        </svg>
      );
    } else if (item === 'email') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M12 12.713l-11.985-9.713h23.971l-11.986 9.713zm-5.425-1.822l-6.575-5.329v12.501l6.575-7.172zm10.85 0l6.575 7.172v-12.501l-6.575 5.329zm-1.557 1.261l-3.868 3.135-3.868-3.135-8.11 8.848h23.956l-8.11-8.848z" />
        </svg>
      );
    } else if (item === 'link') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M6.188 8.719c.439-.439.926-.801 1.444-1.087 2.887-1.591 6.589-.745 8.445 2.069l-2.246 2.245c-.644-1.469-2.243-2.305-3.834-1.949-.599.134-1.168.433-1.633.898l-4.304 4.306c-1.307 1.307-1.307 3.433 0 4.74 1.307 1.307 3.433 1.307 4.74 0l1.327-1.327c1.207.479 2.501.67 3.779.575l-2.929 2.929c-2.511 2.511-6.582 2.511-9.093 0s-2.511-6.582 0-9.093l4.304-4.306zm6.836-6.836l-2.929 2.929c1.277-.096 2.572.096 3.779.574l1.326-1.326c1.307-1.307 3.433-1.307 4.74 0 1.307 1.307 1.307 3.433 0 4.74l-4.305 4.305c-1.311 1.311-3.44 1.3-4.74 0-.303-.303-.564-.68-.727-1.051l-2.246 2.245c.236.358.481.667.796.982.812.812 1.846 1.417 3.036 1.704 1.542.371 3.194.166 4.613-.617.518-.286 1.005-.648 1.444-1.087l4.304-4.305c2.512-2.511 2.512-6.582.001-9.093-2.511-2.51-6.581-2.51-9.092 0z" />
        </svg>
      );
    } else if (item === 'success') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.959 17l-4.5-4.319 1.395-1.435 3.08 2.937 7.021-7.183 1.422 1.409-8.418 8.591z" />
        </svg>
      );
    }
  };

  const handleKeyDownOnSocialMedia = (e, item) => {
    if (e.keyCode === 13) {
      shareToSocialMedia(e, item);
    }
  };

  // setTimeout(() => {
  //   if(showCopyLink){
  //     setShowCopyLink(false);
  //   }
  // }, 3000);

  return (
    <div
      className={[styles.card, borderClass].join(' ')}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex="0">
      <div className={styles.image} style={{ backgroundImage: `url(/assets/images/${img})` }}>
        <div className={styles.header}>
          {eventStatus === EventStatus.DURING && yourContribution > 0 && (
            <div
              className={styles.shareContainer}
              role="button"
              tabIndex="0"
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}>
              <div onMouseEnter={() => setShowCopyLink(false)} className={styles.share}>
                Share
              </div>
              <ul role="menu">
                <li>
                  <div
                    role="button"
                    tabIndex="0"
                    onKeyDown={(e) => handleKeyDownOnSocialMedia(e, 'fb')}
                    onClick={(e) => shareToSocialMedia(e, 'fb')}
                    className={styles.icon}>
                    {getIcon('facebook')} Share on Facebook
                  </div>
                </li>
                <li>
                  <div
                    role="button"
                    tabIndex="0"
                    onKeyDown={(e) => handleKeyDownOnSocialMedia(e, 'tw')}
                    onClick={(e) => shareToSocialMedia(e, 'tw')}
                    className={styles.icon}>
                    {getIcon('twitter')}Share on Twitter
                  </div>
                </li>
                <li>
                  <div
                    role="button"
                    tabIndex="0"
                    onKeyDown={(e) => handleKeyDownOnSocialMedia(e, 'email')}
                    onClick={(e) => shareToSocialMedia(e, 'email')}
                    className={styles.icon}>
                    {getIcon('email')}Share on Email
                  </div>
                </li>
                <li>
                  <div
                    role="button"
                    tabIndex="0"
                    onKeyDown={(e) => handleKeyDownOnSocialMedia(e, 'link')}
                    onClick={(e) => shareToSocialMedia(e, 'link')}
                    className={styles.icon}>
                    {getIcon('link')}Public Link{' '}
                    {showCopyLink && <span className={styles.tick}>{getIcon('success')}</span>}
                  </div>
                </li>
              </ul>
            </div>
          )}
          {yourContribution > 0 && (
            <div className={[styles.userContribution, styles.bubble].join(' ')}>
              <div className={styles.title}>You Donated</div>
              <div className={styles.data}>{yourContribution} USDC</div>
            </div>
          )}
          {contribution.status === 'pending' && (
            <div className={[styles.userContribution, styles.bubble].join(' ')}>
              <div className={styles.title}>Your Donation is pending</div>
            </div>
          )}
          {canContribute && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {basket[id] > 0 && (
                <Button
                  tabIndex="0"
                  role="button"
                  className={['btn', 'btn-secondary', styles.btnBasket].join(' ')}
                  title={` ${basket[id]} USDC in basket`}
                  onClick={handleGoToBasket}
                />
              )}
              {basket[id] > 0 && showInput && (
                <Button
                  tabIndex="0"
                  role="button"
                  className={['btn', 'btn-secondary', styles.btnRemove].join(' ')}
                  title="Remove from basket"
                  onClick={handleRemoveFromBasket}
                />
              )}
            </div>
          )}
          {canContribute && showInput && (
            <div className={styles.inputWrapper}>
              <div
                className={[
                  styles.contributionAdvice,
                  `${showTooltip ? styles.show : styles.hide}`
                ].join(' ')}>
                <p>{getContributionAdvice}</p>
              </div>
              <div className={styles.form}>
                <input
                  type="number"
                  onInput={handleOnInput}
                  aria-label="Enter USDC donation amount"
                  aria-required="true"
                  placeholder="Enter USDC donation amount"
                  onClick={handleClick}
                  onFocus={(e) => handleTooltip(e, true)}
                  onBlur={(e) => handleTooltip(e, false)}
                  onChange={handleInputChange}
                  min="1"
                  max="9999"
                  value={value}
                />
                <Button
                  tabIndex="0"
                  role="button"
                  className={['btn', getBtnStyle()].join(' ')}
                  title={getBtnTitle()}
                  onKeyDown={handleClick}
                  onClick={handleAddToBasket}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.contents}>
        <div className={styles.cardContents}>
          <div className={styles.coreDetails}>
            <h3>{title}</h3>
            <p className={styles.truncate}>{shortdesc}</p>
            <h4>{org}</h4>
          </div>
          {eventStatus === EventStatus.POST && (
            <>
              <div className={styles.footer}>
                <div>
                  <span className={styles.text}>Goal</span>
                  <span className={styles.contribution}>
                    {_currencyFormatter(checkConversion(goal))} USDC
                  </span>
                </div>
              </div>
            </>
          )}
          <div className={styles.footer}>
            {eventStatus === EventStatus.PRE && (
              <div>
                <span className={styles.text}>Goal</span>
                <span className={styles.contribution}>
                  {_currencyFormatter(checkConversion(goal))} USDC
                </span>
              </div>
            )}
            {eventStatus === EventStatus.DURING && (
              <>
                {/* {yourContribution > 0 ? (
                  <div>
                    <span className={styles.text}>Raised</span>
                    <span className={styles.contribution} style={{ color: 'green' }}>
                      {checkConversion(userContribution)} USDC
                    </span>
                  </div>
                ) : ( */}
                <div>
                  <span className={styles.text}>Goal</span>
                  <span className={styles.contribution}>
                    {_currencyFormatter(checkConversion(goal))} USDC
                  </span>
                </div>
                {/* )} */}
                {/* <div>
                  <span className={styles.text}>Donators</span>
                  <span className={styles.contribution}>{contributions}</span>
                </div> */}
              </>
            )}
            {eventStatus === EventStatus.POST && (
              <>
                <div>
                  <span className={styles.text}>Raised</span>
                  <span className={styles.contribution} style={{ color: '#00a70a' }}>
                    {contract.distributionStatus || contract.c
                      ? _currencyFormatter(checkConversion(totalContribution).toFixed())
                      : _currencyFormatter(checkConversion(userContribution).toFixed())}{' '}
                    USDC
                  </span>
                </div>
                <div>
                  <span className={styles.text}>Donators</span>
                  <span className={styles.contribution}>{contributions}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ListCard.propTypes = {
  data: PropTypes.object,
  showInput: PropTypes.bool,
  hasBorder: PropTypes.bool,
  contributions: PropTypes.number
};

export default ListCard;
