import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminSideBar from "../../components/Admin/AdminSidebar";
import {
  UsersIcon,
  BookOpenIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowSmUpIcon,
  ArrowSmDownIcon,
} from "@heroicons/react/outline";
import { blogService } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: { count: 0, trend: 5.2 },
    blogs: { count: 0, trend: 12.5 },
    sessions: { count: 0, trend: -3.4 },
    revenue: { count: 0, trend: 8.7 },
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const blogsResponse = await blogService.getAllBlogs();
        const blogs = Array.isArray(blogsResponse) ? blogsResponse : 
                     (blogsResponse?.data && Array.isArray(blogsResponse.data)) ? 
                     blogsResponse.data : [];
        
        setStats(prev => ({
          ...prev,
          blogs: { ...prev.blogs, count: blogs.length }
        }));
        
        const sortedBlogs = [...blogs].sort((a, b) => 
          new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
        ).slice(0, 5);
        
        setRecentBlogs(sortedBlogs);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend }) => (
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
      <div className="flex items-center mt-4">
        {trend > 0 ? (
          <ArrowSmUpIcon className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowSmDownIcon className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {Math.abs(trend)}%
        </span>
        <span className="text-gray-500 text-sm ml-1">from previous month</span>
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
                title="Users" 
                value={stats.users.count} 
                icon={UsersIcon} 
                trend={stats.users.trend} 
              />
              <StatCard 
                title="Blogs" 
                value={stats.blogs.count} 
                icon={BookOpenIcon} 
                trend={stats.blogs.trend} 
              />
              <StatCard 
                title="Sessions" 
                value={stats.sessions.count} 
                icon={CalendarIcon} 
                trend={stats.sessions.trend} 
              />
              <StatCard 
                title="Revenue" 
                value={stats.revenue.count} 
                icon={CurrencyDollarIcon} 
                trend={stats.revenue.trend} 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-lg font-medium">Recent Blog Posts</h2>
                  <Link 
                    to="/manage/blogs" 
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
                              {new Date(blog.postDate || blog.created_at).toLocaleDateString('en-GB')}
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

              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-medium">Quick Actions</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <Link
                      to="/manage/blogs/create"
                      className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <BookOpenIcon className="h-5 w-5 mr-2" />
                      Create New Blog Post
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <UsersIcon className="h-5 w-5 mr-2" />
                      Manage User Accounts
                    </Link>
                    <Link
                      to="/appointments"
                      className="flex items-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      View Appointments
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
