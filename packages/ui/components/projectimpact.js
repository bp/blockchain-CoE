import PropTypes from 'prop-types';
import Image from 'next/image';
import styles from '../styles/projectimpact.module.scss';
const ProjectImpact = ({ desc, id }) => {
  return (
    <section id="projectimpact" className={styles.projectimpact}>
      <div className={styles.projectimpactInner}>
        <div className={styles.imageContainer}>
          <Image
            src={`/assets/images/project-${id}-climate-impact.png`}
            width={600}
            height={600}
            alt="project impact"
          />
        </div>
        <div className={styles.articleSection}>
          <div style={{ display: 'flex' }}>
            <h3>Impact on climate change & ESG</h3>
          </div>
          <article>
            {desc.map((item, index) => {
              return <p key={index}>{item}</p>;
            })}
          </article>
        </div>
        {/* </aside> */}
      </div>
    </section>
  );
};

ProjectImpact.propTypes = {
  desc: PropTypes.array,
  id: PropTypes.string
};

export default ProjectImpact;
