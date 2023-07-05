import PropTypes from 'prop-types';
import styles from '../../styles/listcard.module.scss';

const ListCard = ({ title, list, ...rest }) => {
  const listItems = () => {
    const items = list.map((item) => <li key={Math.random()}>{item}</li>);
    return <ul>{items}</ul>;
  };

  return (
    <div {...rest} className={styles.listcardItem}>
      <h3>{title}</h3>
      {listItems()}
    </div>
  );
};

ListCard.propTypes = {
  title: PropTypes.string,
  list: PropTypes.array
};

export default ListCard;
