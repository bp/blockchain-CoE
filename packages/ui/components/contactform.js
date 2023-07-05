import Button from './common/button';
import styles from '../styles/contactform.module.scss';
export default function ContactFormSection() {
  return (
    <section className={styles.contactformSection} id="contactus">
      <div className={['container', styles.contactformComponent].join(' ')}>
        <div className={styles.contactformComponentDummy}>
          <div className={styles.contactForm}>
            <form>
              <div className={styles.inputGroup}>
                <label htmlFor="name">Name:</label>
                <input id="name" />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email:</label>
                <input id="email" />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="subject">Subject:</label>
                <input id="subject" />
              </div>
              <div className={styles.buttonContainer}>
                <Button className="btn btn-primary" title="Send" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
