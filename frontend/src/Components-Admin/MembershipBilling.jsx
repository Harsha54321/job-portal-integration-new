import React, { useState, useEffect } from 'react'
import './MembershipHub.css'
import api from '../api/axios'

// Single combined view of Orders (payments) + Subscriptions (access), so
// admin doesn't have to cross-check two separate screens. One row = one
// order, with its linked subscription's access status shown alongside it.
export const MembershipBilling = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const [highlightId, setHighlightId] = useState(null);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await api.get('admin/billing/');
            setRecords(res.data || []);
        } catch (err) {
            console.error('Failed to fetch billing records:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // Notification click deep-link: open the specific record once loaded.
    // 'order' highlights match on the row's own id (Payment.id).
    // 'subscription' highlights match on the row's subscription_id, since
    // subscription_cancelled notifications carry a Subscription id, not an
    // Order id — but both live on the same combined row here.
    useEffect(() => {
        if (loading || !records || records.length === 0) return;

        const type = sessionStorage.getItem('adminNotifHighlightType');
        const id = sessionStorage.getItem('adminNotifHighlightId');

        if ((type === 'order' || type === 'subscription') && id) {
            const match = type === 'order'
                ? records.find(r => String(r.id) === String(id))
                : records.find(r => String(r.subscription_id) === String(id));

            if (match) {
                setSelected(match);
                setHighlightId(type === 'order' ? match.id : match.subscription_id);
            }
            sessionStorage.removeItem('adminNotifHighlightType');
            sessionStorage.removeItem('adminNotifHighlightId');
        }
    }, [loading, records]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredRecords = records.filter((item) => {
        const term = search.toLowerCase();
        return (
            String(item.id).includes(term) ||
            (item.user_email || "").toLowerCase().includes(term) ||
            (item.employer_name || "").toLowerCase().includes(term) ||
            (item.company_name || "").toLowerCase().includes(term) ||
            (item.plan_name || "").toLowerCase().includes(term) ||
            (item.status || "").toLowerCase().includes(term) ||
            (item.subscription_status || "").toLowerCase().includes(term)
        );
    });

    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirst, indexOfLast);
    const nPages = Math.ceil(filteredRecords.length / recordsPerPage) || 1;

    if (selected) {
        return (
            <div className="SubOrders-container">
                <div className="SubOrders-detail">
                    <button className="SubOrders-detail-back" onClick={() => setSelected(null)}>
                        ← Back to Billing
                    </button>
                    <h2>Order #{selected.id}</h2>

                    <div className="SubOrders-detail-row">
                        <span className="SubOrders-detail-label">Employer ID</span>
                        <span className="SubOrders-detail-value">{selected.employer_id ?? 'N/A'}</span>
                    </div>
                    <div className="SubOrders-detail-row">
                        <span className="SubOrders-detail-label">Employer Name</span>
                        <span className="SubOrders-detail-value">{selected.employer_name || 'N/A'}</span>
                    </div>
                    <div className="SubOrders-detail-row">
                        <span className="SubOrders-detail-label">Company</span>
                        <span className="SubOrders-detail-value">{selected.company_name || 'N/A'}</span>
                    </div>
                    <div className="SubOrders-detail-row">
                        <span className="SubOrders-detail-label">User</span>
                        <span className="SubOrders-detail-value">{selected.user_email || 'N/A'}</span>
                    </div>
                    <div className="SubOrders-detail-row">
                        <span className="SubOrders-detail-label">Plan</span>
                        <span className="SubOrders-detail-value">{selected.plan_name || 'N/A'}</span>
                    </div>

                    <h3 style={{ margin: '18px 0 4px', fontSize: '14px', color: '#6b7280' }}>Payment</h3>
                    <div className="SubOrders-detail-row">
                        <span className="SubOrders-detail-label">Amount</span>
                        <span className="SubOrders-detail-value">
                            {selected.currency || 'INR'} {selected.amount}
                        </span>
                    </div>
                    <div className="SubOrders-detail-row">
                        <span className="SubOrders-detail-label">Payment Status</span>
                        <span className="SubOrders-detail-value">
                            <span className={`sub-status-badge ${(selected.status || '').toLowerCase()}`}>
                                {selected.status || 'N/A'}
                            </span>
                        </span>
                    </div>
                    <div className="SubOrders-detail-row">
                        <span className="SubOrders-detail-label">Payment Method</span>
                        <span className="SubOrders-detail-value">{selected.payment_method || 'N/A'}</span>
                    </div>
                    <div className="SubOrders-detail-row">
                        <span className="SubOrders-detail-label">Razorpay Order ID</span>
                        <span className="SubOrders-detail-value">{selected.razorpay_order_id || 'N/A'}</span>
                    </div>
                    <div className="SubOrders-detail-row">
                        <span className="SubOrders-detail-label">Razorpay Payment ID</span>
                        <span className="SubOrders-detail-value">{selected.razorpay_payment_id || 'N/A'}</span>
                    </div>
                    {selected.failure_reason && (
                        <div className="SubOrders-detail-row">
                            <span className="SubOrders-detail-label">Failure Reason</span>
                            <span className="SubOrders-detail-value">{selected.failure_reason}</span>
                        </div>
                    )}
                    <div className="SubOrders-detail-row">
                        <span className="SubOrders-detail-label">Order Date</span>
                        <span className="SubOrders-detail-value">{formatDate(selected.created_at)}</span>
                    </div>

                    <h3 style={{ margin: '18px 0 4px', fontSize: '14px', color: '#6b7280' }}>Access (Subscription)</h3>
                    {selected.subscription_id ? (
                        <>
                            <div className="SubOrders-detail-row">
                                <span className="SubOrders-detail-label">Subscription ID</span>
                                <span className="SubOrders-detail-value">#{selected.subscription_id}</span>
                            </div>
                            <div className="SubOrders-detail-row">
                                <span className="SubOrders-detail-label">Access Status</span>
                                <span className="SubOrders-detail-value">
                                    <span className={`sub-status-badge ${(selected.subscription_status || '').toLowerCase()}`}>
                                        {selected.subscription_status || 'N/A'}
                                    </span>
                                </span>
                            </div>
                            <div className="SubOrders-detail-row">
                                <span className="SubOrders-detail-label">Access Start</span>
                                <span className="SubOrders-detail-value">{formatDate(selected.subscription_start_date)}</span>
                            </div>
                            <div className="SubOrders-detail-row">
                                <span className="SubOrders-detail-label">Access End</span>
                                <span className="SubOrders-detail-value">{formatDate(selected.subscription_end_date)}</span>
                            </div>
                        </>
                    ) : (
                        <div className="SubOrders-detail-row">
                            <span className="SubOrders-detail-label">Access Status</span>
                            <span className="SubOrders-detail-value">
                                No subscription was created for this order (payment likely not successful)
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="SubOrders-container">
            <div className="SubOrders-header">
                <h2>Billing</h2>
                <p>Every plan purchase, with payment status and access status shown together</p>
            </div>

            <div className="SubOrders-search-wrapper">
                <input
                    type="text"
                    placeholder="Search by order ID, employer, company, plan or status"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
            </div>

            <div className="SubOrders-table-wrapper">
                <table className="SubOrders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            {/* <th>Subscription ID</th> */}
                            <th>Employer ID</th>
                            <th>Employer Name</th>
                            <th>Company</th>
                            <th>Plan</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Access</th>
                            <th>Valid Until</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRecords.length > 0 ? (
                            currentRecords.map((item) => (
                                <tr
                                    key={item.id}
                                    className={String(item.id) === String(highlightId) || String(item.subscription_id) === String(highlightId) ? 'highlighted-row' : ''}
                                >
                                    <td>#{item.id}</td>
                                    {/* <td>{item.subscription_id ? `#${item.subscription_id}` : '—'}</td>  */}
                                    <td>{item.employer_id ?? 'N/A'}</td>
                                    <td>{item.employer_name || 'N/A'}</td>
                                    <td>{item.company_name || 'N/A'}</td>
                                    <td>{item.plan_name || 'N/A'}</td>
                                    <td>{item.currency || 'INR'} {item.amount}</td>
                                    <td>
                                        <span className={`sub-status-badge ${(item.status || '').toLowerCase()}`}>
                                            {item.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        {item.subscription_status ? (
                                            <span className={`sub-status-badge ${item.subscription_status.toLowerCase()}`}>
                                                {item.subscription_status}
                                            </span>
                                        ) : (
                                            <span className="sub-status-badge">—</span>
                                        )}
                                    </td>
                                    <td>{formatDate(item.subscription_end_date)}</td>
                                    <td>
                                        <button className="SubOrders-view-btn" style={{"background":"#1E88E5","color":"white"}} onClick={() => setSelected(item)}>
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="SubOrders-no-records">
                                    {loading ? "Loading billing records..." : "No records found"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="SubOrders-pagination">
                    <p>Page {currentPage} of {nPages}</p>
                    <div>
                        <button style={{"background":"#1E88E5","color":"white"}} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
                        <button style={{"background":"#1E88E5","color":"white"}} onClick={() => setCurrentPage(p => Math.min(nPages, p + 1))} disabled={currentPage === nPages}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
