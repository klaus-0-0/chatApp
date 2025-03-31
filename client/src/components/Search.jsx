import axios from "axios";
import { useState } from "react";
import config from "../config";

const Search = () => {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]); // Store users in the state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const SearchUser = async () => {
    setLoading(true);
    setError(null); // Reset error before starting the search
    try {
      const response = await axios.post(`${config.apiUrl}/auth/search`, {
        username,
      });

      // Assuming the response contains an array of users under 'users'
      if (response.data && response.data.users) {
        setUsers(response.data.users); // Store the users in state
      } else {
        setError("No matching users found.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while searching.");
    } finally {
      setLoading(false); // Stop loading after the request
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden">
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-64 h-12 px-0 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all bg-transparent"
        />
        <br />
        <button
          className="w-64 h-12 px-0 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
          onClick={SearchUser}
          disabled={loading} // Disable button while loading
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Display loading, error or results */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div>
        {users.length > 0 && (
          <ul className="mt-4">
            {users.map((user, index) => (
              <li
                key={index}
                className="p-2 text-lg cursor-pointer hover:bg-gray-800"
                onClick={() => console.log(`Selected user ID: ${user.id}  email ${user.email}`)} // Handle user selection
              >
                {user.username}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;
