import PropTypes from 'prop-types';

const ProfileHeader = ({ user }) => {
  const getInitials = () => {
    if (user?.fullname) return user.fullname.charAt(0);
    if (user?.username) return user.username.charAt(0);
    return "U";
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-12">
      <div className="flex flex-col items-center">
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.fullname || user.username || "User"}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-blue-600 text-4xl font-bold shadow-lg">
            {getInitials()}
          </div>
        )}
        <h1 className="text-3xl font-bold text-white mt-4">
          {user?.fullname || user?.username || "User"}
        </h1>
        <p className="text-blue-100">{user?.email || "No email available"}</p>
        {user?.username && (
          <p className="text-blue-200 mt-1">@{user.username}</p>
        )}
      </div>
    </div>
  );
};

ProfileHeader.propTypes = {
  user: PropTypes.shape({
    fullname: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    profileImage: PropTypes.string
  })
};

export default ProfileHeader;
