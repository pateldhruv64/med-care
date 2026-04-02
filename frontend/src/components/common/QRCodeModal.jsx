import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import { X } from 'lucide-react';

const QRCodeModal = ({ isOpen, onClose, patient }) => {
  if (!isOpen || !patient) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="ui-modal-surface p-8 w-full max-w-sm relative text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <X size={24} />
          </button>

          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Patient ID
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {patient.firstName} {patient.lastName}
          </p>

          <div className="bg-white p-4 rounded-xl border-2 border-slate-100 inline-block">
            <QRCode
              value={JSON.stringify({
                id: patient._id,
                name: `${patient.firstName} ${patient.lastName}`,
                email: patient.email,
              })}
              size={200}
              level="H"
            />
          </div>

          <p className="mt-6 text-sm text-slate-400 dark:text-slate-500">
            Scan this code to access patient records instantly.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QRCodeModal;
