import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/card.module.scss';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/state.js';
import Button from './button';
import { EventStatus, API_URL, checkConversion, getContributionAdvice } from '../../lib/config';
import useRequest from '../../lib/use-request';
import { checkContributionLimit, _currencyFormatter } from '../../lib/helper';

const Card = ({ data: { title, img, shortdesc, org, goal, id } }) => {
  const router = useRouter();
  const { doRequest } = useRequest();
  const {
    state: { basket, user, projects, canContribute, eventStatus, contract },
    dispatch
  } = useAppContext();
  const [value, setValue] = useState('');
  const [yourContribution, setYourContribution] = useState(0);
  const [userContribution, setUserContribution] = useState(0);
  const [totalContribution, setTotalContribution] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const handleClick = (e) => {
    e.stopPropagation();
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
    if (e.key === '.') {
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

  const handleTooltip = (e, status) => {
    e.stopPropagation();
    setShowTooltip(status);
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

  return (
    <>
      <div
        className={styles.card}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex="0">
        <div
          className={styles.header}
          style={{
            backgroundImage: `url(/assets/images/${img})`,
            backgroundSize: 'cover',
            height: '24rem',
            justifyContent: 'space-between',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem'
          }}>
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
              {basket[id] > 0 && (
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
          {canContribute && (
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
                  onChange={handleInputChange}
                  onFocus={(e) => handleTooltip(e, true)}
                  onBlur={(e) => handleTooltip(e, false)}
                  min="1"
                  max="9999"
                  value={value}
                />
                <Button
                  tabIndex="0"
                  role="button"
                  className={['btn', getBtnStyle(), styles.updateBtn].join(' ')}
                  title={getBtnTitle()}
                  onKeyDown={handleClick}
                  onClick={handleAddToBasket}
                />
              </div>
            </div>
          )}
        </div>
        <div className={styles.content}>
          <h3 className={styles.truncateTitle} title={title}>
            {title}
          </h3>
          <p className={styles.truncate}>{shortdesc}</p>
          <h4>{org}</h4>
        </div>
        <div className={styles.footer}>
          <>
            {eventStatus === EventStatus.PRE && (
              <div>
                <span className={styles.text}>Goal</span>
                <span className={styles.contribution}>
                  {_currencyFormatter(checkConversion(goal))} USDC
                </span>
              </div>
            )}
            {eventStatus === EventStatus.DURING && (
              <div style={{ display: 'flex' }}>
                <div>
                  <span className={styles.text}>Goal</span>
                  <span className={styles.contribution}>
                    {_currencyFormatter(checkConversion(goal))} USDC
                  </span>
                </div>
                {yourContribution > 0 ? (
                  <div>
                    <span className={styles.text}>You Donated</span>
                    <span className={styles.contribution}>{yourContribution} USDC</span>
                  </div>
                ) : (
                  ''
                )}
              </div>
            )}
            {eventStatus === EventStatus.POST && (
              <div style={{ display: 'flex' }}>
                <div>
                  <span className={styles.text}>Raised</span>
                  <span className={styles.contribution}>
                    {contract.distributionStatus || contract.c
                      ? _currencyFormatter(checkConversion(totalContribution).toFixed())
                      : _currencyFormatter(checkConversion(userContribution).toFixed())}{' '}
                    USDC
                  </span>
                </div>
                {yourContribution > 0 ? (
                  <div>
                    <span className={styles.text}>You Donated</span>
                    <span className={styles.contribution}>{yourContribution} USDC</span>
                  </div>
                ) : (
                  ''
                )}
              </div>
            )}
          </>
        </div>
      </div>
    </>
  );
};

Card.propTypes = {
  data: PropTypes.object,
  isBasket: PropTypes.bool
};

export default Card;
