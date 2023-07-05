import Button from './common/button';
import styles from '../styles/about.module.scss';
import { useRouter } from 'next/router';
import { projectName } from '../lib/config';

export default function AboutSection() {
  const router = useRouter();
  return (
    <section className="row" id="about">
      <div className={[styles.aboutSection, 'container'].join(' ')}>
        <div className={styles.left}>
          <img src="/assets/images/about-bg.png" alt="about us" />
        </div>
        <aside className={styles.right}>
          <div>
            <h2>About the {projectName}</h2>
            <p>
              The {projectName} is a Decentralised Autonomous Organisation created by bp to further
              climate action projects that will help reverse effects of global warming around the
              world and achieve net zero.
              <br />
              <br />
              The {projectName} runs on the Ethereum public blockchain and utilizes quadratic fund
              matching to distribute funds in more equitable way.
              <br />
              <br />
              bp is providing 250,000 USDC to the {projectName} in total. Each project will receive
              20,000 USDC from bp. The remaining 150,000 USDC of bp’s contribution will be
              distributed based on quadratic fund matching – or how individual donors decided to
              contribute to the DAO. <br />
              <br />
              {projectName} donations are made semi-anonymously and match funding donations are
              automatically quantified by the Quadratic Funding algorithm after the funding period
              expires.
            </p>
            <Button
              tabIndex="0"
              onClick={() => router.push('/about')}
              role="button"
              className="btn btn-primary"
              title="Learn more"
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
