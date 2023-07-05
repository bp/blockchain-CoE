import Button from './common/button';
import styles from '../styles/whitepaper.module.scss';
import { projectName } from '../lib/config';

export default function WhitepaperSection() {
  const openWhitepaper = () => {
    window.open('/assets/documents/whitepaper.pdf');
  };

  const openLitePaper = () => {
    window.open('/assets/documents/whitepaper.pdf');
  };

  return (
    <section id="whitepaper">
      <div className={['container', styles.whitePaperSection].join(' ')}>
        <h3>Whitepaper</h3>
        <div className={styles.secondBlock}>
          <div className={styles.section}>
            <figure>
              <img src="/assets/images/whitepaper-bg.png" alt="Trulli" />
            </figure>
          </div>
          <div className={[styles.section, styles.rightSection].join(' ')}>
            <aside>
              <p>{projectName} Whitepaper</p>
              <article>
                The {projectName} whitepaper outlines the details of mechanisms by which the{' '}
                {projectName} works.
              </article>
              <div className={styles.btnSection}>
                <Button
                  onClick={openLitePaper}
                  className={[`btn btn-secondary`, styles.btn].join(' ')}
                  title="Read litepaper"
                />
                <Button
                  onClick={openWhitepaper}
                  className={[`btn btn-primary`, styles.btn].join(' ')}
                  title="Read whitepaper"
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
