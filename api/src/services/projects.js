import Project from '../models/project';
import { getAllContributions } from './contribution';
import { baselineContribution, getNetwork, chainId, projectName } from '../lib/config';
import { getContract } from './contract';

const projects = [
  {
    id: '1',
    title: 'Beeswax Fuels for Sustainable Satellite Propulsion',
    img: 'project-1.png',
    shortdesc: `The space community expects to see a rapid increase in satellites launched to low Earth orbit over the coming decade led by significant contributions from private space ventures seeking to provide global connectivity via large satellite constellations. The Space Enabled Research Group is conducting a multi-year research effort to investigate the efficacy of candle wax and beeswax as “green propellants” for satellite propulsion that contribute to sustainability both on earth and in space.`,
    desc: [
      `Many new satellites will be “small satellites” lacking onboard propulsion, rendering them unable to quickly deorbit after end of life.  Those that do have onboard propulsion tend to use traditional satellite fuels created through carbon heavy processes and are toxic and environmentally harmful.`,
      `The Space Enabled Research Group is conducting a multi-year research effort to investigate the efficacy of candle waxes as “green propellants” for satellite propulsion. This work follows considerable precedent in the area of wax-based propulsion systems.  While prior work has primarily focused on paraffin wax for launchers and planetary ascent vehicles, this work is focused on small-scale, in-space systems.  Paraffin exhibits theoretical performance on par with state-of-the-art satellite propellants but possesses none of the toxic, carcinogenic, or environmentally harmful characteristics of currently used propellants.  Paraffin, however, is a fossil fuel that is a byproduct of petroleum refining.`,
      `Recent work by Space Enabled has shown that beeswax exhibits theoretical performance slightly better than paraffin but is a renewable fuel, as it is a natural byproduct of beekeeping which can be gathered after bees have abandoned the hive, thereby having no negative impact on bee populations.  Preliminary work has been completed to refine beeswax from beekeeping refuse and centrifugally cast it into useful geometries for rockets.`,
      `The proposed funds would allow for side-by-side experimental testing of paraffin and beeswax to validate theoretical predictions of performance, including the total thrust produce by otherwise identical fuels.  The chemical makeup of beeswax is quite similar to that of paraffin, thereby requiring no configuration changes to rocket chambers built for paraffin.  The funds would also support material characterization of the particular blends of beeswax used in the experiments, which are sourced from a partner organization, the Urban Bee Laboratory.`
    ],
    org: 'MIT Media Lab – Space Enabled Research Group',
    orgdetails: [
      {
        id: '1',
        title: 'About the team',
        content: [
          {
            question:
              'Danielle Wood, Assistant Professor of Media Arts & Sciences and Aeronautics & Astronautics; Director, Space Enabled Research Group, Principal Investigator',
            answer: [
              `Professor Danielle Wood serves as an Assistant Professor in the Program in Media Arts & Sciences and holds a joint appointment in the Department of Aeronautics & Astronautics at the Massachusetts Institute of Technology. Within the Media Lab, Prof. Wood leads the Space Enabled Research Group which seeks to advance justice in Earth's complex systems using designs enabled by space. Prof. Wood is a scholar of societal development with a background that includes satellite design, earth science applications, systems engineering, and technology policy. In her research, Prof. Wood applies these skills to design innovative systems that harness space technology to address development challenges around the world. Prior to serving as faculty at MIT, Professor Wood held positions at NASA Headquarters, NASA Goddard Space Flight Center, Aerospace Corporation, Johns Hopkins University, and the United Nations Office of Outer Space Affairs. Prof. Wood studied at the Massachusetts Institute of Technology, where she earned a PhD in engineering systems, SM in aeronautics and astronautics, SM in technology policy, and SB in aerospace engineering.`
            ]
          },
          {
            question:
              'Javier Stober, Research Engineer, Space Enabled, Co-Investigator and Technical Lead ',
            answer: [
              `Dr. Javier Stober is a Research Engineer in the Space Enabled Research Group.  In that role, he leads the development and operations of the satellite laboratory and fosters collaborations with partnering organizations.  Javier earned Ph.D. and M.S. degrees in Aeronautics and Astronautics from Stanford University, researching novel propellants in the area of experimental hybrid rocket propulsion, as well as B.S. degrees in Mechanical and Aerospace Engineering from the University of Florida.  He has worked at various organizations across the engineering landscape, public and private, small and large, foreign and domestic, including NASA, Honeywell Aerospace, Boeing, and Space Propulsion Group.`
            ]
          }
        ]
      }
    ],
    fundingallocations: ['The funding goal of this project is $150,000.'],
    deliverables: [
      'Material characterization of beeswax at various temperatures between 20 and 100 deg C (melting temperature is 65 deg C).  This includes high-accuracy viscosity and density measurements as well as spectroscopy to confirm the purity of refined beeswax.  These results will be published as a deliverable',
      'Physical demonstration of beeswax burning in a ground-based test which provides thrust per mass of fuel comparison resulting from experimental test campaign using tabletop motor, conducted on campus.  These results will be published as a deliverable.  Videos of the rocket firing will be a deliverable.'
    ],
    goal: 150000000000,
    baselineContribution,
    impact: [
      'Traditional satellite propellants are created using carbon heavy processes and are toxic, carcinogenic, and environmentally harmful.  The anticipated rapid increase in satellites over the next decade may serve to exacerbate this problem if alternative “green fuels” aren’t utilized.',
      'A reduced dependence upon fossil fuels will be required to achieve Net Zero.  Beeswax represents a renewable alternative to paraffin that can be sustainably sourced with no negative impact upon bee colonies.  The scale up of beeswax for propulsion applications would serve to add value to beekeeping, which could lead to increased bee populations and cascading positive impacts due to pollination concerns.  If beeswax is established as a viable alternative to satellite propellants, it is likely to be investigated for other energy applications as well, furthering a reduced dependence upon fossil fuels.'
    ]
  },
  {
    id: '2',
    title: 'The Overstory',
    img: 'project-2.png',
    shortdesc: `Based on Richard Powers’ Pulitzer Prize-winning novel, The Overstory, on trees as social organisms rather than isolated ones. The book presents a radical, urgent new vision of a synergistic, productive interrelationship between humans and nature. Through this project and performance, we will develop a fully immersive experience with mind-bending music as well as innovative interactives and morphing material, to radically change hearts and minds, and to move us to action. As the character Adam says in the novel, “The best arguments in the world won’t change a person’s mind. The only thing that can do that is a good story.” A good story set to powerful music in a magical environment will go even further`,
    desc: [
      `Our next opera – in a long, distinguished line of groundbreaking, high visibility, and technologically innovative, interdisciplinary performance projects – is The Overstory, a work that tells the most urgent story of our generation: the fight for planet earth. With a libretto by UK writer Simon Robson (who wrote the wonderful libretto for our recent, internationally acclaimed Schoenberg in Hollywood), the consultation of author Richard Powers, and the collaboration of faculty and students from the MIT Media Lab’s new Climate and Sustainability Initiative, we will complement the work’s story and sound with an imaginative, immersive design. Using morphable and specially engineered materials (going well beyond the “electronic”) and voices and instruments enhanced through our signature “Hyperinstruments” (that retain human “touch” while producing surprising and subtle tones and textures), the goal is to create a powerful artistic experience that matches the intensity and urgency of Powers’ remarkable novel. The Overstory as an opera has the potential to break new ground artistically and to use the power of sound, sight and story to change the way people think about the relationship between human beings and the natural world in which we live, to the benefit of all of us and to our interconnected future`
    ],
    org: 'MIT Media Lab',
    orgdetails: [
      {
        id: '2',
        title: 'About the team',
        content: [
          {
            question: 'Tod Machover',
            answer: [
              `Leading the team at the MIT Media Lab will be Tod Machover, who is Muriel R. Cooper Professor of Music and Media and director of the Media Lab's Opera of the Future group. Called a “musical visionary” by The New York Times and “America’s most wired composer” by The Los Angeles Times, Machover is an influential composer and inventor, praised for creating music that breaks traditional artistic and cultural boundaries and for developing technologies that expand music’s potential for everyone, from celebrated virtuosi to musicians of all abilities.`,
              `Machover is widely recognized for designing new technologies for music performance and creation, such as Hyperinstruments, “smart” performance systems that extend expression for virtuosi, from Yo-Yo Ma to Prince, as well as for the general public. The popular videogames Guitar Hero and Rock Band grew out of Machover’s group at the Media Lab. His Hyperscore software—which allows anyone to compose original music using lines and colors—has enabled children around the world to have their music performed by major orchestras, chamber music ensembles, and rock bands. Machover is also deeply involved in developing musical technologies and concepts for medical and wellbeing contexts, helping to diagnose and reverse conditions, such as Alzheimer’s disease, or allowing people with cerebral palsy to communicate through music.`,
              `Machover has recently worked on a series of “collaborative city symphonies” to create sonic portraits of cities for, and with, the people who live there. So far, City Symphonies have been created for Toronto, Edinburgh, Perth, Lucerne, Detroit and Philadelphia, and a new series for cities around the world is in the planning stage. Machover is currently at work on several new opera projects—including The Overstory plus brand new productions of his classics VALIS, Brain Opera, and Schoenberg in Hollywood—as well as on works, installations, and technologies that continue to expand individual creativity, while establishing multisensory collaboration and empathy within communities and across the globe.`
            ]
          }
        ]
      }
    ],
    fundingallocations: [
      `bp is proud to support a portion of The Overstory’s total funding requirements through the ${projectName}. Additional funding support will be through the MIT Media Lab and various international sponsors. A total amount of $500,000 is required for the Overstory Overture pre-opera presentations in March 2023. The maximum amount of funding required to complete all key project milestones/deliverables - $3.5M through the complete opera presentation in 2025.`
    ],
    deliverables: [
      'Proof-of-concept for the story including sound and design. We will assemble the creative project team, write a 1st draft of opera text, test of “tree music,” create the prototype AI/machine learning software to morph between “nature” and “music” sounds and vice versa. Presentation of design sketches - June 1, 2022',
      'Performance of Overstory Overture. There will be a World Premiere in New York and Seoul of 35-minute semi-staged version of the “opera teaser,” with interactive music systems, innovative staging technologies, and high-visibility messaging. March 1-31, 2023',
      'World Premiere of The Overstory Presentation of the full opera by a consortium of major opera companies (such as LA Opera and Michigan Opera Theater) and innovative performance venues (such as the Park Avenue Armory in NYC) throughout the U.S., Europe and Asia. Spring and Fall 2025'
    ],
    goal: 500000000000,
    baselineContribution,
    impact: [
      `As the character Adam says in The Overstory, “The best arguments in the world won’t change a person’s mind. The only thing that can do that is a good story.” The Overstory opera approaches the conversation around climate action in a new and novel way, incorporating aspects of music, technology and materials innovation to drive awareness through art. We aspire for this production to extend the ${projectName}’s vision of bringing more individuals into the discussions and resolutions on climate action through an inspiring and welcoming invitation to the table.`
    ]
  },
  {
    id: '3',
    title: 'Global Weather Engineering',
    img: 'project-3.png',
    shortdesc: `In this project, we propose utilizing machine learning to learn the dependence between ship tracks and observed weather conditions and use that knowledge to simulate generative weather with desired properties.`,
    desc: [
      `The thermodynamic engine of the ocean is one of the most powerful modulators of the climate on planet earth. The convection currents in the ocean act as a conveyor moving warm water towards the poles and cooler water to near the equator which in turn has a great effect on short and long range weather. This includes storms, hurricanes and rainfall.`,
      `The largest determinant of the earth’s convective current pattern is the global distribution of snow and cloud coverage, which in turn modulates the pattern of solar reflectivity at the surface of the planet. This in turn generates the pattern of differential heating which drives the pattern of earth’s convective currents.`,
      `Ship tracks, caused by the exhaust released by ships traveling across the ocean can lead to formation of cloud seeds through water molecules collecting around the aerosols from the exhaust can extend for thousands of miles and have already been shown to have significant impacts on climate [Reference]. In this project, we propose to train a machine model that correlates the 2D distribution of snow and cloud coverage to global convective currents and use that model to generate an optimal pattern of solar reflectivity that leads to a target pattern of convective weather currents (e.g. such as might be used to influence rain fall in a desired location). Finally, we propose to investigate whether a fleet of drone ships may be capable of ‘painting’ a target solar reflectivity pattern capable of effecting a desired target convective weather current.`,
      `Climate Engineering is a manipulation of a physical process central to Earth’s climate at a large enough scale to control it. Other examples include aerosol injection, cloud brightening, carbon removal etc. Due to the complex interdependence between physical processes that affect earth’s climate it is hard to predict the local and global scale impacts of proposed climate engineering solutions. While it is possible to model effects of solar geoengineering etc using existing climate models [Reference], current climate models have large uncertainties due to subgrid parameterization of small scale physical processes [Reference].`,
      `The high resolution required by climate models to model the effects of small-scale physical processes on global weather is computationally infeasible using existing compute resources. Recently, machine learning based parameterization has been proposed as an alternative to reduce these current uncertainties in climate models [Reference]. In this project, we propose utilizing machine learning to learn the dependence between ship tracks and observed weather conditions and use that knowledge to simulate generative weather with desired properties.`
    ],
    org: 'MIT Media Lab – Molecular Machines',
    orgdetails: [
      {
        id: '3',
        title: 'About the team',
        content: [
          {
            question: 'Manvitha Ponnapati, Graduate Student',
            answer: [
              `Manvitha Ponnapati is a PhD student at MIT Media Lab. Her primary research focus is engineering proteins by combining large scale physics based modeling and experimental screens. She is also passionate about translating her deep learning and modeling skills to climate modelling. She holds a Masters in Media, Arts and Sciences from MIT Media Lab and Masters in Electronics and Electrical Engineering from Cornell University`
            ]
          },
          {
            question: 'Joseph Jacobson, Associate Professor',
            answer: [
              `Joseph Jacobson is Associate Professor at The Massachusetts Institute of Technology (MIT)  where he leads the MIT Media Lab's Molecular Machines Group and is a founding member of the Center for Bits and Atoms. Together with his students and collaborators, his lab at MIT has been instrumental in pioneering a number of areas within science and engineering including:`,
              `Next Generation Error Correcting Gene Synthesis for programming cells to produce new pharmaceuticals, renewable chemicals, fuels and food; Printed Inorganic Electronics and Electronic Ink (The technology behind the Amazon Kindle and most ebooks); Genomically Recoded Organisms for programmatically building non-natural proteins; Broadly Targeting and Highly Specific CRISPRs for accurate genome editing; Scaling Science for predicting areas of research likely to be of exceptional impact.`,
              `His lab is currently focused on the coupling of Machine Learning and AI together with high throughput synthesis and test to design novel proteins and small molecules for a range of applications  as well as projects in molecular scale device fabrication.`
            ]
          },
          {
            question: 'Ali Ramadhan, Graduate Student',
            answer: [
              `Ali Ramadhan is a graduate student in computational climate science at MIT. He is interested in developing software for modern climate modeling and improving how turbulence is represented in climate models to reduce uncertainties in future climate predictions. He spends most of his time developing Oceananigans.jl, a Julia package for fast and friendly ocean-flavored fluid dynamics on CPUs and GPU, and using it to investigate ocean dynamics on Earth, particularly around Antarctica, and under ice-covered moons. He also spends a lot of time embedding neural networks into differential equations to learn turbulent physical processes missing from climate models.`
            ]
          }
        ]
      }
    ],
    fundingallocations: [
      'The minimum required funding for this project is $20,000 for a portion of deliverables. The maximum funding requirement for this project and the completion of all deliverables is $100,000'
    ],
    deliverables: [
      'Study of the current modeling approaches used to identify and model the effects of ship tracks on weather',
      'Build a machine learning model to learn the forcing function between ship tracks and observed weather patterns',
      'Using the above ML model along with existing climate models to generate ship tracks required for a desired weather outcome',
      'Using the above models to predict feasibility of this approach on a practical scale',
      'An academic report describing the results of our findings'
    ],
    goal: 100000000000,
    baselineContribution,
    impact: [
      'Current shipping industry already is a significant contributor to global emissions. By utilizing our models, we can more accurately predict their impacts on climate change. And better optimize shipping routes.'
    ]
  },
  {
    id: '4',
    title: 'Bike Swarm',
    img: 'project-4.png',
    shortdesc: `The Bike Swarm project is aiming to promote the use of bikes and other forms of sustainable micromobility using a decentralized approach, especially in places that lack bike lanes and other cycling infrastructure.`,
    desc: [
      `This proposal is for funding to do pilots and test deployments of swarm technology in Guadalajara, Mexico. At our City Science Summit in October 2020, the bike swarm team met with government officials, academics, and local bike advocates, to discuss the challenges of cycling in Guadalajara and the potential for the introduction of new technology to develop a safer, environmentally effective and more communal riding ecosystem. This collaboration was done with UdeG (University of Guadalajara), IMEPLAN, the MiBici public bike share system, and local advocacy groups.`,
      `We discussed a potential program with these partners which would utilize the MiBici bike share system and test the bike swarm technology. The tests would allow our team to make observations on the perception of, and impact to, riders utilizing the technology, particularly safety among women.`,
      `“Riding a bike is freedom for women, what road to choose in order to promote your safety. So that the bike in itself has ways to promote our visibility in order to be safe, not to be accosted or harassed.” Libertad Zavala, Mobility and Transportation Director at the Government of Guadalajara, CityScience Summit, October 2020`,
      `Our proposed field work will engage our aforementioned partners in controlled and potentially randomized pilots and test deployments in the City of Guadalajara using readily accessible bikeshare vehicles retrofitted with bike swarm lighting technology. Our research, which will be administered through a series of surveys conducted before and after pilot deployments, will be guided by the following question: Can decentralized mechanisms, such as the bike swarm lighting technology, incentivize and promote the use of bicycles and other forms of sustainable micromobility in areas where infrastructure for such vehicles is limited?`
    ],
    org: 'MIT Media Lab – City Science Group',
    orgdetails: [
      {
        id: '4',
        title: 'About the team',
        content: [
          {
            question: 'Alex Berke, PhD Candidate',
            answer: [
              'Alex Berke is currently a PhD student. Her masters thesis was  about the use of  large location datasets as  public goods  while preserving privacy.',
              'She is a creative computer scientist, civic hacker, and technology architect, with degrees in mathematics and computer science from Brown University.   She has years of industry experience as a technologist, software engineer, and systems architect, with work ranging from data science and machine learning, to developing distributed systems.  She has worked for large companies, as well as led projects within small startups, and has built a variety of technologies from small ideas into scalable solutions',
              'She is also interested in design - both human centric design, and the design of scalable and sustainable solutions for cities'
            ]
          },
          {
            question: 'Thomas Sanchez Lengeling, Research Scientist',
            answer: [
              `Thomas Sanchez Lengeling is an engineer, artist, and scientist with a master's degree from the MIT Media Lab at the Opera of the Future Group and a bachelor's degree in engineer and computer science from the University of Guanajuato in Mexico.`,
              `Before joining the Media Lab, Thomas was working in different creative industries as a technologist and creative coder. He worked in Mexico City, NYC, and Germany. He also worked as a researcher at the MIT Physics Department, where he developed and created technologies to study human color perception.`
            ]
          },
          {
            question: 'Kent Larson, City Science Group Director',
            answer: [
              `Kent Larson directs the City Science (formerly Changing Places) group at the MIT Media Lab. His research focuses on developing urban interventions that enable more entrepreneurial, livable, high-performance districts in cities. To that end, his projects include advanced simulation and augmented reality for urban design, transformable micro-housing for millennials, mobility-on-demand systems that create alternatives to private automobiles, and Urban Living Lab deployments in Hamburg, Andorra, Taipei, and Boston.`,
              `Larson and researchers from his group received the “10-Year Impact Award” from UbiComp 2014. This is a “test of time” award for work that, with the benefit of hindsight, has had the greatest impact over the previous decade.`,
              `Larson practiced architecture for 15 years in New York City, with design work published in Architectural Record, Progressive Architecture, Global Architecture, The New York Times, A+U, and Architectural Digest. The New York Times Review of Books selected his book, Louis I. Kahn: Unbuilt Masterworks (2000) as one of that year’s ten best books in architecture.`,
              `In the past, we have designed a synchronization protocol and algorithm, as well as physical prototypes that we fabricated and tested on our local city streets. We have presented our work at multiple conferences. See our extended abstract from The Conference on Computer-Supported Cooperative Work for a greater conceptual overview and our paper that describes our initial technology and synchronization algorithm. You can also view our demo video here.`,
              `Our initial prototypes were built using simple radiotechnology. Since then we have developed new prototypes that use mesh networking, which allows for easier integration with smartphones and other IoT devices. While our initial tests were with bicycles, the swarm light system was designed to work across any form of sustainable micromobility, such as e-bikes, scooters, and more.`
            ]
          }
        ]
      }
    ],
    fundingallocations: [
      'The funding will go towards modules per bike riders, such as lights, Bluetooth circuits, assembly and shipping costs. There will be a participation stipend per rider to participate in the study and survey. Additionally, funding will cover project planning, media production costs, and travel expenses. The funding goal is 100,000 USDC.'
    ],
    deliverables: [
      'Web page illustrating our results from the pilot',
      'Video documentation from pilots',
      'Survey results capturing the outcomes from pilot participants',
      'Paper documenting our work and results'
    ],
    goal: 100000000000,
    baselineContribution,
    impact: [
      'Many technologies approach the goal of reducing transit emissions through the development of more efficient cars and vehicles, or cleaner energy sources to power these vehicles. Our approach is to instead reduce dependence on fuel intensive vehicles by developing technology that incentivizes and promotes the use of sustainable vehicles that already exist -such as bicycles.'
    ]
  },
  {
    id: '5',
    title: 'Urban Swarms',
    img: 'project-5.jpg',
    shortdesc: `Amongst the heaviest and most polluting urban infrastructures in cities are the urban transportation systems. In recent years, the general vision has been that electrification, sharing, and autonomy will transform mobility making systems more efficient and convenient. Taking these ideas to the next level, we believe that combining these trends with innovations in lightweight infrastructure and distributed robotic systems will be the solution that will provide future cities with sustainable, scalable, and flexible transportation systems.`,
    desc: [
      `In this project, we first aim to prove the suitability of replacing traditional mobility systems with fleets of smaller autonomous and electric multi-functional vehicles. Even if autonomy can increase the use of shared systems by three to up to eight times, vehicles will still be unused for approximately 80% of the time. This inefficiency reflects an underlying opportunity; if vehicles were multi-functional, they could be used for other purposes such as transporting food, deliveries, or even carrying out services such as waste collection or street cleaning. If vehicles were used for different purposes during the day, fewer cars would be required at a city level. At the same time, having fewer cars would require less infrastructure and less urban space, and humans would recover the urban space that for many years has been allocated only for cars.`,
      `Secondly, we aim to study the potential benefit that a swarm system could bring to the issue of the charging of the batteries of these electric vehicles (EVs). Charging issues such as limited driving range or lack of convenient charging infrastructure pose significant obstacles preventing EVs from populating the roads. While there have been numerous proposals for EV charging in the last decade, they are either inconvenient or require expensive and complex infrastructure. A collaborative vehicle swarm system makes it possible to conceive a charging system in which there would be few stations and vehicles could share battery with other vehicles while moving. We believe that this lightweight infrastructure solution can minimize costs and infrastructure availability problems and increase the efficiency of vehicle usage. During the last decades, the need for rethinking transportation has been considered to be critical for fighting climate change. In 2019, the transportation sector globally accounted for 23% of the energy-related CO2 emissions, and this number is expected to keep growing if no action is taken to reimagine mobility systems.`,
      `Electric vehicles (EVs) have been regarded as a key solution to this issue. EVs have a lower environmental impact than combustion engine vehicles, and, at the same time, they can compensate for the irregular supply of some renewable energy sources, which will favor the implementation of micro-grids. Our proposed project can foster vehicle electrification in two ways: First, since EVs have a high purchasing cost but low operating costs, vehicle-sharing might foster their adoption. Second, solving the charging problem would eliminate one of the main obstacles preventing EVs from populating our roads. Moreover, battery sharing could reduce the required battery size, consequently reducing the environmental impact of battery production, which is one of the main ecological drawbacks of EVs.`
    ],
    org: 'MIT Media Lab – City Science Group',
    orgdetails: [
      {
        id: '5',
        title: 'About the team',
        content: [
          {
            question: 'Luis Alonso, Research Scientist',
            answer: [
              `Luis Alonso is a research scientist in the City Science group and Principal Investigator of the Andorra Living Lab Project. He has a PhD in architecture and coordinates the Andorra Living Lab project. He oversees the integration of the group's diverse research topics (energy consumption, city simulation, urban mobility, innovation district, and smart housing) in City Science Network of Collaborative Cities, to provide comprehensive solutions for urban and country challenges, in order to transform cities into more diverse and vibrant "human scale ecosystems."`,
              `Since he is focused on very different lines of research and work, his antidisciplinary approach fits on the Media Lab philosophy: City Science, urban indicators, big data analysis, urban planning, architectural robotics, building design and construction, new and smart materials (free-form transparent energy efficient envelopes and biomedical uses), energy simulation and building efficiency and sustainability, eco-innovation, e-learning and its impact on social networks, new technologies, IoT, etc.`
            ]
          },
          {
            question: 'Arnaud Grignard, Research Affiliate',
            answer: [
              `Arnaud Grignard is a computer scientist specializing in complex systems modeling and information visualization. He received his PhD in Computer Science from l'université Pierre et Marie Curie-UPMC in 2015 where he co-developed a novel approach to agent-based simulation that handles real-time visualization tasks applied both to data and simulation outputs.`,
              `Since 2016, Grignard has been a research scientist in the City Science group at the MIT Media Lab working on multiple applications of agent-based modeling theory using evidence-based or data-driven simulations. He is involved with several collaboration within the CityScience Network that include urban land-use modeling, and mobility and hydraulic simulations. In addition, he is one of the main developers of the open-source community surrounding the CityScience group.`
            ]
          },
          {
            question: 'Eduardo Castello, Research Affiliate',
            answer: [
              `Eduardo is a Marie Curie Fellow in the Human Dynamics and the City Science groups at the MIT Media Lab. He is working with Prof. Alex ('Sandy') Pentland and Prof. Marco Dorigo in order to explore the combination of swarm robotic systems and blockchain technology. Eduardo received his B.Sc.(Hons) Intelligent Systems from Portsmouth University (UK) and his M.Eng. and Ph.D. degrees in Robotics Engineering from Osaka University (Japan). Currently, Eduardo is also working with Kent Larson, Luis Alonso and Arnaud Gringard to develop new solutions for distributed robotic systems in urban environments.`
            ]
          },
          {
            question: 'Naroa Coretti, Ph.D. Student',
            answer: [
              `Naroa Coretti is a PhD student in the City Science group. A mechanical engineer with a master's degree in industrial (mech.) engineering, Naroa's research is focused on future mobility modes.`,
              `One of her projects, the MIT Autonomous Bicycle Project, explores how to transform bicycle-sharing systems to offer a more attractive and efficient solution for users. By bringing the convenience of on-demand mobility to bicycle sharing systems will solve some of the current challenges faced with bike-share programs, including redistribution, and in addition, it will incentivize increased use of shared lightweight transport.`,
              `She designed and built an autonomous bicycle that can be requested on-demand, will drive to the user, and then will behave as a regular bicycle during the journey before returning to autonomous mode to pick up its next rider.`
            ]
          },
          {
            question: 'Kent Larson, Director',
            answer: [
              `Kent Larson directs the City Science (formerly Changing Places) group at the MIT Media Lab. His research focuses on developing urban interventions that enable more entrepreneurial, livable, high-performance districts in cities. To that end, his projects include advanced simulation and augmented reality for urban design, transformable micro-housing for millennials, mobility-on-demand systems that create alternatives to private automobiles, and Urban Living Lab deployments in Hamburg, Andorra, Taipei, and Boston.`,
              `Larson and researchers from his group received the “10-Year Impact Award” from UbiComp 2014. This is a “test of time” award for work that, with the benefit of hindsight, has had the greatest impact over the previous decade. Larson practiced architecture for 15 years in New York City, with design work published in Architectural Record, Progressive Architecture, Global Architecture, The New York Times, A+U, and Architectural Digest. The New York Times Review of Books selected his book, Louis I. Kahn: Unbuilt Masterworks (2000) as one of that year’s ten best books in architecture.`,
              `This team has previously conducted research in a fleet of lightweight autonomous tricycles (PEVs) that was simulated to work as a bio-inspired swarm, using methods such as multi-place foraging and stigmergy to pick up waste in the area of Kendall (see Project page, Publication). The results showed that a swarm was able to handle the waste management in an effective and self-organized manner, without any external information source. This initial study proved this system to be more efficient than current approaches.`
            ]
          }
        ]
      }
    ],
    fundingallocations: [
      '$20,000 will be allocated towards building the initial model, and a subsequent $20,000 would be allocated to data analysis and validation of the model. In total, to complete all deliverables, the project requires $160,000.'
    ],
    deliverables: [
      'A realistic simulation model that shows the possibilities of a swarm of multi-functional vehicles in an urban environment. This model will focus on our two main goals: 1) mobility solutions (transporting people) and 2) battery sharing',
      'An academic paper that analyzes the performance of these solutions under different scenarios and with different parameters (e.g., number of vehicles, demand, speeds, etc.)',
      'A customizable open-source software ready to build a community of researchers to test their own hypotheses, with a ready-to-use solution for public entities (e.g., governments, city halls) to customize the resultant software to their needs'
    ],
    goal: 162000000000,
    baselineContribution,
    impact: [
      'The proposed project presents an effective way to reduce the number of vehicles in cities by increasing their usage. Currently, cars are unused 95% of the time. While it is estimated that sharing and autonomy will increase vehicle utilization rate, vehicles will still be unused for approximately 80% of the time. With multi-functional vehicles, vehicles could ideally reach a point of zero idle time by finding the appropriate mix of tasks, drastically reducing the number of vehicles needed at a city level. This would reduce the environmental impact of vehicle manufacturing and the need for infrastructure, including less space required for parking lots and roads. In turn, this urban space could be used for other purposes, such as bike lanes, parks, or safer and more convenient sidewalks.'
    ]
  }
];

export const getProjects = async () => {
  const projects = await Project.find({}).lean();
  const { climateDaoContractAddress } = getNetwork(chainId);
  const contract = await getContract({ address: climateDaoContractAddress });
  if ((projects.length && projects[0].isQudaraticFundingDone) || contract.cancelTransactionHash) {
    return projects;
  } else {
    const contributions = await getAllContributions();
    const res = projects.map((project) => {
      let projectContribution;
      if (contributions.length) {
        projectContribution = contributions.find(
          (contribution) => contribution.projectId === project.id
        );
      }
      return {
        ...project,
        userContribution: projectContribution?.userContribution || 0,
        totalContribution: projectContribution?.totalContribution || baselineContribution
      };
    });
    return res;
  }
};

export const getProject = async (query) => {
  return Project.findOne(query).lean();
};

export const insertProjects = async () => {
  const availableProjects = await Project.find({});
  if (availableProjects.length === 0) {
    await Project.insertMany(projects);
  }
};

export const updateManyProjects = async (query, update) => {
  return Project.updateMany(query, update);
};

export const updateProject = async (query, update) => {
  return Project.findOneAndUpdate(query, update, { new: true });
};
