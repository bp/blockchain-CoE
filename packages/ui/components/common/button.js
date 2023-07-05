import PropTypes from 'prop-types';

const Button = ({ title, loading, ...rest }) => {
  return (
    <button {...rest}>
      {loading ? (
        <>
          <div className="spinner"></div>
        </>
      ) : (
        <>{title}</>
      )}
    </button>
  );
};

Button.propTypes = {
  title: PropTypes.string,
  loading: PropTypes.bool
};

export default Button;
