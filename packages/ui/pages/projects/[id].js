import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import BackLink from '../../components/common/backlink';
import Button from '../../components/common/button';
import ListCard from '../../components/common/listCard';
import ProjectImpact from '../../components/projectimpact';
import { useAppContext } from '../../contexts/state';
import { EventStatus, blogUrl } from '../../lib/config';
import styles from '../../styles/projectdetail.module.scss';
import {
  STATIC_FETCH_API_URL,
  checkConversion,
  API_URL,
  getContributionAdvice
} from '../../lib/config';
import { checkContributionLimit, getSectionStyle, _currencyFormatter } from '../../lib/helper';
import useRequest from '../../lib/use-request';
import FAQItem from '../../components/common/faqItem';

export default function ProjectDetail({ project }) {
  const router = useRouter();
  const { doRequest } = useRequest();
  const { id } = router.query;
  const {
    state: {
      basket,
      alerts,
      eventStatus,
      user,
      projects,
      canContribute,
      contributionCount,
      cookieConsent
    },
    dispatch
  } = useAppContext();
  const [contributions, setContributions] = React.useState([]);
  const [value, setValue] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [linkBtn, setLinkBtn] = useState('');

  React.useEffect(() => {
    document.documentElement.lang = 'en-us';
    if (project?.desc) {
      setLinkBtn('View full details');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getContributionFromBp = (project) => {
    let total = 0;
    if (project['matchingContribution']) {
      total += Number(project['matchingContribution']);
    }
    if (project['baselineContribution']) {
      total += Number(project['baselineContribution']);
    }
    return total;
  };

  const handleOnInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]*/g, '');
  };

  useEffect(() => {
    if (projects.length) {
      const thisProject = projects.find((each) => each.id === id);
      const contributors = contributionCount.find((each) => each.projectId === thisProject.id);
      let stats = [];
      if (!user || !user._id) {
        if (eventStatus && eventStatus !== EventStatus.POST) {
          //display only goal if user has not logged in DURING the voting period & PRE voting period (currenly user login is prevented PRE voting period)
          stats.push({ title: 'Goal', value: checkConversion(thisProject['goal']) });
        }
      } else {
        if (eventStatus && eventStatus === EventStatus.PRE) {
          //display goal alone, if user has logged in PRE voting period (currenly user login is prevented PRE voting period)
          stats.push({ title: 'Goal', value: checkConversion(thisProject['goal']) });
        } else if (eventStatus && eventStatus === EventStatus.DURING) {
          //display goal and title only, if user has logged in DURING voting period
          stats = [{ title: 'Goal', value: checkConversion(thisProject['goal']) }];
          if (thisProject.yourContribution > 0) {
            stats = [
              ...stats,
              {
                title: 'Your donation',
                value: checkConversion(thisProject['yourContribution'])
              }
            ];
          }
        }
      }
      //display all the values POST voting irrespective of user login
      if (eventStatus && eventStatus === EventStatus.POST) {
        stats = [
          {
            title: 'Community donation',
            value: checkConversion(thisProject['userContribution'])
          },
          {
            title: 'Donation from bp',
            value: checkConversion(getContributionFromBp(thisProject))
          },
          {
            title: 'Donators',
            value: contributors ? contributors.count : 0
          }
        ];
        if (thisProject.yourContribution > 0) {
          stats = [
            ...stats,
            {
              title: 'Your donation',
              value: checkConversion(thisProject['yourContribution'])
            }
          ];
        }
        if (thisProject.totalContributionToday > 0) {
          stats = [
            ...stats,
            {
              title: 'Total donation',
              value: checkConversion(thisProject['totalContributionToday'])
            }
          ];
        }
      }
      setContributions([...stats]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, eventStatus, user, contributionCount]);

  const handleClick = (e) => {
    e.stopPropagation();
  };

  const handleAddToBasket = (e) => {
    e.stopPropagation();
    let donations = { ...basket, [id]: value };
    if (value) {
      if (checkContributionLimit(donations, dispatch)) {
        if (user && user._id && value !== basket[id]) {
          doRequest({
            url: `${API_URL}/basket`,
            method: `POST`,
            body: { ...basket, [project.id]: value }
          });
        }
        dispatch({ type: 'setBasket', payload: { ...basket, [project.id]: value } });
        setValue('');
        
      }
    }
  };

  const handleInputChange = (e) => {
    if (e.target.value > 9999) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    if (e.target.value) {
      setValue(parseInt(e.target.value, 10));
    } else {
      setValue('');
    }
  };

  const getBtnStyle = () => {
    if (value > 0) return 'btn-primary';
    else return 'btn-tertiary';
  };

  const getBtnTitle = () => {
    if (basket[id] > 0) return 'Update amount';
    else return 'Add to basket';
  };

  const handleTooltip = (e, status) => {
    e.stopPropagation();
    setShowTooltip(status);
  };

  const handleProjectDescription = () => {
    if (linkBtn === 'View full details') {
      setLinkBtn('View less');
    } else {
      setLinkBtn('View full details');
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleProjectDescription();
    }
  };

  const handleGoToBasket = (e) => {
    e.stopPropagation();
    router.push(`/basket`);
  };

  const handleKeyDownGoToBasket = (e) => {
    if (e.keyCode === 13) {
      handleGoToBasket(e);
    }
  };

  return (
    <>
      {project && (
        <section
          className={[styles.projectdetail, getSectionStyle(alerts, cookieConsent)].join(' ')}>
          <div className={[styles.projectDetailInner, 'container m-auto'].join(' ')}>
            <BackLink title="Back to project list" path="/projects" />
            <div className={styles.topSection}>
              <aside className={styles.imgBlock}>
                <div className={styles.projectThumbnailContainer}>
                  <Image
                    src={`/assets/images/project-${id}-project-details.png`}
                    width={500}
                    height={500}
                    alt="project detail"
                  />
                </div>
              </aside>
              <aside className={styles.projectContent}>
                <h3>{project.title}</h3>
                <h4>{project.org}</h4>
                <article>{project.shortdesc}</article>
                {canContribute && (
                  <div className={styles.inputWrapper}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '1rem'
                      }}>
                      {basket[id] > 0 && (
                        <Button
                          tabIndex="0"
                          role="button"
                          className={['btn', 'btn-secondary', styles.btnBasket].join(' ')}
                          title={`${basket[id]} USDC in basket`}
                          onClick={handleGoToBasket}
                          onKeyDown={handleKeyDownGoToBasket}
                        />
                      )}
                    </div>
                    <div
                      className={[
                        styles.contributionAdvice,
                        `${showTooltip ? styles.show : styles.hide}`
                      ].join(' ')}>
                      <p>{getContributionAdvice}</p>
                    </div>
                    <div className={styles.addToBasket}>
                      <input
                        type="number"
                        onInput={handleOnInput}
                        aria-label="Enter USDC donation amount"
                        aria-required="true"
                        placeholder="Enter USDC donation amount"
                        onClick={handleClick}
                        onChange={handleInputChange}
                        onFocus={(e) => handleTooltip(e, true)}
                        onBlur={(e) => handleTooltip(e, false)}
                        min="1"
                        max="9999"
                        value={value}
                      />
                      <Button
                        tabIndex="0"
                        role="button"
                        className={['btn', styles.btn, getBtnStyle()].join(' ')}
                        title={getBtnTitle()}
                        onKeyDown={handleClick}
                        onClick={handleAddToBasket}
                      />
                    </div>
                  </div>
                )}
                {eventStatus === EventStatus.POST && (
                  <Link href={blogUrl}>
                    <a className="linkData" target="_blank">
                      View updates
                    </a>
                  </Link>
                )}
              </aside>
            </div>
            <div className={styles.contributionBubblesContainer}>
              {contributions &&
                contributions.map((contribution, i) => (
                  <div key={i} className={styles.contributionDetails}>
                    <div className={styles.title}>{contribution.title}</div>
                    <div className={styles.data}>
                      {contribution.title === 'Donators'
                        ? contribution?.value
                        : `${_currencyFormatter(contribution?.value?.toFixed())} USDC`}
                    </div>
                  </div>
                ))}
            </div>
            <div className={styles.aboutProject}>
              <div className={styles.abouthead}>
                <h3>About Project</h3>
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={handleProjectDescription}
                  onKeyDown={handleKeyDown}
                  role="button"
                  tabIndex="0">
                  <a className="linkData">{linkBtn}</a>
                </div>
              </div>
              <article className={linkBtn === 'View full details' ? styles.truncate : ''}>
                {project.desc &&
                  project.desc.map((description, index) => {
                    return <p key={index}>{description}</p>;
                  })}
              </article>
            </div>

            <div className={styles.fundingDeliverables}>
              <div className={styles.cardItem}>
                <ListCard title="Funding Allocations" list={project.fundingallocations} />
              </div>
              <div className={styles.cardItem}>
                <ListCard title="Deliverables" list={project.deliverables} />
              </div>
            </div>

            {project.orgdetails.map(({ title, content, id }, index) => {
              return <FAQItem key={index} title={title} content={content} id={id} />;
            })}
            <ProjectImpact desc={project.impact} id={id} />
          </div>
        </section>
      )}
    </>
  );
}

ProjectDetail.propTypes = {
  project: PropTypes.object
};

export async function getStaticPaths() {
  const { projects } = await fetch(`${STATIC_FETCH_API_URL}/projects`).then((res) => res.json());

  const paths = projects.map((project) => ({
    params: { id: project.id.toString() }
  }));

  // { fallback: false } means other routes should 404.
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { project } = await fetch(`${STATIC_FETCH_API_URL}/projects/${params.id}`).then((res) =>
    res.json()
  );

  return {
    props: { project }
  };
}
