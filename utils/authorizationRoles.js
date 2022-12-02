const roleAuthorizer = (userRole, actionRole) => {
  switch (userRole) {
    case 'super-admin':
      return true;
    case 'admin':
      if (actionRole === 'super-admin' || actionRole === 'admin') {
        return false;
      }
      return true;

    case 'moderator':
      if (
        actionRole === 'super-admin' ||
        actionRole === 'admin' ||
        actionRole === 'moderator'
      ) {
        return false;
      }
      return true;
    case 'instructor':
      if (
        actionRole === 'super-admin' ||
        actionRole === 'admin' ||
        actionRole === 'moderator' ||
        actionRole === 'instructor'
      ) {
        return false;
      }
      return true;

    default:
      return false;
  }
};

module.exports = roleAuthorizer;
