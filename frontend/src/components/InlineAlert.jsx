const InlineAlert = ({ type = 'error', message }) => {
  if (!message) {
    return null;
  }

  return <p className={`form-alert form-alert-${type}`}>{message}</p>;
};

export default InlineAlert;
