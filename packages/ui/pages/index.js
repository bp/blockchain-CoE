import React from 'react';
import PropTypes from 'prop-types';
import Slider from '../components/slider';
import CounterSection from '../components/counter';
import AboutSection from '../components/about';
import HowItWorksSection from '../components/howitworks';
import QuadraticSection from '../components/quadratic';
import WhitepaperSection from '../components/whitepaper';
import FAQ from '../components/faq';
import Link from 'next/link';
import { blogUrl, EventStatus, projectName } from '../lib/config';
import { useAppContext } from '../contexts/state';
import { STATIC_FETCH_API_URL, applicationUrl } from '../lib/config';
import CountDownSection from '../components/countdown';
import styles from '../styles/index.module.scss';
import SignUp from '../components/common/signup';
import Image from 'next/image';
import Loader from '../components/common/loader';
export default function Home({ projects }) {
  const {
    state: { eventStatus, totalContributionCount, cookieConsent, alerts, contract }
  } = useAppContext();

  React.useEffect(() => {
    document.documentElement.lang = 'en-us';
  }, []);

  const getLandingImageCss = () => {
    if (eventStatus === EventStatus.PRE) {
      return styles.before;
    } else if (eventStatus === EventStatus.DURING) {
      return styles.during;
    } else if (eventStatus === EventStatus.POST) {
      return styles.after;
    }
  };

  const getImage = () => {
    let url = '';
    if (eventStatus === EventStatus.PRE) {
      url = '/assets/images/home-before.png';
    } else if (eventStatus === EventStatus.DURING) {
      url = '/assets/images/home-during.png';
    } else if (eventStatus === EventStatus.POST) {
      url = '/assets/images/home-after.png';
    }
    return `${applicationUrl}${url}`;
  };

  const getBlurImage = () => {
    let url = '';
    if (eventStatus === EventStatus.PRE) {
      url =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNjYwcHgiIGhlaWdodD0iNjYwcHgiIHZpZXdCb3g9IjAgMCA3NTEgNjI5IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPlBhdGggMjwvdGl0bGU+CiAgICA8ZmlsdGVyIGlkPSJBIj4KICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIzIiAvPgogICAgPC9maWx0ZXI+CiAgICA8ZGVmcz4KICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Im15R3JhZGllbnQiPgogICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNjZmJjNWYiIC8+CiAgICAgICAgPHN0b3Agb2Zmc2V0PSI4MCUiIHN0b3AtY29sb3I9IndoaXRlIiAvPgogICAgICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8ZyBmaWx0ZXI9InVybCgjQSkiIGZpbGw9InVybCgnI215R3JhZGllbnQnKSIgaWQ9IkNsaW1hdGUtREFPLVdpcmVmcmFtZXMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik01OTQuMDQ2NTY2LDY4LjU5NzY4MzkgQzY3Ni4yNzEzMjIsMTA1LjY0NDY2NyA3NTkuNjcwNzE3LDE0NC40NTU3OTMgNzUwLjI3MzYwMiwxOTQuNzMzODQyIEM3NDIuMDUxMTI3LDI0NS4wMTE4OTEgNjQxLjAzMjE0MSwzMDguNTIxMDA1IDYwNi45Njc1OTksMzY3LjYxOTc2NSBDNTcyLjkwMzA1Nyw0MjYuNzE4NTI0IDYwNS43OTI5Niw0ODMuMTcxMDcgNTk1LjIyMTIwNSw1MzAuODAyOTA2IEM1ODMuNDc0ODEyLDU3OS4zMTY4MTMgNTI4LjI2Njc2MSw2MjAuNzc0MTUyIDQ2NC44MzYyMzUsNjI3LjgzMDcyIEM0MDEuNDA1NzA5LDYzNC44ODcyODggMzMwLjkyNzM0Nyw2MDguNDI1MTU3IDI1OS4yNzQzNDYsNTkwLjc4MzczNyBDMTg2LjQ0NjcwNSw1NzIuMjYwMjQ1IDExMy42MTkwNjQsNTYyLjU1NzQ2NCA2My4xMDk1NzA4LDUzMS42ODQ5NzcgQzEyLjYwMDA3NzksNDk5LjkzMDQyIC0xNC40MTY2Mjc2LDQ0Ni4xMjQwODcgNy45MDE1MjA0LDQwMi45MDI2MDYgQzI5LjA0NTAyOTEsMzU4Ljc5OTA1NCAxMDAuNjk4MDMxLDMyMy41MTYyMTMgMTMwLjA2NDAxNSwyNzUuODg0Mzc3IEMxNjAuNjA0NjM5LDIyOC4yNTI1NDEgMTUxLjIwNzUyNCwxNjYuNTA3NTY5IDE4MC41NzM1MDgsMTExLjgxOTE2NSBDMjExLjExNDEzMSw1Ni4yNDg2ODk0IDI4MC40MTc4NTQsNi44NTI3MTE0MiAzNTYuNzY5NDEzLDAuNjc4MjE0MTcgQzQzMS45NDYzMzMsLTUuNDk2MjgzMDggNTExLjgyMTgxLDMxLjU1MDcwMDQgNTk0LjA0NjU2Niw2OC41OTc2ODM5IFoiIGlkPSJQYXRoIiBmaWxsLXJ1bGU9Im5vbnplcm8iPjwvcGF0aD4KICAgIDwvZz4KPC9zdmc+';
    } else if (eventStatus === EventStatus.DURING) {
      url =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNjYwcHgiIGhlaWdodD0iNjYwcHgiIHZpZXdCb3g9IjAgMCA3MTggNjM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPGZpbHRlciBpZD0iQSI+CiAgICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMyIgLz4KICAgIDwvZmlsdGVyPgogICAgPGRlZnM+CiAgICAgICAgPHJhZGlhbEdyYWRpZW50IGlkPSJteUdyYWRpZW50Ij4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNjU5YmEwIiAvPgogICAgICAgIDxzdG9wIG9mZnNldD0iODAlIiBzdG9wLWNvbG9yPSJ3aGl0ZSIgLz4KICAgICAgICA8L3JhZGlhbEdyYWRpZW50PgogICAgPC9kZWZzPgogICAgPHRpdGxlPlBhdGggMzwvdGl0bGU+CiAgICA8ZyBmaWx0ZXI9InVybCgjQSkiIGZpbGw9InVybCgnI215R3JhZGllbnQnKSIgaWQ9IkNsaW1hdGUtREFPLVdpcmVmcmFtZXMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik01MTMuMDQ5NDkxLDEyMC40NTE5NjIgQzU3Ni44MzQyMzgsMTU5LjQwNDg3NiA2NTUuNTI5NzA0LDE4NS4wOTcyMjMgNjkyLjgwNjUwNCwyMzkuNzk3MDYgQzcyOS4yNTQ5MzEsMjkzLjY2ODExMSA3MjUuMTEzMDY0LDM3NS43MTc4NjUgNjgzLjY5NDM5Nyw0MjcuOTMxMzQ1IEM2NDMuMTA0MTA0LDQ4MC4xNDQ4MjUgNTY0LjQwODYzOCw1MDIuNTIyMDMxIDUwMy4xMDkwMTEsNTMyLjM1ODMwNiBDNDQwLjk4MTAxMSw1NjIuMTk0NTggMzk1LjQyMDQ3OCw1OTguNjYxMTM3IDMzNC45NDkyMjUsNjE4LjU1MTk4NyBDMjc1LjMwNjM0NSw2MzguNDQyODM3IDIwMC43NTI3NDUsNjQxLjc1Nzk3OCAxMzYuOTY3OTk4LDYxMi43NTA0ODkgQzczLjE4MzI1MTUsNTgzLjc0MyAyMC4xNjczNTgyLDUyMi40MTI4ODEgNS4yNTY2MzgyNSw0NTMuNjIzNjkzIEMtMTAuNDgyNDU1MSwzODUuNjYzMjkgMTEuODgzNjI0OSwzMDkuNDE1MDMzIDM1LjkwNjQ1MTUsMjM0LjgyNDM0NyBDNTkuOTI5Mjc4MiwxNTkuNDA0ODc2IDg2LjQzNzIyNDgsODQuODE0MTkgMTM5LjQ1MzExOCw0Mi41NDYxMzQ3IEMxOTEuNjQwNjM4LDAuMjc4MDc5MzEyIDI3MS4xNjQ0NzgsLTEwLjQ5NjEzMDkgMzM0Ljk0OTIyNSwxMC4yMjM1MDQxIEMzOTkuNTYyMzQ0LDMwLjExNDM1MzcgNDQ4LjQzNjM3MSw4MS40OTkwNDg0IDUxMy4wNDk0OTEsMTIwLjQ1MTk2MiBaIiBpZD0iUGF0aCIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+CiAgICA8L2c+Cjwvc3ZnPg==';
    } else if (eventStatus === EventStatus.POST) {
      url =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNjYwcHgiIGhlaWdodD0iNjYwcHgiIHZpZXdCb3g9IjAgMCA2MzcgNjM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPGZpbHRlciBpZD0iQSI+CiAgICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMyIgLz4KICAgIDwvZmlsdGVyPgogICAgPGRlZnM+CiAgICAgICAgPHJhZGlhbEdyYWRpZW50IGlkPSJteUdyYWRpZW50Ij4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNDg1NjBiIiAvPgogICAgICAgIDxzdG9wIG9mZnNldD0iODAlIiBzdG9wLWNvbG9yPSJ3aGl0ZSIgLz4KICAgICAgICA8L3JhZGlhbEdyYWRpZW50PgogICAgPC9kZWZzPgogICAgPHRpdGxlPlBhdGggNTwvdGl0bGU+CiAgICA8ZyBmaWx0ZXI9InVybCgjQSkiIGZpbGw9InVybCgnI215R3JhZGllbnQnKSIgaWQ9IkNsaW1hdGUtREFPLVdpcmVmcmFtZXMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik01MzQuNjY2MTAzLDU0LjM2OTMzNTYgQzU5OC42NTMsMTA2LjUzNDY0MyA2MjYuMzQ4ODIxLDIwNC4xMDMwODggNjM0Ljk0NDA3NiwyOTcuODA3NDM3IEM2NDIuNTg0MzAzLDM5Mi40Nzc4MSA2MzAuMTY4OTM1LDQ4My4yODQwODUgNTc2LjY4NzM0OSw1MjIuODkxMDc4IEM1MjMuMjA1NzYzLDU2Mi40OTgwNzEgNDI2Ljc0NzkwMyw1NTEuODcxODA0IDM1MC4zNDU2MzcsNTY5LjI2MDI0IEMyNzMuOTQzMzcxLDU4Ni42NDg2NzYgMjE2LjY0MTY3Miw2MzMuMDE3ODM4IDE1NS41MTk4Niw2MzMuOTgzODYyIEM5NC4zOTgwNDczLDYzNC45NDk4ODcgMjguNTAxMDkzMyw1OTIuNDQ0ODIxIDguNDQ1NDk4NTQsNTMzLjUxNzM0NCBDLTEyLjU2NTEyNDUsNDc1LjU1NTg5MiAxMS4zMTA1ODM1LDQwMi4xMzgwNTIgMTguOTUwODEwMSwzMjAuMDI1OTk0IEMyNi41OTEwMzY2LDIzNy45MTM5MzYgMTguOTUwODEwMSwxNDguMDczNjg0IDU4LjEwNjk3MTIsOTEuMDc4MjU1NyBDOTcuMjYzMTMyMywzNC4wODI4MjcyIDE4NC4xNzA3MDksMTAuODk4MjQ2MSAyNzYuODA4NDU2LDMuMTcwMDUyNDUgQzM3MC40MDEyMzIsLTUuNTI0MTY1NDUgNDY5LjcyNDE3NywxLjIzODAwNDAzIDUzNC42NjYxMDMsNTQuMzY5MzM1NiBaIiBpZD0iUGF0aCIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+CiAgICA8L2c+Cjwvc3ZnPg==';
    }
    return url;
  };

  const getSectionStyle = () => {
    if (cookieConsent) {
      return alerts.length > 0 ? 'mt-6' : 'pt-20';
    } else {
      return '';
    }
  };

  return (
    <>
      <section
        style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}
        className={[
          styles.landingTopSection,
          getLandingImageCss(),
          'container',
          getSectionStyle()
        ].join(' ')}>
        {eventStatus ? (
          <>
            <div className={['m-auto', 'pt-5', styles.leftSection].join(' ')}>
              {eventStatus === EventStatus.PRE && (
                <aside>
                  <p>
                    Donate to climate action projects. Towards global, transparent, inclusive action
                    on climate.
                  </p>
                  <h2>Donations commencing on</h2>
                  <div className={styles.startDate}>January 2022</div>
                </aside>
              )}
              {eventStatus === EventStatus.DURING && (
                <aside>
                  {contract.hasReachedMaximumLimit ? (
                    <p>
                      {projectName} has reached the maximum donation limit for a total of 1 Million
                      USDC. Thank you all for participating.
                    </p>
                  ) : (
                    <p>
                      Donate to climate action projects. Help save the planet in fair, transparent
                      and accountable way.
                    </p>
                  )}
                  <CountDownSection />
                  <div className={styles.buttonContainer}>
                    <Link href="/projects">
                      <a
                        style={{ minWidth: '15rem' }}
                        className={`btn btn-secondary mr-2 ${
                          eventStatus === EventStatus.POST ? 'btn-primary' : ''
                        }`}>
                        View all projects
                      </a>
                    </Link>
                  </div>
                </aside>
              )}
              {eventStatus === EventStatus.POST && (
                <aside>
                  {contract.distributionStatus ? (
                    <p>
                      {`Project funding round complete. Thank you all for participating. We will update
                  you on project's progress soon.`}
                    </p>
                  ) : (
                    <p>
                      {`Donations are now closed. ${projectName} is now in the process of completing
                  Quadratic Funding.`}
                    </p>
                  )}

                  <div className={styles.buttonContainer}>
                    <Link href="/projects">
                      <a
                        style={{ minWidth: '15rem' }}
                        className={`btn linkButton mr-2 ${
                          eventStatus === EventStatus.POST ? 'btn-primary' : ''
                        }`}>
                        View all projects
                      </a>
                    </Link>
                    <Link href={blogUrl}>
                      <a
                        style={{ minWidth: '15rem' }}
                        className={['btn', 'btn-secondary'].join(' ')}
                        target="_blank">
                        View project updates
                      </a>
                    </Link>
                  </div>
                </aside>
              )}
            </div>
            <div className={['m-auto', styles.rightSection].join(' ')}>
              {eventStatus && (
                <Image
                  src={getImage()}
                  placeholder="blur"
                  blurDataURL={getBlurImage()}
                  alt="hero"
                  width={1320 / 2}
                  height={1320 / 2}
                />
              )}
            </div>
          </>
        ) : (
          <div className="m-auto" style={{ textAlign: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Loader />
            </div>
          </div>
        )}
      </section>

      <section className={styles.projectSection}>
        <div className="container">
          <div className={styles.projectSectionHead}>
            <h3>Check Out the Five {projectName} Projects</h3>
            <Link href="/projects">
              <a style={{ minWidth: '17rem' }} className={['btn btn-primary'].join(' ')}>
                View all projects
              </a>
            </Link>
          </div>
        </div>
        <Slider projects={projects} />
      </section>
      <CounterSection contributions={totalContributionCount} eventStatus={eventStatus} />
      {(eventStatus === EventStatus.DURING || eventStatus === EventStatus.POST) && <SignUp />}
      <AboutSection />
      <HowItWorksSection />
      <QuadraticSection />
      <WhitepaperSection />
      <FAQ />
    </>
  );
}

Home.propTypes = {
  projects: PropTypes.array
};

export async function getStaticProps() {
  const { projects } = await fetch(`${STATIC_FETCH_API_URL}/projects`).then((res) => res.json());
  return {
    props: { projects: projects }
  };
}
