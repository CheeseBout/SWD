import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminSideBar from "../../components/SideBar/AdminSidebar";
import {
  UsersIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/outline";
import {
  blogService,
  userService,
  therapistService,
  adminService,
} from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import RevenueChart from "../../components/Admin/RevenueChart";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: { count: 0 },
    blogs: { count: 0 },
    therapists: { count: 0 },
    revenue: { count: 0 },
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [
          blogsResponse,
          usersResponse,
          therapistsResponse,
          revenueResponse,
        ] = await Promise.all([
          blogService.getAllBlogs(),
          userService.getAllUsers(),
          therapistService.getAllTherapists(),
          adminService.getRevenue(),
        ]);

        const blogs = Array.isArray(blogsResponse)
          ? blogsResponse
          : blogsResponse?.data && Array.isArray(blogsResponse.data)
          ? blogsResponse.data
          : [];

        const users = Array.isArray(usersResponse)
          ? usersResponse
          : usersResponse?.data && Array.isArray(usersResponse.data)
          ? usersResponse.data
          : usersResponse?.data?.users &&
            Array.isArray(usersResponse.data.users)
          ? usersResponse.data.users
          : [];

        const therapists = Array.isArray(therapistsResponse)
          ? therapistsResponse
          : therapistsResponse?.data && Array.isArray(therapistsResponse.data)
          ? therapistsResponse.data
          : [];

        const totalRevenue = revenueResponse?.data?.sum || 0;

        const memberCount = users.filter(
          (user) => user.role === "member" || user.role === "MEMBER"
        ).length;

        setStats({
          blogs: { count: blogs.length },
          users: { count: memberCount },
          therapists: { count: therapists.length },
          revenue: { count: totalRevenue },
        });

        const sortedBlogs = [...blogs]
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.created_at) -
              new Date(a.createdAt || a.created_at)
          )
          .slice(0, 5);

        setRecentBlogs(sortedBlogs);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Total {title}</p>
          <h3 className="text-2xl font-bold mt-1">{value.toLocaleString()}</h3>
        </div>
        <div className="bg-blue-50 rounded-md p-2 h-fit">
          <Icon className="h-6 w-6 text-blue-500" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <AdminSideBar />

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </header>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Members"
                value={stats.users.count}
                icon={UsersIcon}
              />
              <StatCard
                title="Therapists"
                value={stats.therapists.count}
                icon={UsersIcon}
              />
              <StatCard
                title="Blogs"
                value={stats.blogs.count}
                icon={BookOpenIcon}
              />
              <StatCard
                title="Revenue"
                value={stats.revenue.count}
                icon={CurrencyDollarIcon}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <RevenueChart />
              
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-lg font-medium">Recent Blog Posts</h2>
                  <Link
                    to="/admin/blogs"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View all
                  </Link>
                </div>
                <div className="p-6">
                  {recentBlogs.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {recentBlogs.map((blog) => (
                        <div key={blog.id || blog._id} className="py-3">
                          <h3 className="text-base font-medium">{blog.title}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span>
                              {new Date(
                                blog.postDate || blog.created_at
                              ).toLocaleDateString("en-GB")}
                            </span>
                            <span className="mx-1">•</span>
                            <span className="capitalize">
                              {blog.stage || "Draft"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No blog posts yet.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
