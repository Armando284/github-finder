import { useState } from "react";
import { LRUCache } from "adev-lru";

const cache = new LRUCache({ max: 10, ttl: 60000 }); // Max 10 users, TTL 60s

function App() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestTime, setRequestTime] = useState(null);

  const fetchUser = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setError("");
    const startTime = new Date().getTime();

    try {
      // Check cache
      const user = cache.get(username);
      if (user != null) {
        setUserData({ ...user, fromCache: true });
        const endTime = new Date().getTime();
        setRequestTime(endTime - startTime); // Set request time
        setLoading(false);
        return;
      }

      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) throw new Error("User not found");

      const data = await response.json();
      cache.put(username, data); // Save in cache

      const endTime = new Date().getTime();
      setRequestTime(endTime - startTime); // Set request time

      setUserData({ ...data, fromCache: false });
    } catch (err) {
      setError(err.message);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle enter key press to trigger search
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      fetchUser();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Search GitHub User</h2>

      <div className="flex gap-2 mb-4">
        <input
          className="p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyPress} // Listen for Enter key
          placeholder="e.g., torvalds"
        />
        <button
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
          onClick={fetchUser}
          disabled={loading}
        >
          Search
        </button>
      </div>

      {loading && <p className="text-yellow-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {requestTime !== null && <p className="text-gray-400">Request took {requestTime} ms</p>}

      {userData && (
        <div className="bg-gray-800 p-4 rounded shadow-md">
          <img className="w-24 h-24 rounded-full mx-auto mb-2" src={userData.avatar_url} alt="Avatar" />
          <p className="text-lg font-semibold">{userData.name || "Not available"}</p>
          <p className="text-gray-400">@{userData.login}</p>
          <p className="mt-2">Followers: {userData.followers}</p>
          <p className={`mt-2 ${userData.fromCache ? "text-green-400" : "text-blue-400"}`}>
            From Cache: {userData.fromCache ? "Yes ✅" : "No 🚀"}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
