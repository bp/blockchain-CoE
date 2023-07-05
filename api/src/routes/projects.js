import express from 'express';
import { getProjects, getProject } from '../services/projects';
import { getContributionPrivate } from '../services/contribution';
import logger from '../logger';
const router = express.Router();

/**
 * Route to get the project details along with user contribution for each projects
 * @name get/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/', async function (req, res) {
  try {
    const { user } = req;
    const projects = await getProjects();
    if (user && user._id) {
      const yourContribution = await getContributionPrivate({
        userId: user._id,
        status: 'success'
      });
      if (yourContribution) {
        const votes = yourContribution.votes;
        projects.forEach((project) => {
          const vote = votes.find((vote) => vote.id === project.id);
          project.yourContribution = vote?.amount;
        });
      }
    }
    return res.status(200).json({ projects });
  } catch (error) {
    logger.error({
      msg: 'ERROR',
      data: error,
      context: req.body,
      user: req.user,
      url: req.originalUrl,
      method: req.method
    });
    return res.status(400).json({ errors: error.message });
  }
});

/**
 * Route to get project by id
 * @name get/:id
 * @param {string} path - Express path
 * @param {string} id - project Id
 * @param {callback} middleware - Express middleware.
 */
router.get('/:id', async function (req, res) {
  try {
    const { id } = req.params;
    const project = await getProject({ id });
    return res.status(200).json({ project });
  } catch (error) {
    return res.status(400).json({ errors: error.message });
  }
});

export default router;
