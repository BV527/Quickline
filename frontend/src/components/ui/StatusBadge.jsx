const StatusBadge = ({ status, children }) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'waiting':
        return 'status-badge status-waiting';
      case 'serving':
        return 'status-badge status-serving';
      case 'completed':
        return 'status-badge status-completed';
      default:
        return 'status-badge status-waiting';
    }
  };

  return (
    <span className={getStatusClass(status)}>
      {children || status}
    </span>
  );
};

export default StatusBadge;