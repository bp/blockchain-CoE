import PropTypes from 'prop-types';
import Accordion from './accordian';
import styles from '../../styles/faqItem.module.scss';
function FAQItem({ title, content, id, isLandingPage }) {
  return (
    <section
      className={
        isLandingPage ? styles.faqItemSection : [styles.faqItemSection, styles.bubble].join(' ')
      }
      id={id}>
      <div className={styles.accordianInnerContainer}>
        {title && <h3>{title}</h3>}
        {content.map(({ question, answer }, index) => (
          <Accordion
            title={question}
            content={Array.isArray(answer) ? [...answer] : [answer]}
            index={index}
            key={index.toString()}
          />
        ))}
      </div>
    </section>
  );
}

FAQItem.propTypes = {
  title: PropTypes.string,
  id: PropTypes.string,
  content: PropTypes.array,
  isLandingPage: PropTypes.bool
};

export default FAQItem;
