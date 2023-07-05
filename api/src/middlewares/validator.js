const { validationResult, check } = require('express-validator');
import { ethers } from 'ethers';
import { chainId, types, getNetwork, VotingPeriod } from '../lib/config';
import { getVotingPeriodStatus } from '../lib/utils';

/**
 * Validates whether voting is in progress.
 *
 * @param {Request} req - HTTP request object.
 * @param {Response} res - HTTP response object.
 * @param {function} next - Callback argument to the middleware function.
 */
export const onlyDuringVoting = async (req, res, next) => {
  const votingPeriodStatus = await getVotingPeriodStatus();
  if (votingPeriodStatus === VotingPeriod.DURING) {
    return next();
  } else {
    return res.status(400).json({ errors: 'Can contribute only during voting period' });
  }
};

/**
 * Validates whether voting period is over.
 *
 * @param {Request} req - HTTP request object.
 * @param {Response} res - HTTP response object.
 * @param {function} next - Callback argument to the middleware function.
 */
export const onlyAfterVoting = async (req, res, next) => {
  const votingPeriodStatus = await getVotingPeriodStatus();
  if (votingPeriodStatus === VotingPeriod.POST) {
    return next();
  } else {
    return res.status(400).json({ errors: 'Can call this only after voting period is over' });
  }
};

export const validateUser = () => {
  return [
    check('address').not().isEmpty().withMessage('address is required'),
    check('address', 'invalid address').custom((value) => {
      return ethers.utils.isAddress(value);
    })
  ];
};

export const validateLogin = () => {
  return [
    check('address').not().isEmpty().withMessage('address is required'),
    check('signature').not().isEmpty().withMessage('signature is required'),
    check('address', 'invalid address').custom((value) => {
      return ethers.utils.isAddress(value);
    })
  ];
};

export const validateNotification = () => {
  return [check('email').not().isEmpty().isEmail().withMessage('Not a valid email')];
};

export const validateContribution = () => {
  return [
    check('contribution').not().isString().withMessage('should be a numeric value'),
    check('data.value').not().isString().withMessage('should be a numeric value')
  ];
};

export const validateEnquiry = () => {
  return [
    check('name').exists({ checkFalsy: true }).withMessage('name is required'),
    check('email')
      .exists({ checkFalsy: true })
      .withMessage('email is required')
      .bail()
      .isEmail()
      .withMessage('Not a valid email'),
    check('message').exists({ checkFalsy: true }).withMessage('message is required')
  ];
};

/**
 * Validates the request body in each request and handles the error.
 *
 * @param {Request} req - HTTP request object.
 * @param {Response} res - HTTP response object.
 * @param {function} next - Callback argument to the middleware function.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(400).json({
    errors: extractedErrors
  });
};

/**
 * Validates the signature in the request.
 *
 * @param {Request} req - HTTP request object.
 * @param {Response} res - HTTP response object.
 * @param {function} next - Callback argument to the middleware function.
 */
export const validateSigner = (req, res, next) => {
  const account = req.user;
  const { data, domain, signature } = req.body;
  if (ethers.utils.verifyTypedData(domain, types, data, signature) !== account.address) {
    res.status(400).json({ message: 'invalid signature' });
  } else {
    return next();
  }
};

/**
 * Validates whether the user is logged in.
 *
 * @param {Request} req - HTTP request object.
 * @param {Response} res - HTTP response object.
 * @param {function} next - Callback argument to the middleware function.
 */
export const validateSession = (req, res, next) => {
  const { user } = req;
  if (user && user._id) {
    return next();
  } else {
    res.status(401).json({ errors: ['Unauthorized'] });
  }
};

export const contributionSchema = {
  signature: {
    notEmpty: true,
    isLength: {
      errorMessage: 'invalid signature',
      options: [{ min: 132, max: 132 }]
    },
    errorMessage: 'invalid signature',
    custom: {
      errorMessage: 'invalid signature',
      options: async (signature, { req }) => {
        if (
          ethers.utils.verifyTypedData(req.body.domain, types, req.body.data, signature) !==
          req.user.address
        ) {
          throw new Error();
        }
      }
    }
  },
  'data.from': {
    notEmpty: true,
    errorMessage: 'invalid address',
    custom: {
      errorMessage: 'invalid address',
      options: async (from, { req }) => {
        if (req.user.address === from) {
          return false;
        } else {
          throw new Error();
        }
      }
    }
  },
  'data.to': {
    notEmpty: true,
    errorMessage: 'invalid address',
    custom: {
      errorMessage: 'invalid address',
      options: async (to, { req }) => {
        if (getNetwork(req.body.domain.chainId).climateDaoContractAddress !== to) {
          throw new Error();
        }
      }
    }
  },
  'data.nonce': {
    notEmpty: true,
    errorMessage: 'invalid nonce'
  },
  'data.value': {
    notEmpty: true,
    errorMessage: 'invalid value',
    isInt: {
      errorMessage: 'invalid value',
      options: [
        {
          min: 1000000,
          max: 20000000000 // max 20k usdc per user
        }
      ]
    }
  },
  'data.validBefore': {
    notEmpty: true,
    errorMessage: 'invalid timestamp',
    isInt: true
  },
  'data.validAfter': {
    notEmpty: true,
    errorMessage: 'validAfter cannot be empty',
    isInt: true
  },
  'domain.name': {
    notEmpty: true,
    errorMessage: 'invalid domain'
  },
  'domain.version': {
    notEmpty: true,
    errorMessage: 'invalid version'
  },
  'domain.verifyingContract': {
    notEmpty: true,
    errorMessage: 'invalid address',
    custom: {
      errorMessage: 'invalid address',
      options: async (address) => {
        if (getNetwork(chainId).usdcContractAddress !== address) {
          throw new Error();
        }
      }
    }
  },
  'domain.chainId': {
    notEmpty: true,
    isInt: true,
    errorMessage: 'invalid chainId',
    custom: {
      errorMessage: 'invalid chainId',
      options: async (id) => {
        if (chainId !== id) {
          throw new Error();
        }
      }
    }
  },
  votes: {
    notEmpty: true,
    isArray: true,
    custom: {
      errorMessage: 'invalid vote array',
      options: async (arr, { req }) => {
        if (arr.length === 5) {
          const totalVote = arr.reduce((total, currentValue) => {
            const isValidVote = typeof currentValue.amount === 'number' && currentValue.amount >= 0;
            if (!isValidVote) {
              throw new Error();
            }
            return total + currentValue.amount;
          }, 0);
          if (totalVote !== req.body.data.value) {
            throw new Error();
          }
        } else {
          throw new Error();
        }
      }
    }
  }
};

/**
 * Validates whether the user logged is admin.
 *
 * @param {Request} req - HTTP request object.
 * @param {Response} res - HTTP response object.
 * @param {function} next - Callback argument to the middleware function.
 */
export const onlyAdmin = (req, res, next) => {
  const { user } = req;
  if (user && user.role === 'admin') {
    return next();
  } else {
    res.status(401).json({ errors: ['Unauthorized'] });
  }
};

/**
 * Validates whether the user has completed kyc process.
 *
 * @param {Request} req - HTTP request object.
 * @param {Response} res - HTTP response object.
 * @param {function} next - Callback argument to the middleware function.
 */
export const ifKYCCompleted = (req, res, next) => {
  const { user } = req;
  if (user?.kyc === 'A') {
    return next();
  } else {
    res.status(401).json({ errors: ['KYC verification failed'] });
  }
};
