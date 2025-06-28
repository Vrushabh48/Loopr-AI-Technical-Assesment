import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type ProfileData = {
  name: string;
  email: string;
  designation?: string;
  phone?: string;
};

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${base_url}/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [base_url]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131417] text-gray-300 font-poppins">
        Loading profile...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131417] text-red-500 font-poppins">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#131417] text-white font-poppins flex flex-col">
      {/* Navbar */}
      <div className="bg-[#1A1C22] px-4 sm:px-10 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-3xl font-serifDisplay font-bold text-white">
          Penta
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 text-sm sm:text-base rounded-md font-medium text-white"
        >
          Go to Dashboard
        </button>
      </div>

      {/* Profile Card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-[#1A1C22] p-6 sm:p-8 rounded-xl w-full max-w-md sm:max-w-xl shadow-xl mt-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
            My Profile
          </h2>
          <div className="space-y-5 text-base sm:text-lg">
            <div>
              <p className="text-gray-400">Name</p>
              <p className="font-medium">{profile?.name}</p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="font-medium">{profile?.email}</p>
            </div>
            {profile?.designation && (
              <div>
                <p className="text-gray-400">Role</p>
                <p className="font-medium">{profile.designation}</p>
              </div>
            )}
            {profile?.phone && (
              <div>
                <p className="text-gray-400">Phone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
