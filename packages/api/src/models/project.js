import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  id: {
    type: String
  },
  title: {
    type: String
  },
  img: {
    type: String
  },
  shortdesc: {
    type: String
  },
  desc: [
    {
      type: String
    }
  ],
  org: {
    type: String
  },
  orgdetails: [
    {
      id: {
        type: String
      },
      title: {
        type: String
      },
      content: [
        {
          question: {
            type: String
          },
          answer: [
            {
              type: String
            }
          ]
        }
      ]
    }
  ],
  fundingallocations: [
    {
      type: String
    }
  ],
  deliverables: [
    {
      type: String
    }
  ],
  goal: {
    type: Number
  },
  communityContribution: {
    type: Number
  },
  totalContributionToday: {
    type: Number
  },
  baselineContribution: {
    type: Number
  },
  impact: [
    {
      type: String
    }
  ],
  userContribution: {
    type: Number
  },
  matchingContribution: {
    type: Number
  },
  totalContribution: {
    type: Number
  },
  isQudaraticFundingDone: {
    type: Boolean,
    default: false
  },
  distributionTransactionHash: {
    type: String
  }
});

const Project = mongoose.model('project', ProjectSchema);

export default Project;
