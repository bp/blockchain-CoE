import styles from '../styles/quadratic.module.scss';
export default function QuadraticSection() {
  return (
    <section className={styles.quadracticSection}>
      <div className={'container'}>
        <h3>What is Quadratic Funding?</h3>
        <div className={styles.content}>
          <div className={styles.left}>
            <p>
              Quadratic Funding (QF) is a more democratic and scalable form of matching funding for
              public goods, i.e. any projects valuable to large groups of people and accessible to
              the general public.
              <br />
              <br />
              QF optimises matching funds by prioritising projects based on the number of people who
              contributed over the amounts of contributions.
              <br />
              <br />
              This way, funds meant to benefit the public go towards projects that really benefit a
              broad public.
            </p>
          </div>
          <div className={styles.right}>
            <img src="/assets/images/quadratic.png" alt="Trulli" />
            {/* <iframe
              id="ytplayer"
              type="text/html"
              width="5000"
              height="308"
              title="quadraticFunding"
              src="https://www.youtube.com/embed/EngW7tLk6R8?autoplay=0"
              frameBorder="0"></iframe> */}
          </div>
        </div>
      </div>
    </section>
  );
}
