import { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InvoicePrintModal = ({ invoice, isOpen, onClose }) => {
    const printRef = useRef();

    if (!isOpen || !invoice) return null;

    const handlePrint = () => {
        const content = printRef.current;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice #${invoice._id.slice(-6)}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; }
                    .invoice { max-width: 800px; margin: 0 auto; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #06b6d4; padding-bottom: 20px; margin-bottom: 30px; }
                    .hospital-name { font-size: 28px; font-weight: 800; color: #06b6d4; }
                    .hospital-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
                    .invoice-title { text-align: right; }
                    .invoice-title h2 { font-size: 24px; color: #1e293b; }
                    .invoice-title p { font-size: 13px; color: #64748b; margin-top: 2px; }
                    .meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .meta-box { background: #f8fafc; padding: 15px 20px; border-radius: 8px; width: 48%; }
                    .meta-box h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
                    .meta-box p { font-size: 14px; color: #334155; margin: 3px 0; }
                    .meta-box .name { font-weight: 700; font-size: 16px; color: #1e293b; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th { background: #0891b2; color: white; padding: 12px 16px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
                    th:first-child { border-radius: 8px 0 0 0; }
                    th:last-child { border-radius: 0 8px 0 0; text-align: right; }
                    td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                    td:last-child { text-align: right; font-weight: 600; }
                    tr:nth-child(even) { background: #f8fafc; }
                    .total-row { display: flex; justify-content: flex-end; margin-top: 10px; }
                    .total-box { background: #06b6d4; color: white; padding: 15px 30px; border-radius: 8px; text-align: right; min-width: 250px; }
                    .total-box .label { font-size: 13px; opacity: 0.8; }
                    .total-box .amount { font-size: 28px; font-weight: 800; }
                    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
                    .status-paid { background: #dcfce7; color: #16a34a; }
                    .status-unpaid { background: #fee2e2; color: #dc2626; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
                    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
                    .info-row .label { color: #64748b; }
                    .info-row .value { font-weight: 600; color: #1e293b; }
                    @media print { body { padding: 20px; } .no-print { display: none; } }
                </style>
            </head>
            <body>
                ${content.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8"
                >
                    {/* Modal Header */}
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800">Invoice Preview</h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrint}
                                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm transition-colors"
                            >
                                <Printer size={16} />
                                Print / Save PDF
                            </button>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Printable Content */}
                    <div ref={printRef} className="p-8" style={{ backgroundColor: 'white', color: '#1e293b' }}>
                        <div className="invoice">
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #06b6d4', paddingBottom: '20px', marginBottom: '25px' }}>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#06b6d4' }}>🏥 MediCare Hospital</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>123 Health Street, Medical City</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Phone: +91 98765-43210 | Email: info@medicare.com</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h2 style={{ fontSize: '22px', color: '#1e293b', fontWeight: 700 }}>INVOICE</h2>
                                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>#{invoice._id.slice(-6)}</p>
                                    <span className={`status-badge ${invoice.status === 'Paid' ? 'status-paid' : 'status-unpaid'}`}
                                        style={{
                                            display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginTop: '8px',
                                            background: invoice.status === 'Paid' ? '#dcfce7' : '#fee2e2',
                                            color: invoice.status === 'Paid' ? '#16a34a' : '#dc2626',
                                        }}
                                    >
                                        {invoice.status}
                                    </span>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', gap: '16px' }}>
                                <div style={{ background: '#f8fafc', padding: '15px 20px', borderRadius: '8px', width: '48%' }}>
                                    <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '8px' }}>Bill To</h4>
                                    <p style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>{invoice.patient?.firstName} {invoice.patient?.lastName}</p>
                                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{invoice.patient?.email}</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '15px 20px', borderRadius: '8px', width: '48%' }}>
                                    <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '8px' }}>Invoice Details</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                        <span style={{ color: '#64748b' }}>Date:</span>
                                        <span style={{ fontWeight: 600 }}>{new Date(invoice.date || invoice.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    {invoice.doctor && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                            <span style={{ color: '#64748b' }}>Doctor:</span>
                                            <span style={{ fontWeight: 600 }}>Dr. {invoice.doctor?.firstName} {invoice.doctor?.lastName}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: '#64748b' }}>Type:</span>
                                        <span style={{ fontWeight: 600 }}>{invoice.invoiceType || 'Consultation'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ background: '#0891b2', color: 'white', padding: '12px 16px', textAlign: 'left', fontSize: '13px', borderRadius: '8px 0 0 0' }}>#</th>
                                        <th style={{ background: '#0891b2', color: 'white', padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>Description</th>
                                        <th style={{ background: '#0891b2', color: 'white', padding: '12px 16px', textAlign: 'right', fontSize: '13px' }}>Qty</th>
                                        <th style={{ background: '#0891b2', color: 'white', padding: '12px 16px', textAlign: 'right', fontSize: '13px' }}>Price</th>
                                        <th style={{ background: '#0891b2', color: 'white', padding: '12px 16px', textAlign: 'right', fontSize: '13px', borderRadius: '0 8px 0 0' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items && invoice.items.length > 0 ? (
                                        invoice.items.map((item, i) => {
                                            const price = item.cost || item.price || item.amount || 0;
                                            const qty = item.quantity || 1;
                                            return (
                                                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>{i + 1}</td>
                                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>{item.description || item.name}</td>
                                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', textAlign: 'right' }}>{qty}</td>
                                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', textAlign: 'right' }}>₹{price}</td>
                                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', textAlign: 'right', fontWeight: 600 }}>₹{qty * price}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>1</td>
                                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>{invoice.invoiceType || 'Consultation'} Service</td>
                                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', textAlign: 'right' }}>1</td>
                                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', textAlign: 'right' }}>₹{invoice.total}</td>
                                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', textAlign: 'right', fontWeight: 600 }}>₹{invoice.total}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Total */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <div style={{ background: '#06b6d4', color: 'white', padding: '15px 30px', borderRadius: '8px', textAlign: 'right', minWidth: '200px' }}>
                                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Grand Total</div>
                                    <div style={{ fontSize: '28px', fontWeight: 800 }}>₹{invoice.total?.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                                <p>Thank you for choosing MediCare Hospital</p>
                                <p style={{ marginTop: '4px' }}>This is a computer-generated invoice. No signature required.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default InvoicePrintModal;
