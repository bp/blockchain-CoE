import PropTypes from 'prop-types';
import styles from '../styles/qfbreakdown.module.scss';
import { checkConversion } from '../lib/config';
import { _currencyFormatter } from '../lib/helper';
export default function QFBreakdown({ data }) {
  return (
    <section className={[styles.qfBreakdownSection, 'row'].join(' ')}>
      <div className={styles.warning}>
        Warning : This can only be done once and cannot be reverted.
      </div>
      <div className={styles.warning}>
        Note: Proof generation can take around 15 minutes. The confirm transaction button will be
        enabled only after proof generation.
      </div>
      <div style={{ 'overflow-x': 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Projects</th>
              <th>Baseline Donation</th>
              <th>User Donation</th>
              <th>Matching Donation</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((item) => {
                return (
                  <tr key={item.id}>
                    <td>{item.projectTitle}</td>
                    <td>USDC {_currencyFormatter(checkConversion(item.baselineContribution))}</td>
                    <td>USDC {_currencyFormatter(checkConversion(item.userFunding).toFixed())}</td>
                    <td>USDC {_currencyFormatter(item.matchedAmount.toFixed())}</td>
                    <td style={{ color: '#009B00' }}>
                      USDC {_currencyFormatter(checkConversion(item.totalContribution).toFixed())}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

QFBreakdown.propTypes = {
  data: PropTypes.array
};
