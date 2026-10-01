import React, { useState, useEffect } from 'react';
import { X, Check, User, Phone, Home, CreditCard } from 'lucide-react';
import { Roommate } from '../types';

interface AddRoommateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roommateData: Omit<Roommate, 'id' | 'status'>, existingId?: string) => void;
  initialData?: Roommate | null;
}

const AVATAR_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#14b8a6', // teal
];

export const AddRoommateModal: React.FC<AddRoommateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentHandle, setPaymentHandle] = useState('');
  const [joinedAt, setJoinedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setRoomNumber(initialData.roomNumber || '');
      setPhone(initialData.phone || '');
      setPaymentHandle(initialData.paymentHandle || '');
      setJoinedAt(initialData.joinedAt);
      setAvatarColor(initialData.avatarColor || AVATAR_COLORS[0]);
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setRoomNumber('');
      setPhone('');
      setPaymentHandle('');
      setJoinedAt(new Date().toISOString().slice(0, 10));
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
      setNotes('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please provide the roommate name.');
      return;
    }

    onSave(
      {
        name: cleanName,
        roomNumber: roomNumber.trim() || undefined,
        phone: phone.trim() || undefined,
        paymentHandle: paymentHandle.trim() || undefined,
        joinedAt,
        avatarColor,
        notes: notes.trim() || undefined,
      },
      initialData?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialData ? 'Edit Roommate Profile' : 'Register New Roommate'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add a roommate to participate in shared flat expenses and rent splits.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Room / Bed */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Room / Bed <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Room 302 Bed A"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Joined Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Join Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={joinedAt}
                onChange={(e) => setJoinedAt(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone / WhatsApp <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+977 98..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* eSewa / Khalti Handle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment ID / Handle <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={paymentHandle}
                onChange={(e) => setPaymentHandle(e.target.value)}
                placeholder="eSewa / Khalti ID"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Avatar Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Profile Accent Color
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setAvatarColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    avatarColor === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Master's Student, coordinates utilities"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialData ? 'Save Changes' : 'Register Roommate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
