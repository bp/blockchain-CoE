import React from 'react';
import PropTypes from 'prop-types';
import { useAppContext } from '../contexts/state';
import styles from '../styles/privacypolicy.module.scss';
import { getSectionStyle } from '../lib/helper';
export default function TermsConditions({ privacyPolicies }) {
  React.useEffect(() => {
    document.documentElement.lang = 'en-us';
  }, []);
  const {
    state: { alerts, cookieConsent }
  } = useAppContext();

  return (
    <section
      className={[styles.privacyPolicySection, getSectionStyle(alerts, cookieConsent)].join(' ')}>
      <div className={['container', styles.faqSection].join(' ')}>
        <h2 className={styles.heading}>Privacy policy</h2>
        <div className={styles.privacyPolicies}>
          {privacyPolicies &&
            privacyPolicies.map(({ title, content }, index) => (
              <div key={index}>
                {title && <h3 className={styles.title}>{title}</h3>}
                <div className={styles.content}>
                  <pre>{content}</pre>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

TermsConditions.propTypes = {
  privacyPolicies: PropTypes.array
};

export async function getStaticProps() {
  const privacyPolicies = [
    {
      title: '',
      content: `This website privacy policy template has been designed to help website owners comply with European Union and United Kingdom data protection legislation, including the General Data Protection Regulation (GDPR).
      
The policy covers all the usual ground: the categories of personal data that are collected, the purposes for which that personal data may be used, the legal bases for processing, the persons to whom the personal data may be disclosed, international transfers of personal data, the security measures used to protect the personal data, individual rights and website cookies.
      
First published in 2008, this policy and its antecedents have been used on hundreds of thousands of websites. It was updated during 2017 and 2018 to reflect the GDPR and the developing regulatory guidance from the EU and UK data protection authorities. This template was last updated on 25 April 2018.
      
If you’re new to data protection law, then before downloading the policy you might want to review the questions and answers below, which provide a introduction to both the legal and practical issues around the use of privacy policies.
      
*A licence to use this privacy policy without the credit/attribution text.`
    },
    {
      title: 'Why do I need a privacy policy?',
      content: `The law probably requires that you publish a privacy policy (or similar document) on your website.  

Ask yourself this: do I collect or use personal data for non-personal / non-household activities in relation to my website? 
      
If you do, EU and UK data protection law require that you provide information to individuals about how you use their data. The usual way of providing that information is via a privacy policy.
      
The key pieces of legislation include the GDPR and, in the UK, the Data Protection Act 2018. But these legislative requirements are not the only considerations in play. There are at least three other reasons to publish a privacy policy on your website.
      
First, your contracts with services providers may require that you publish an appropriate privacy policy.  For example, the Google Analytics terms and conditions require that you “have and abide by an appropriate Privacy Policy … You must post a Privacy Policy and that Privacy Policy must provide notice of Your use of cookies that are used to collect data. You must disclose the use of Google Analytics, and how it collects and processes data.”
      
Second, a clear and open privacy policy will help you to build trust with some of your users. Users may refuse to register with a website if they aren’t confident that their personal data will be protected. Just as bad, they may provide unreliable information when doing so.
      
Third, one of the key functions of many websites is the projection of a serious and professional image.  A website without the necessary legal documentation may have a negative effect on the image of the business behind it.
This website privacy policy template has been drafted with all of these goals in mind, although the legal compliance requirements are overriding.`
    }
  ];
  return {
    props: { privacyPolicies }
  };
}
