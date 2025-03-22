import React, { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-toastify";
import AdminSideBar from "../../components/SideBar/AdminSidebar";

export default function Transactions() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [groupedPayments, setGroupedPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPayments, setExpandedPayments] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await adminService.getAllTransactions();

        if (response?.data) {
          setAllTransactions(response.data);
          processTransactions(response.data);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast.error("Failed to load transaction data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const processTransactions = (transactions) => {
    const paymentMap = new Map();

    transactions.forEach((transaction) => {
      const paymentId = transaction.payment?._id;

      if (paymentId) {
        if (!paymentMap.has(paymentId)) {
          paymentMap.set(paymentId, {
            payment: transaction.payment,
            transactions: [],
            latestTransactionDate: new Date(transaction.createdAt),
          });
        }

        paymentMap.get(paymentId).transactions.push(transaction);

        const transactionDate = new Date(transaction.createdAt);
        if (transactionDate > paymentMap.get(paymentId).latestTransactionDate) {
          paymentMap.get(paymentId).latestTransactionDate = transactionDate;
        }
      }
    });

    const groupedPaymentsArray = Array.from(paymentMap.values()).sort(
      (a, b) => b.latestTransactionDate - a.latestTransactionDate
    );

    setGroupedPayments(groupedPaymentsArray);
  };

  const filteredPayments = groupedPayments.filter((paymentGroup) => {
    if (statusFilter !== "all") {
      const hasMatchingStatus = paymentGroup.transactions.some(
        (transaction) =>
          transaction.status.toLowerCase() === statusFilter.toLowerCase()
      );
      if (!hasMatchingStatus) return false;
    }

    if (platformFilter !== "all") {
      const hasMatchingPlatform = paymentGroup.transactions.some(
        (transaction) =>
          transaction.platform.toLowerCase() === platformFilter.toLowerCase()
      );
      if (!hasMatchingPlatform) return false;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const reservationId = paymentGroup.payment.reservation;
      const transactionCodes = paymentGroup.transactions.map(
        (t) => t.transactionCode
      );
      const totalAmount = paymentGroup.payment.totalPrice.toString();

      return (
        reservationId.toLowerCase().includes(searchLower) ||
        transactionCodes.some((code) =>
          code.toLowerCase().includes(searchLower)
        ) ||
        totalAmount.includes(searchLower)
      );
    }

    return true;
  });

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(
    indexOfFirstPayment,
    indexOfLastPayment
  );
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  const toggleExpand = (paymentId) => {
    setExpandedPayments((prev) => ({
      ...prev,
      [paymentId]: !prev[paymentId],
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatusBadge = ({ status }) => {
    let bgColor = "bg-gray-100 text-gray-800";

    if (status === "PAID") bgColor = "bg-green-100 text-green-800";
    else if (status === "PENDING") bgColor = "bg-yellow-100 text-yellow-800";
    else if (status === "CANCELLED") bgColor = "bg-red-100 text-red-800";

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {status}
      </span>
    );
  };

  const PlatformBadge = ({ platform }) => {
    const bgColor =
      platform === "web"
        ? "bg-blue-100 text-blue-800"
        : "bg-purple-100 text-purple-800";

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {platform}
      </span>
    );
  };

  const PhaseBadge = ({ phase }) => {
    const bgColor =
      phase === "DEPOSIT"
        ? "bg-indigo-100 text-indigo-800"
        : "bg-pink-100 text-pink-800";

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {phase}
      </span>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <AdminSideBar />

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Transaction History
          </h1>
          <p className="text-gray-600">
            View and manage all transaction records
          </p>
        </header>

        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search reservations, transactions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={platformFilter}
              onChange={(e) => {
                setPlatformFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Platforms</option>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-medium uppercase text-gray-500">
              Total Payments
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {groupedPayments.length}
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-medium uppercase text-gray-500">
              Paid Transactions
            </div>
            <div className="text-2xl font-bold text-green-600">
              {allTransactions.filter((t) => t.status === "PAID").length}
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-medium uppercase text-gray-500">
              Pending Transactions
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {allTransactions.filter((t) => t.status === "PENDING").length}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner />
            <span className="ml-2 text-gray-500">Loading transactions...</span>
          </div>
        ) : (
          <>
            {}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                {currentPayments.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-gray-500 text-lg">
                      No transactions found
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Payment Details
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Reservation ID
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th scope="col" className="relative px-3 py-3">
                          <span className="sr-only">Details</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentPayments.map((paymentGroup) => (
                        <React.Fragment key={paymentGroup.payment._id}>
                          {}
                          <tr className="hover:bg-gray-50">
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                Payment #{paymentGroup.payment._id.slice(-6)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(paymentGroup.payment.createdAt)}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {paymentGroup.payment.reservation.slice(-6)}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(
                                  paymentGroup.payment.totalPrice
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                Paid:{" "}
                                {formatCurrency(paymentGroup.payment.totalPaid)}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  paymentGroup.payment.status === "COMPLETED"
                                    ? "bg-green-100 text-green-800"
                                    : paymentGroup.payment.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {paymentGroup.payment.status}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() =>
                                  toggleExpand(paymentGroup.payment._id)
                                }
                                className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                              >
                                {expandedPayments[paymentGroup.payment._id] ? (
                                  <>
                                    <span>Hide</span>
                                    <FiChevronUp className="ml-1" />
                                  </>
                                ) : (
                                  <>
                                    <span>Details</span>
                                    <FiChevronDown className="ml-1" />
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>

                          {}
                          {expandedPayments[paymentGroup.payment._id] && (
                            <tr>
                              <td colSpan="5" className="px-3 py-4 bg-gray-50">
                                <div className="rounded-md overflow-hidden">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th
                                          scope="col"
                                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                          Transaction ID
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                          Code
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                          Date
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                          Amount
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                          Status
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                          Phase
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                          Platform
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {paymentGroup.transactions
                                        .sort(
                                          (a, b) =>
                                            new Date(b.createdAt) -
                                            new Date(a.createdAt)
                                        )
                                        .map((transaction) => (
                                          <tr
                                            key={transaction._id}
                                            className="hover:bg-gray-50"
                                          >
                                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                                              {transaction._id.slice(-6)}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                                              {transaction.transactionCode}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                                              {formatDate(
                                                transaction.createdAt
                                              )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                                              {formatCurrency(
                                                transaction.amount
                                              )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                              <StatusBadge
                                                status={transaction.status}
                                              />
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                              <PhaseBadge
                                                phase={transaction.phase}
                                              />
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                              <PlatformBadge
                                                platform={transaction.platform}
                                              />
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {}
            {filteredPayments.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {indexOfFirstPayment + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(
                            indexOfLastPayment,
                            filteredPayments.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {filteredPayments.length}
                        </span>{" "}
                        payments
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">First</span>
                          <span>&laquo;</span>
                        </button>
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <span>&lsaquo;</span>
                        </button>

                        {}
                        {[...Array(totalPages).keys()].map((number) => {
                          const pageNumber = number + 1;

                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 &&
                              pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageNumber
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                          ) {
                            return (
                              <span
                                key={pageNumber}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}

                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <span>&rsaquo;</span>
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Last</span>
                          <span>&raquo;</span>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
