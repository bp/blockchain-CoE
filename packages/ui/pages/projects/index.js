import React from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import styles from '../../styles/projects.module.scss';
import SignUp from '../../components/common/signup';
import { STATIC_FETCH_API_URL } from '../../lib/config';
import { useAppContext } from '../../contexts/state';
import { EventStatus } from '../../lib/config';
import ListCard from '../../components/common/list-card';

export default function Projects({ projects }) {
  const {
    state: { eventStatus, contributionCount, alerts, cookieConsent }
  } = useAppContext();
  React.useEffect(() => {
    document.documentElement.lang = 'en-us';
  }, []);

  const getImage = () => {
    if (eventStatus === EventStatus.PRE) {
      return '/assets/images/projects-pre.png';
    } else if (eventStatus === EventStatus.DURING) {
      return '/assets/images/projects-during.png';
    } else if (eventStatus === EventStatus.POST) {
      return '/assets/images/projects-post.png';
    }
  };

  const getSectionStyle = () => {
    if (cookieConsent) {
      return alerts.length > 0 ? 'mt-6' : 'pt-20';
    } else {
      return '';
    }
  };

  const getStyleForProjectsContainer = () => {
    if (eventStatus === EventStatus.PRE) {
      return styles.before;
    } else if (eventStatus === EventStatus.DURING) {
      return styles.during;
    } else if (eventStatus === EventStatus.POST) {
      return styles.after;
    }
  };

  return (
    <>
      <section className={[styles.hero, 'container', getSectionStyle()].join(' ')}>
        <div style={{ display: 'flex' }}>
          <div className={[styles.leftSection].join(' ')}>
            <article className="pt-10" style={{ paddingTop: '14rem' }}>
              <h3>Projects</h3>
              <aside>
                {eventStatus === EventStatus.PRE && (
                  <p>
                    These projects will be open to active donations when the DAO becomes active. bp
                    will match fund projects based on Quadratic Funding algorithm.
                  </p>
                )}
                {eventStatus === EventStatus.DURING && (
                  <p>These projects are open to active donations</p>
                )}
                {eventStatus === EventStatus.POST && (
                  <p>
                    Check project donation amounts and the progress of each project on our blog.
                  </p>
                )}
              </aside>
            </article>
          </div>
          <div className={styles.rightSection}>
            {eventStatus && (
              <Image
                src={getImage()}
                alt="hero"
                blurDataURL="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNjYwcHgiIGhlaWdodD0iNjYwcHgiICB2aWV3Qm94PSIwIDAgNjEyIDYwOCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KICAgIDx0aXRsZT5QYXRoIDc8L3RpdGxlPgogICAgPGZpbHRlciBpZD0iQSI+CiAgICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMyIgLz4KICAgIDwvZmlsdGVyPgogICAgPGRlZnM+CiAgICAgICAgPHJhZGlhbEdyYWRpZW50IGlkPSJteUdyYWRpZW50Ij4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjM2Q0NzA4IiAvPgogICAgICAgIDxzdG9wIG9mZnNldD0iODAlIiBzdG9wLWNvbG9yPSJ3aGl0ZSIgLz4KICAgICAgICA8L3JhZGlhbEdyYWRpZW50PgogICAgPC9kZWZzPgogICAgPGcgZmlsdGVyPSJ1cmwoI0EpIiBmaWxsPSJ1cmwoJyNteUdyYWRpZW50JykiIGlkPSJDbGltYXRlLURBTy1XaXJlZnJhbWVzIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cGF0aCBkPSJNNDk1LjQyMTg4OSw3NS44NTYwMTg3IEM1NTMuOTIyNDI2LDEyMy44ODU5MzYgNjAxLjE3Mjg2LDE4Ni45MjUyMDMgNTk4LjkyMjg0LDI0Ny43MTMwNjcgQzU5Ny40MjI4MjYsMzA4LjUwMDkzMSA1NDcuMTcyMzY0LDM2Ny43ODc4NiA1MDUuOTIxOTg2LDQyNy4wNzQ3ODkgQzQ2NS40MjE2MTQsNDg1LjYxMTI1MSA0MzMuOTIxMzI0LDU0NC44OTgxOCAzODIuMTcwODQ5LDU3Ni40MTc4MTQgQzMzMC40MjAzNzQsNjA4LjY4NzkxNCAyNTcuNjY5NzA2LDYxMy45NDExODcgMTg5LjQxOTA3OSw1OTUuMTc5NSBDMTIxLjE2ODQ1Miw1NzUuNjY3MzQ2IDU3LjQxNzg2NjQsNTMwLjYzOTI5OSAyOC4xNjc1OTc3LDQ3MS4zNTIzNjkgQy0wLjMzMjY2NDAyMSw0MTEuMzE0OTczIDUuNjY3MzkxMDksMzM2LjI2ODIyNyAxOS45MTc1MjIsMjYzLjQ3Mjg4MyBDMzMuNDE3NjQ2LDE5MS40MjgwMDcgNTUuOTE3ODUyNiwxMjEuNjM0NTM0IDEwMy45MTgyOTMsNzEuMzUzMjEzOSBDMTUxLjE2ODcyNywyMS44MjIzNjE2IDIyMy45MTkzOTYsLTcuNDQ1ODY5MjYgMjk1LjE3MDA1LC01Ljk0NDkzNDM0IEMzNjYuNDIwNzA0LC00LjQ0Mzk5OTQzIDQzNi45MjEzNTIsMjcuODI2MTAxMyA0OTUuNDIxODg5LDc1Ljg1NjAxODcgWiIgaWQ9IlBhdGgiIGZpbGwtcnVsZT0ibm9uemVybyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzAzLjUwMDAwMCwgMzAwLjAwMDAwMCkgcm90YXRlKC0xNzAuMDAwMDAwKSB0cmFuc2xhdGUoLTMwMy41MDAwMDAsIC0zMDAuMDAwMDAwKSAiPjwvcGF0aD4KICAgIDwvZz4KPC9zdmc+"
                placeholder="blur"
                width={1320 / 2}
                height={1320 / 2}
              />
            )}
          </div>
        </div>
      </section>

      <div className={['container', styles.projects, getStyleForProjectsContainer()].join(' ')}>
        {projects &&
          projects.map((project, index) => (
            <div className={styles.project} key={project.id}>
              <ListCard
                showInput={true}
                data={project}
                contributions={contributionCount[index].count}
              />
            </div>
          ))}
      </div>
      {(eventStatus === EventStatus.DURING || eventStatus === EventStatus.POST) && <SignUp />}
    </>
  );
}

Projects.propTypes = {
  projects: PropTypes.array
};

export async function getStaticProps() {
  const { projects } = await fetch(`${STATIC_FETCH_API_URL}/projects`).then((res) => res.json());

  return {
    props: { projects }
  };
}
