import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import FAQItem from '../components/common/faqItem';
import { useAppContext } from '../contexts/state';
import styles from '../styles/faq-page.module.scss';
import { getSectionStyle } from '../lib/helper';
import { projectName } from '../lib/config';
export default function Faqs({ faqs }) {
  const {
    state: { alerts, cookieConsent }
  } = useAppContext();
  const router = useRouter();

  React.useEffect(() => {
    document.documentElement.lang = 'en-us';
  }, []);

  const menu = [
    { title: `About ${projectName}`, path: '#AboutActionClimateDAO' },
    { title: 'Donating', path: '#Donating' },
    { title: 'Fund matching allocation', path: '#FundMatchingAllocation' },
    { title: 'Project progress', path: '#ProjectProgress' },
    { title: 'Contacting us', path: '#ContactingUs' }
  ];

  return (
    <section className={getSectionStyle(alerts, cookieConsent)}>
      <div className={['container', styles.faqSection].join(' ')}>
        <h2 className={styles.heading}>FAQs</h2>
        <div
          style={{
            position: 'relative',
            bottom: '3.5rem'
            // position: 'sticky',
            // top: '0',
            // background: 'white',
            // zIndex: '1',
          }}>
          <div className="menuContainer" style={{ margin: '0 auto', maxWidth: '90rem' }}>
            <div className="topnav">
              {menu.map((each, index) => (
                <Link href={each.path} key={`id-${index}`}>
                  <a className={router.asPath.indexOf(each.path) > -1 ? 'active' : null}>
                    {each.title}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.faqs}>
          {faqs &&
            faqs.map(({ title, content, id }, index) => (
              <FAQItem key={`faq-${index}`} title={title} content={content} id={id} />
            ))}
        </div>
      </div>
    </section>
  );
}

Faqs.propTypes = {
  faqs: PropTypes.array
};

export async function getStaticProps() {
  const faqs = [
    {
      id: 'AboutActionClimateDAO',
      title: `About ${projectName}`,
      content: [
        {
          question: `What is the ${projectName}?`,
          answer: `The ${projectName} Decentralized Autonomous Organization (DAO) is an application for donating to research and impact projects with the potential of accelerating the world’s transition to Net Zero carbon emissions. The funding provided from these donations will allocated to academic projects through a pseudo-anonymized, semi-private quadratic funding method in a decentralized application built on the public Ethereum blockchain. The ${projectName} will also employ a zero knowledge proof verification of where the funding will be allocated as determined by the choices of the participants.`
        },
        {
          question: `What are the key principles of the ${projectName}?`,
          answer: `"Innovation with purpose": using technology in new and novel ways as to address acute challenges in accelerating the world’s energy transition to Net Zero before 2050. This type of innovation is adaptive and iterative. While we build applications and features in small steps, these projects are intended to move fast, to yield practical and shareable insights, and to form a pathway towards a broad, and ultimately global, impact.

          “Transparency”: being transparent in word and in code decisions or trade-offs for end users. We will communicate the alternative design and technology choices that are available and the rationale of decisions and design choices we make. Whether in organizational or technological domains, while we do not assume to have all the “right” answers, we do aspire to make our hypotheses readily accessible for feedback and collaboration. Public blockchain applications we build are examples to promote this open approach to innovation in the energy industry.
          
          "Inclusion": we recognize in the context of the world’s energy transition that governments, institutions, companies, and every private individual in the world is a stakeholder. By inclusion, we mean that these diverse stakeholders should be represented in technological innovation that we develop and should benefit from its outcomes. Furthermore, participation should be equitable to align community interest best with funding resources.`
        },
        {
          question: `How does the ${projectName} work? `,
          answer: `This initial stage of the ${projectName} is akin to a proof of concept, based on donations towards academic research projects related to Climate action. The initial proof of concept will mimic a quadratic funding round and is intended to develop into a sustainable DAO that manages a host of activities. The ${projectName} will use the state of the art in public blockchain and privacy-enhancing technologies, demonstrate how public companies can positively engage with such open-source technologies from an innovation, legal, financial, tax and security perspective.`
        },
        {
          question: `What is the longer term vision for the ${projectName}?`,
          answer: `Our longer term vision is to bring together a community to iterate and improve upon the ${projectName} as well to develop a sustainable mechanism to further the world’s Net Zero ambitions in a manner that provably demonstrates the highest standards governance, transparency and inclusion afforded by technology.`
        },
        {
          question: 'Where can I see your roadmap?',
          answer: `The longer term Roadmap for the ${projectName} is included in the Whitepaper, available on this website. Our roadmap will largely be determined by user response and feedback on the first funding round in the ${projectName}.`
        },
        {
          question: `Who is behind ${projectName}?`,
          answer: `bp has created the ${projectName} with support from industry and academic partners. The development of the ${projectName} is driven by our Blockchain Centre of Expertise, which sits within bp's Digital Science and Engineering team, in collaboration with EY’s public Blockchain pratice. We’re also collaborating with Least Authority for security audits of the ${projectName} smart contracts and with Acuant for compliance with KYC (know your customer)/AML (anti-money laundering) regulations. The Climate research projects that will receive donations through the ${projectName} are from the MIT Media Lab.`
        },
        {
          question: `Why is the ${projectName} open for public participation?`,
          answer: `Climate change is a global challenge of unprecedented scale, and we believe action towards Climate change requires unprecedented levels of collaboration between companies, organisations and individuals.  

          Collaboration is often hard when trust is lacking - transparency is what drives trust. By enhancing transparency through word and code, as in the ${projectName}, we can accelerate building trust and collaboration towards Climate action. 
          
           We also believe that particular companies, organisations, governments and individuals may not always agree on what are the priorities and solutions for Climate action. Indeed, they often don’t. However, there is still great value in having that dialogue with each other and finding inclusive ways to express those diverse points of view. The ${projectName}’s design for prioritisation and funding allocation is intended as an early exploration and demonstration of how such a dialogue can drive funding in practise towards Climate Action in a way that’s inclusive and equitable.`
        },
        {
          question: `What are the projects in ${projectName} for?`,
          answer: `The projects in the ${projectName} contribute towards Climate action and have deliverables that are open-sourced, public goods. 

          The ${projectName} is an early stage  project, so we had to limit the number of projects that can receive funding while we test this funding mechanism. All of the projects were independently submitted to our team by the MIT Media Lab, and bp has no influence or rights in creating or running these projects. If this funding mechanism proves successful, we aim to develop this further. In the future, we aim to support a larger pool of projects in which there is a higher degree of independence of around project selection. Refer to the Whitepaper on the ${projectName} site and our roadmap for more details of how we plan to continiously increase the level of the overall decentralisation of this system.`
        },
        {
          question: `Why did bp create the ${projectName}?`,
          answer: `bp's ambition is to be a Net Zero company 2050 or sooner and to help the world get to Net Zero. Within bp, our Digital Science and Engineering team is exploring how novel technologies like blockchain can accelerate that ambition. The ${projectName} is bp’s first exploration of public blockchain. Through the ${projectName}, we aim to test how the world’s Net Zero ambitions can be accelerated in a way that could be more innovative, transparent and inclusive than traditional Climate and ESG-related funding methods.`
        },
        {
          question: 'What is bp’s position on cryptocurrencies?',
          answer: `bp does not endorse any Cryptocurrencies.  

          We do believe that public blockchain is a promising emerging technology, which can have material impact on trust-based systems, governance, consumer engagement and developing novel digital assets. We generally look to use select Cryptocurrencies in a “functional” manner, e.g. Ether or USDC, as part of developing and running blockchain-based applications.`
        },
        {
          question: `How did bp select the projects in the ${projectName}?`,
          answer: `The projects in the ${projectName} contribute towards Climate action and have deliverables that are open-sourced, public goods. 

          The ${projectName} is an early stage  project, so we had to limit the number of projects that can receive funding while we test this funding mechanism. All of the projects were independently submitted to our team by the MIT Media Lab, and bp has no influence or rights in creating or running these projects. If this funding mechanism proves successful, we aim to develop this further. In the future, we aim to support a larger pool of projects in which there is a higher degree of independence of around project selection. Refer to the Whitepaper on the ${projectName} site and our roadmap for more details of how we plan to continiously increase the level of the overall decentralisation of this system.`
        },
        {
          question: 'Why did bp only work with the MIT Media Lab?',
          answer: `The team at MIT Media Lab are leaders in technology-driven research - you can find out more about their piooneering work here. bp explored the ${projectName} concept with several universities and organizations, who demonstrated interest in participating. Many institutions are not yet able to accept cryptocurrencies for their funding needs, which was a requirement for this phase of the ${projectName}. In the future, as more institutions are able handle Cryptocurrencies, we look forward to sourcing an increasingly more diverse set of academic partners and projects.`
        },
        {
          question: 'Why did bp choose to build on Ethereum?',
          answer: `Ethereum has a rich and growing developer, researcher and user community, which is aligned to our principles for the ${projectName} and from which we can also learn. Ethereum has also demonstrated its ability to iterate as a core protocol, which we believe will be a crucial component of the long term success of any public blockchain.`
        },
        {
          question: 'Will bp continue to build on Ethereum?',
          answer: `bp will continue to evaluate public blockchain platforms we choose to build on by (1) user demand as evidenced by decentralized application participation, (2) developer activity as evidenced by new and novel projects, and (3) technology growth as evidence by the ability of the core protocol to iterate and further decentralize. Thus, in terms of our future platform, that's a decision that is not yet set in stone - we like what Ethereum has to offer and the roadmap of the platform, but equally we're continuously assessing the innovation, maturity and adoption of multiple other public blockchain platforms and layer two solutions. We will be openly sharing any lessons we learn out of building the ${projectName} on Ethereum.`
        },
        {
          question: `Who are bp’s target users for the ${projectName}?`,
          answer: `As this is an early stage, exploratory launch,  we expect that it will be primarily existing decentralized applicaton users on Ethereum, who may have participated in other DAO's or participated in other public goods funding initiatives, who are more likely to participate. We anticipate that in this early launch version users will primarily come from those that are already familiar with Ethereum to at least a basic degree (e.g. already have and are using an Ethereum wallet). In the future, our aim is to develop this into a fully mainstream product - Climate change is an issue impacting all of us, so we want to enable the maximum of organisations and people to participate, while preserving our principles.`
        },
        {
          question: 'Will bp create a token?',
          answer: `No, we are not creating a token for the ${projectName}. Our high level Roadmap, as it stands today, is published in the ${projectName} whitepaper and can give an indication of future use cases we consider; in the future, we may consider a token if it supports one of those use cases.`
        },
        {
          question: 'Will bp make money from this?',
          answer: `No. bp is funding the development of the ${projectName} and contributing 250,000 USDC to the academic projects up for funding by the DAO. These donations are akin to charitable donations, and bp receives no financial benefit or intellectual property as a result.`
        },
        {
          question: 'Will other users/participants/contributors make money from this?',
          answer: `No. Participants who contribute to the funding pool of the ${projectName} are making a donation towards the academic projects up for funding by the DAO. They will receive no financial benefit as a result.`
        },
        {
          question:
            'Don’t blockchains use a lot of energy, which contributes towards Climate Change?',
          answer: `Ethereum does use electricity as part of the consensus mechamism for securing the blockchain, called “Proof of Work”. The exact carbon footprint of Ethereum depends on the power source of the electricity used to carry out proof of work. The more the world moves towards low and zero carbon electricity sources, the smaller the carbon footprint would be.   

          Additionally, Ethereum's roadmap includes a transition to a system called “Proof of Stake”. This would enable the Ethereum blockchain, and applications running on the Ethereum blockchain, such as the ${projectName}, to stop relying on higher levels of electricity for proof of work. Proof of stake is estimated to reduce energy usage in Ethereum to 99% less than current levels. 
          
          bp's position is to only use public blockchains that employ proof of stake or are making the transition to proof of stake. The amount of users and decentralized applications on Ethereum continues to exceed alternatives. Users and developer activity is a core component of success for the initial funding round of the ${projectName}. Futher iterations of the ${projectName} will evaluate alternatives. bp does not expect to be the sole driver of any public blockchain adoption - we will navigate to where users and developers choose to participate. 
          
          You can find a fuller discussion of the differences between Proof of Work and Proof of Stake, and the Ethereum roadmap, here:  
           
          https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/ `
        }
      ]
    },
    {
      id: 'Donating',
      title: 'Donating',
      content: [
        {
          question: 'What are donations for?',
          answer: `All donations will go towards academic research projects related to Climate action. These are projects at the cutting edge of research and aim to accelerate the world's transition to Net Zero carbon. These donations could make a big impact in getting them delivered.`
        },
        {
          question: 'What is the total amount of donations?',
          answer: `The total amount of donations the ${projectName} can hold in its current phase is 1,000,000 USDC. From that, 250,000 USDC is donated by BP, and up to another 750,000 USDC can be donated by other individual participants. The limit on the total amount of donations for the ${projectName} was determined on the maximum funding requests from the projects.`
        },
        {
          question: 'Why should I contribute?',
          answer: `Candidly, there is no financial benefit from contributing. Contributing is akin to a donation towards the academic projects up for funding by the DAO. By contributing, you get to participate in the leading edge of innovation between public blockchain technologies and sustainability, and you get the opportunity to shape where Climate action research is focused towards.`
        },
        {
          question: 'How much can I donate?',
          answer: `The limit on individual domantions is 9,999USDC per person. If you elect to pay for your own transaction fees, you can donate anywhere from 1USDC and upwards to the 9,999 USDC limit. If you elect to have bp pay transaction fees on your behalf, the minimum total contribution amount must be 100 USDC. This means you can give 50 USDC to Project A and 50 USDC to Project B for a total of 100 USDC and have bp pay transaction fees on your behalf.`
        },
        {
          question: 'How much is BP contributing?',
          answer: `BP is contributing a total of 250,000 USDC in the form of a donation.`
        },
        {
          question: 'Do I make any financial return from donating?',
          answer: `No. There is no financial return or other benefit from contributing, neither for BP or other contributors. All contributions are donations.`
        },
        {
          question: 'How do I donate?',
          answer: `On the ${projectName} website, you can explore all five projects that will receive funding from the ${projectName}. If you'd like to contribute to a project, simply enter the amount you would like to contribute and add that to your basket. When you have finished adding projects to your basket, you can proceed to the checkout. At check out, you will be prompted to complete a KYC process so that bp can conduct the ${projectName} in compliance. After having completed KYC, you will use your wallet through Metamask or the Coinbase wallet browser extension to send your transaction to contribute to the ${projectName}. The ${projectName} will only be accepting donations in the form of USDC.`
        },
        {
          question: 'What happens after I donate?',
          answer: `After you donate, you will see a confirmation that your transaction was received. When the Ethereum network has processed the transaction, you will see confirmation that the transaction has been completed. After the ${projectName} funding round is completed, if you have provided your email address, you will receive updates from the projects as they deliver on their milestones.`
        }
      ]
    },

    {
      id: 'FundMatchingAllocation',
      title: 'Fund matching allocation',
      content: [
        {
          question: 'How does my donation determine where bp funding will go?',
          answer: `bp is using a quadratic funding method to determine funding allocations to projects. Quadratic fund matching favors allocating funds towards projects that receive more donations from a higher number of individuals over projects which may receive high contribution amounts from fewer individuals. You can read more about quadratic funding here or in the ${projectName} whitepaper. In the ${projectName}, a user may select to send 50 USDC to project A and 50 USDC to project B. When the user contributes the USDC to the ${projectName}, the transaciton on the Ethereum blockchain will show 100 USDC going to the ${projectName} smart contracts in total. Off chain, bp is registering through a zero knowledge proof system that this user is allocating 50 USDC to Project A and 50 USDC to Project B through a type of "vote."  When the funding pool from bp is allocated, bp will use quadratic fund matching to determine where the additional funds go based on where the users have choosen to contribute. 

          Key principles of the ${projectName} are inclusion and transparency. For inclusion in the context of Climate action to be meaningful, we believe people should have the opportunity to directly guide where academic research is focused towards. And for transparency, we believe that these governance processess need to be fully open to public scrutiny in word or in code. The purpose of quadratic fund matching in the ${projectName} is to get closer towards these two principles, as it enables contributors to shape the priority and size of contribution towards these academic projects.`
        },
        {
          question: 'How does bp use a zero knowledge proof for this process?',
          answer: `bp is using a zero knowledge proof to verify the fund allocation process in the ${projectName}. For example, when a user chooses to send 50 USDC to Project A and 50 USDC to Project B, these donations are encrypted and stored off chain by bp. When the total amount of donations are received and the ${projectName} fund raising period has completed, bp will verify a zero knowledge proof on chain to determine the total donations per project to employ in the quadratic fund matching methodology. bp notes the trust assumptions from users required in this design in the ${projectName} whitepaper, and our intention is to lessen trust assumptions in the future.`
        },
        {
          question: 'How can we verify that bp matched funds correctly?',
          answer: `Observers of the ${projectName} will be able to see the total amount of funds that are transferred to the ${projectName}.However, external observers will not be able to see where users have allocated their funds. Users and observers will need to trust that bp does not censor any of the 'votes' of the ${projectName}.  Still, the 250,000 USDC from bp will be shown to be allocated in the distributions to the Climate action projects after the initial funding period has ended.  In the future, there are alternative designs that bp may employ to allow for observers and users to verify that all votes for funding allocation are included. More details are in the ${projectName} whitepaper.`
        }
      ]
    },
    {
      id: 'ProjectProgress',
      title: 'Project progress',
      content: [
        {
          question: 'Where can I see the project progress?',
          answer: `After the ${projectName} funding round, bp will be posting about project progress on our blog here. (link)`
        },
        {
          question: 'How do I know that funds went to the projects?',
          answer: `On chain, users will be able to verify that all USDC collected in the ${projectName} is sent to the Ethereum accounts of the respective projects. However, the funding recipients will be converting the USDC they received back into US dollars for final use. bp has contracted with the MIT Media Lab to ensure a compliant use of funds.`
        }
      ]
    },

    {
      id: 'ContactingUs',
      title: 'Contacting us',
      content: [
        {
          question: `How can I contact ${projectName} team?`,
          answer: `You can contact the ${projectName} team through the address on this site. Alternatively, you can email climatedaosupport@bp.com for support or climatedaopress@bp.com for press inquiries.`
        }
      ]
    }
  ];
  return {
    props: { faqs }
  };
}
