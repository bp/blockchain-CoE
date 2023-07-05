import styles from '../styles/howitworks.module.scss';
export default function HowItWorksSection() {
  return (
    <section id="howitworks">
      <div className={['container', styles.howItWorks].join(' ')}>
        <h3>How it works</h3>
        <div className={styles.content}>
          <div className={styles.item}>
            <div className={styles.topSection}>1</div>
            <h3>Choose projects</h3>
            <p>
              Pick the project you would like to donate towards. Your donations will help fund the
              project.
            </p>
          </div>

          <div className={styles.item}>
            <div className={styles.topSection}>2</div>
            <h3>Add to basket</h3>
            <p>
              Decide on the amount of donations up to 9,999 USDC in total. Add each project you like
              to basket.
            </p>
          </div>

          <div className={styles.item}>
            <div className={styles.topSection}>3</div>
            <h3>Donate</h3>
            <p>
              Every USDC you donate will go towards the projects of your choice. If you donate over
              100 USDC in total, bp will pay your gas fees while our funds last ($10,000 in Ether
              equivalent). This will operate on a first come, first serve basis.
            </p>
          </div>

          <div className={styles.item}>
            <div className={styles.topSection}>4</div>
            <h3>Amplify</h3>
            <p>
              As an extra benefit, each USDC you donate will also act as an automatic vote. These
              votes will determine how bp’s 150,000 USDC out of 250,000 USDC are split among the
              projects. bp’s remaining 100,000 USDC will be split equally among the 5 projects. See
              &#34;Quadratic Funding&#34; section for more details.
            </p>
          </div>

          <div className={styles.item}>
            <div className={styles.topSection}>5</div>
            <h3>Check progress</h3>
            <p>
              After you have donated to your chosen projects, you will be able to monitor their
              progress.
            </p>
          </div>
        </div>
        <div className={styles.disclaimer}>
          Please note: To reduce Ethereum gas fees, individual donations towards each project are
          combined together in one Ethereum transaction. Specific project allocation is recorded off
          chain.
        </div>
      </div>
    </section>
  );
}
