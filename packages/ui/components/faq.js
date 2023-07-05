import Link from 'next/link';
import FAQItem from './common/faqItem';
import styles from '../styles/faq.module.scss';
import { projectName } from '../lib/config';
export default function FAQ() {
  const accordionData = [
    {
      title: '',
      content: [
        {
          question: `What is the ${projectName}?`,
          answer: `The ${projectName} is an application for donating to research and impact projects with the potential of accelerating the world’s transition to Net Zero carbon emissions. The funding provided from these donations will allocated to academic projects through a pseudo-anonymized, semi-private quadratic funding method in a decentralized application built on the public Ethereum blockchain. The ${projectName} will also employ a zero knowledge proof verification of where the funding will be allocated as determined by the choices of the participants.`
        },
        {
          question: 'Where can I see your roadmap?',
          answer: `The longer term Roadmap for the ${projectName} is included in the Whitepaper, available on this website. Our roadmap will largely be determined by user response and feedback on the first funding round in the ${projectName}.`
        },
        {
          question: `Why is the ${projectName} open for public participation?`,
          answer: `Climate change is a global challenge of unprecedented scale, and we believe action towards Climate change requires unprecedented levels of collaboration between companies, organisations and individuals.  

          Collaboration is often hard when trust is lacking - transparency is what drives trust. By enhancing transparency through word and code, as in the ${projectName}, we can accelerate building trust and collaboration towards Climate action. 
          
           We also believe that particular companies, organisations, governments and individuals may not always agree on what are the priorities and solutions for Climate action. Indeed, they often don’t. However, there is still great value in having that dialogue with each other and finding inclusive ways to express those diverse points of view. The ${projectName}’s design for prioritisation and funding allocation is intended as an early exploration and demonstration of how such a dialogue can drive funding in practise towards Climate Action in a way that’s inclusive and equitable.`
        },
        {
          question: 'Do I make any financial return from donating?',
          answer: `No. There is no financial return or other benefit from contributing, neither for BP or other contributors. All contributions are donations.`
        },
        {
          question: 'How does my donation determine where bp funding will go? ',
          answer: `bp is using a quadratic funding method to determine funding allocations to projects. Quadratic fund matching favors allocating funds towards projects that receive more donations from a higher number of individuals over projects which may receive high contribution amounts from fewer individuals. You can read more about quadratic funding here or in the ${projectName} whitepaper. In the ${projectName}, a user may select to send 50 USDC to project A and 50 USDC to project B. When the user contributes the USDC to the ${projectName}, the transaciton on the Ethereum blockchain will show 100 USDC going to the ${projectName} smart contracts in total. Off chain, bp is registering through a zero knowledge proof system that this user is allocating 50 USDC to Project A and 50 USDC to Project B through a type of "vote."  When the funding pool from bp is allocated, bp will use quadratic fund matching to determine where the additional funds go based on where the users have choosen to contribute. 

          Key principles of the ${projectName} are inclusion and transparency. For inclusion in the context of Climate action to be meaningful, we believe people should have the opportunity to directly guide where academic research is focused towards. And for transparency, we believe that these governance processess need to be fully open to public scrutiny in word or in code. The purpose of quadratic fund matching in the ${projectName} is to get closer towards these two principles, as it enables contributors to shape the priority and size of contribution towards these academic projects.`
        }
      ]
    }
  ];
  return (
    <section className={styles.faqSection} id="faq">
      <div className="accordianContainer container">
        <h2>FAQ</h2>
        <div className={styles.faqInnerContainer}>
          {accordionData.map(({ title, content }, index) => (
            <FAQItem key={`item-${index}`} title={title} content={content} isLandingPage={true} />
            // <Accordion title={title} content={content} index={index} key={index.toString()} />
          ))}
        </div>
        <div className={styles.viewMore}>
          <Link href="/faq">
            <a>View more FAQs</a>
          </Link>
          {/* <a href="/faq" tabIndex="0">
            View more FAQs
          </a> */}
        </div>
      </div>
    </section>
  );
}
