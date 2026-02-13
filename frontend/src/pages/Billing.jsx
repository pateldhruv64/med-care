import { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { motion } from 'framer-motion';
import { FileText, DollarSign, Plus, CheckCircle, Printer } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import CreateInvoiceModal from '../components/billing/CreateInvoiceModal';
import InvoicePrintModal from '../components/billing/InvoicePrintModal';

const Billing = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const { data } = await api.get('/invoices');
            setInvoices(data);
        } catch (error) {
            toast.error('Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    };

    const markAsPaid = async (id) => {
        try {
            await api.put(`/invoices/${id}/pay`);
            toast.success('Invoice marked as paid');
            fetchInvoices();
        } catch (error) {
            toast.error('Update Failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Billing & Invoices</h1>
                {(user.role === 'Admin' || user.role === 'Receptionist') && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20 text-sm"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Create Invoice</span>
                        <span className="sm:hidden">Create</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-slate-500">Loading invoices...</div>
                ) : (
                    invoices.map((invoice, index) => (
                        <motion.div
                            key={invoice._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-cyan-50 p-3 rounded-lg text-cyan-500">
                                        <FileText size={24} />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                    >
                                        {invoice.status}
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg text-slate-800 mb-1">Invoice #{invoice._id.slice(-6)}</h3>
                                <p className="text-slate-500 text-sm mb-4">{new Date(invoice.date).toLocaleDateString()}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Patient:</span>
                                        <span className="font-medium text-slate-700">{invoice.patient?.firstName} {invoice.patient?.lastName}</span>
                                    </div>
                                    {invoice.doctor && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Doctor:</span>
                                            <span className="font-medium text-slate-700">{invoice.doctor?.firstName} {invoice.doctor?.lastName}</span>
                                        </div>
                                    )}
                                    {invoice.invoiceType && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Type:</span>
                                            <span className={`font-medium ${invoice.invoiceType === 'Pharmacy' ? 'text-green-600' : 'text-blue-600'}`}>{invoice.invoiceType}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-100">
                                        <span className="text-slate-700">Total:</span>
                                        <span className="text-cyan-600">₹{invoice.total}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedInvoice(invoice)}
                                    className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm flex items-center justify-center gap-1"
                                >
                                    <Printer size={14} />
                                    Print / PDF
                                </button>
                                {(user.role === 'Admin' || user.role === 'Receptionist') && invoice.status === 'Unpaid' && (
                                    <button
                                        onClick={() => markAsPaid(invoice._id)}
                                        className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm flex items-center justify-center gap-1"
                                    >
                                        <CheckCircle size={16} /> Mark Paid
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
                {!loading && invoices.length === 0 && (
                    <div className="col-span-full text-center py-10 text-slate-500">No invoices found.</div>
                )}
            </div>

            <CreateInvoiceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onInvoiceCreated={fetchInvoices}
            />

            <InvoicePrintModal
                invoice={selectedInvoice}
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
            />
        </div>
    );
};

export default Billing;

