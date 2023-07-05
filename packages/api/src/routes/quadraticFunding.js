import express from 'express';
import { getAllContributionsForQF } from '../services/contribution';
import { checkTally } from '../elgamal';
import { onlyAdmin } from '../middlewares/validator';
import { getProjects } from '../services/projects';
import { baselineContribution } from '../lib/config';

const router = express.Router();

/**
 * Route to split the matching pool and return the quadratic breakdown for each of the projects
 * this activity can be performed only by the admin(s).
 * @name get/
 * @param {string} path - Express path
 * @param {middleware} onlyAdmin - middleware to validate whether admin performs the functionality
 * @param {callback} middleware - Express middleware.
 */
router.get('/', onlyAdmin, async function (req, res) {
  try {
    const totalContributions = await getAllContributionsForQF();
    const projects = await getProjects();
    let tally = checkTally(totalContributions);
    let qfBreakdown = [];

    projects.find((project) => {
      tally.map((item) => {
        if (project.id === item.id) {
          let contribution = {
            id: item.id,
            voteTally: item.voteTally,
            userFunding: item.userFunding,
            matchedAmount: item.matchedAmount,
            totalContribution: baselineContribution + item.userFunding + item.matchedAmount * 1e6,
            baselineContribution: baselineContribution,
            projectTitle: project.title
          };
          qfBreakdown = [...qfBreakdown, contribution];
        }
      });
    });
    return res.status(200).json(qfBreakdown);
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

export default router;
