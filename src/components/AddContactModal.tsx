import React from 'react';

interface AddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddContactModal({
    isOpen,
    onClose,
    onSuccess
}: AddContactModalProps) {
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        try {
            const response = await fetch('/api/contact-channels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    facebook: formData.get('facebook'),
                    line: formData.get('line'),
                    email: formData.get('email'),
                    technician_phone: formData.get('technician_phone'),
                    manager_phone: formData.get('manager_phone'),
                    address: formData.get('address'),
                }),
            });

            if (response.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error adding contact:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">เพิ่มข้อมูลการติดต่อ</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Facebook
                            </label>
                            <input
                                type="text"
                                name="facebook"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="ลิงก์ Facebook"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Line ID
                            </label>
                            <input
                                type="text"
                                name="line"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Line ID"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="อีเมล"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                เบอร์โทรช่าง
                            </label>
                            <input
                                type="text"
                                name="technician_phone"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="เบอร์โทรช่าง"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                เบอร์โทรผู้จัดการ
                            </label>
                            <input
                                type="text"
                                name="manager_phone"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="เบอร์โทรผู้จัดการ"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ที่อยู่
                            </label>
                            <textarea
                                name="address"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                                placeholder="ที่อยู่"
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                บันทึก
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}