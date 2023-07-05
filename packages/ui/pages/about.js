import React from 'react';
import Image from 'next/image';
import SignUp from '../components/common/signup';
import { useAppContext } from '../contexts/state';
import { EventStatus, projectName } from '../lib/config';
import styles from '../styles/aboutpage.module.scss';
import { getSectionStyle } from '../lib/helper';

export default function About() {
  const {
    state: { eventStatus, alerts, cookieConsent }
  } = useAppContext();

  return (
    <section className={[styles.aboutpage, getSectionStyle(alerts, cookieConsent)].join(' ')}>
      <div className={['container', styles.aboutpageHead].join(' ')}>
        <aside style={{ justifyContent: 'center' }}>
          <h2>About US</h2>
          <article>
            We are a team of engineers, designers and technology enthusiasts exploring how we can
            use public Blockchain technologies for good.
          </article>
        </aside>
        <aside className={styles.imageContainer}>
          <figure>
            <Image
              src="/assets/images/about-main.png"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyAgd2lkdGg9IjY2MHB4IiBoZWlnaHQ9IjY2MHB4IiAgdmlld0JveD0iMCAwIDY2NSA2MDgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+UGF0aCAxMTwvdGl0bGU+CiAgICA8ZmlsdGVyIGlkPSJBIj4KICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIzIiAvPgogICAgPC9maWx0ZXI+CiAgICA8ZGVmcz4KICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Im15R3JhZGllbnQiPgogICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2YjdlMDAiIC8+CiAgICAgICAgPHN0b3Agb2Zmc2V0PSI4MCUiIHN0b3AtY29sb3I9IndoaXRlIiAvPgogICAgICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8ZyBmaWx0ZXI9InVybCgjQSkiIGZpbGw9InVybCgnI215R3JhZGllbnQnKSIgaWQ9IkNsaW1hdGUtREFPLVdpcmVmcmFtZXMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik01MzMuMzExNjg3LDQ4LjU0MDg1MzUgQzU5MC43OTc2NzMsODQuODc3MTc3NyA2MzAuNTMwNjM0LDE1NC4xNjk3MDMgNjUwLjgxOTgwNSwyMzEuOTEyNTM2IEM2NzEuMTA4OTc3LDMxMC41MDA0IDY3Mi43OTk3NDEsMzk3LjUzODU3MiA2MzQuNzU3NTQ1LDQ2MC45MTU4ODIgQzU5Ny41NjA3Myw1MjQuMjkzMTkxIDUxOS43ODU1NzMsNTY0LjAwOTYzOSA0NDEuMTY1MDM0LDU4Ni44MjU0NyBDMzYyLjU0NDQ5NSw2MDkuNjQxMzAyIDI4My4wNzg1NzMsNjE1LjU1NjUxNyAyMDIuNzY3MjcsNTk2Ljk2NTg0IEMxMjIuNDU1OTY2LDU3OS4yMjAxOTMgNDIuMTQ0NjYyNyw1MzYuOTY4NjUzIDEzLjQwMTY2OTgsNDcxLjkwMTI4MiBDLTE1LjM0MTMyMyw0MDYuODMzOTExIDguMzI5Mzc2OTYsMzE4Ljk1MDcwOCAyNi45Mjc3ODQxLDIzNC40NDc2MjkgQzQ2LjM3MTU3MzQsMTQ5Ljk0NDU0OSA2MS41ODg0NTE5LDY3Ljk3NjU2MTggMTEwLjYyMDYxNiwyOS45NTAxNzYgQzE1OS42NTI3OCwtNy4yMzExNzg5OCAyNDMuMzQ1NjEzLC0xLjMxNTk2MzQxIDMyMS45NjYxNTIsMy43NTQyMjEzNyBDNDAxLjQzMjA3Myw3Ljk3OTM3NTM1IDQ3NS44MjU3MDIsMTIuMjA0NTI5MyA1MzMuMzExNjg3LDQ4LjU0MDg1MzUgWiIgaWQ9IlBhdGgiIGZpbGwtcnVsZT0ibm9uemVybyI+PC9wYXRoPgogICAgPC9nPgo8L3N2Zz4="
              alt="hero"
              width={1320 / 2}
              height={1320 / 2}
            />
          </figure>
        </aside>
      </div>
      {(eventStatus === EventStatus.DURING || eventStatus === EventStatus.POST) && (
        <div style={{ marginBottom: '5rem' }}>
          <SignUp />
        </div>
      )}
      <div className="container">
        <div className={styles.whoWeAre}>
          <h3>Who we are</h3>
          <article>
            {`We are part of bp's Digital Science & Engineering team, which explores novel technologies for the purpose of accelerating bp's journey to becoming a Net Zero carbon company and helping the world get to Net Zero carbon. Innovation with purpose, inclusion and transparency are our driving principles, and we believe that public blockchain technologies can greatly accelerate and make real those principles, through the applications, products and services we launch.`}
          </article>
        </div>

        <div className={styles.ourVision}>
          <div className={styles.pane}>
            <figure>
              <img src="/assets/images/ourvision.png" alt="project detail" />
            </figure>
          </div>
          <div className={styles.pane}>
            <h3>Our Vision</h3>
            <article>
              <p>{`Our vision for the ${projectName} application is to connect those working on the hardest problems of Climate Change with the resources of companies, institutions, and individuals. We aim to explore the scale at which public blockchain and privacy-enhancing technologies can organize such connections in a way that is global, transparent, and beneficial for all parties.`}</p>
              <p>{`We recognize that achieving this vision will be a multi-disciplinary effort. For everyone from public companies to private individuals to participate in ${projectName}, we will have to innovate not just on technology but also across the associated legal, financial, tax, security, and regulatory compliance domains. As such, we see bp launching the initial (2021) iteration of ${projectName} as an important but only first step in a multi-year roadmap.`}</p>
              <p>{`We expect the ${projectName} to move through several iterations to optimize towards improved user experience, trustlessness, privacy, scalability, and sustainability.`}</p>
            </article>
          </div>
        </div>

        <div className={styles.transparencyInclusion}>
          <div className={styles.pane}>
            <h3>Transparency</h3>
            <article>
              By “transparency”, we mean making transpicuous in word and in code the any decisions
              or trade-offs for end users. We will communicate the alternative design and technology
              choices that are available and the rationale of decisions and design choices we make.
              Whether in organizational or technological domains, while we do not assume to have all
              the “right” answers, we do aspire to make our hypotheses readily accessible for
              feedback and collaboration. Public blockchain applications we build are examples to
              promote this open approach to innovation in the energy industry.
            </article>
          </div>

          <div className={styles.pane}>
            <h3>Inclusion</h3>
            <article>
              We recognize in the context of the world’s energy transition that governments,
              institutions, companies, and every private individual in the world is a stakeholder.
              By “inclusion”, we mean that these diverse stakeholders should be represented in
              technological innovation that we develop and should benefit from its outcomes.
              Furthermore, participation should be equitable to align community interest best with
              funding resources.
            </article>
          </div>
        </div>

        <div className={styles.innovation}>
          <div className={styles.pane}>
            <figure>
              <img src="/assets/images/about-bottom.png" alt="innovation" />
            </figure>
          </div>
          <div className={[styles.pane, styles.innovationInner].join(' ')}>
            <h3>Innovation with purpose</h3>
            <article>
              By “innovation with purpose”, we mean using technology in new and novel ways as to
              address acute challenges in accelerating the world’s energy transition to Net Zero
              before 2050. This type of innovation is adaptive and iterative. While we build
              applications and features in small steps, these projects are intended to move fast, to
              yield practical and shareable insights, and to form a pathway towards a broad, and
              ultimately global, impact.
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
