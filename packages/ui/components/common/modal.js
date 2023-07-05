import { useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/modalcomponent.module.scss';
import Button from './button';

const Modal = ({ title, showModal, onClose, children, footer, onButtonClick, loading = false }) => {
  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showModal]);

  const closeModal = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div
      id="myModal"
      className={[styles.modal, `${showModal ? styles.show : ''}`].join(' ')}
      role="dialog"
      aria-modal="true">
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <div
            onClick={(e) => closeModal(e)}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex="0"
            className={styles.close}>
            &times;
          </div>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && (
          <div className={styles.modalFooter}>
            <div className={styles.button}>
              <Button
                style={{ minWidth: '20rem' }}
                tabIndex="0"
                role="button"
                className={footer.style}
                title={footer.title}
                onClick={onButtonClick}
                onKeyDown={onButtonClick}
                loading={loading}
                disabled={loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  title: PropTypes.string,
  showModal: PropTypes.bool,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func,
  children: PropTypes.object,
  footer: PropTypes.object,
  onButtonClick: PropTypes.func,
  onKeyDown: PropTypes.func,
  loading: PropTypes.bool
};

export default Modal;
