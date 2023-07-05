import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Button from './button';
import { useAppContext } from '../../contexts/state.js';
import { API_URL, EventStatus, blogUrl, projectName } from '../../lib/config';
import PropTypes from 'prop-types';

export default function Header(props) {
  const { className } = props;
  const menuRef = React.useRef(null);
  const iconRef = React.useRef(null);
  const router = useRouter();
  const [basketCount, setBasketCount] = useState(0);
  const [menu, setMenu] = useState([]);

  const {
    state: { user, basket, eventStatus, contribution },
    dispatch
  } = useAppContext();

  useEffect(() => {
    const menus = [
      { title: 'Projects', path: '/projects' },
      { title: 'About', path: '/about' },
      { title: 'Whitepaper', path: '/assets/documents/whitepaper.pdf' },
      { title: 'Litepaper', path: '/assets/documents/whitepaper.pdf' },
      { title: 'FAQ', path: '/faq' },
      { title: 'Blog', path: blogUrl },
      { title: 'Contact Us', path: '/enquiry' }
    ];
    if (eventStatus === EventStatus.DURING) {
      //Do not show basket if there is a contribution instance in db
      if (contribution.status) {
        setMenu([...menus]);
      } else {
        setMenu([...menus, { title: 'Basket', path: '/basket' }]);
      }
    } else if (eventStatus === EventStatus.PRE) {
      setMenu([...menus]);
    } else if (eventStatus === EventStatus.POST) {
      setMenu([...menus]);
    }
    // eslint-disable-next-line
  }, [eventStatus, contribution]);

  const handleResponsiveMenu = () => {
    if (menuRef.current.className === 'topnav') {
      menuRef.current.className = 'topnav responsive';
      iconRef.current.className = 'handburger change';
    } else {
      menuRef.current.className = 'topnav';
      iconRef.current.className = 'handburger';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleResponsiveMenu();
    }
  };

  const handleClickOpen = () => {
    dispatch({ type: 'setShowLogin', payload: true });
  };

  const handleClickWallet = (e) => {
    if (e.key === 'Enter') {
      location.href = `${API_URL}/logout`;
    }
  };

  const handleLogout = () => {
    location.href = `${API_URL}/logout`;
  };

  useEffect(() => {
    const count = Object.values(basket).filter((item) => item !== '').length;
    setBasketCount(count);
  }, [basket]);

  return (
    <header className={`${className} pt-2 pb-2`}>
      <div className="container">
        <nav role="navigation" className="navbar">
          <div className="navbar-container">
            <Link href="/">
              <a className="siteTitle">{projectName}</a>
            </Link>
            <div className="menuContainer">
              <div className="topnav" ref={menuRef}>
                {menu.map((each, index) => (
                  <Link href={each.path} key={`id-${index}`}>
                    <a
                      className={router.asPath.indexOf(each.path) > -1 ? 'active' : null}
                      target={
                        each.title === 'Blog' ||
                        each.title === 'Whitepaper' ||
                        each.title === 'Litepaper'
                          ? '_blank'
                          : '_self'
                      }
                      id="menuLink">
                      {each.title}
                      {basketCount > 0 && each.title === 'Basket' && (
                        <span className="cart">{basketCount}</span>
                      )}
                    </a>
                  </Link>
                ))}
              </div>
              {(eventStatus === EventStatus.DURING || eventStatus === EventStatus.POST) && (
                <div className="connect-wallet">
                  {user?.address ? (
                    <div tabIndex="0" role="button" className="wallet-btn">
                      <img className="icon" src="/assets/images/login.png" alt="login" />
                      <div className="wallet-address" title={user.address}>
                        {user.address}
                      </div>
                      <div
                        className="dropdown-content"
                        tabIndex="0"
                        role="button"
                        onClick={handleLogout}
                        onKeyPress={handleClickWallet}>
                        {' '}
                        Logout{' '}
                      </div>
                    </div>
                  ) : (
                    <Button
                      tabIndex="0"
                      role="button"
                      className={['btn', 'btn-wallet'].join(' ')}
                      title="Connect Wallet"
                      onClick={handleClickOpen}
                      onKeyPress={handleClickOpen}
                    />
                  )}
                </div>
              )}
              <div
                role="button"
                tabIndex="0"
                aria-label="menuicon"
                className="handburger"
                onKeyPress={(e) => handleKeyDown(e)}
                ref={iconRef}
                onClick={() => handleResponsiveMenu()}>
                <div className="bar1"></div>
                <div className="bar2"></div>
                <div className="bar3"></div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

Header.propTypes = {
  className: PropTypes.string
};
