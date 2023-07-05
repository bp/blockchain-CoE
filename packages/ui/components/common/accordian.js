import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/accordian.module.scss';

const Accordion = ({ title, content, index }) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      setIsActive(!isActive);
    }
  };

  return (
    <div className={styles.accordionItem}>
      <div
        id={`accordion${index}`}
        className={styles.accordionTitle}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={isActive}
        role="button"
        tabIndex="0">
        <div style={{ width: 'fit-content' }}>{title}</div>
        <div className={[styles.icon, `${isActive ? styles.open : ''}`].join(' ')}></div>
      </div>
      {isActive && (
        <div
          role="region"
          aria-labelledby={`accordion${index}`}
          className={styles.accordionContent}>
          {content.map((item, index) => {
            return <p key={index}>{item} </p>;
          })}
        </div>
      )}
    </div>
  );
};

Accordion.propTypes = {
  title: PropTypes.string,
  content: PropTypes.array,
  index: PropTypes.number
};

export default Accordion;
