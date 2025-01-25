import React from 'react';

interface Contact {
    id: string;
    company_name: string;
    tax_id: string;
    facebook: string;
    line: string;
    email: string;
    technician_phone: string;
    manager_phone: string;
    address: string;
}

interface EditContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contact: Contact;
}

export default function EditContactModal({
    isOpen,
    onClose,
    onSuccess,
    contact
}: EditContactModalProps) {
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        try {
            const response = await fetch('/api/contact-channels', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: contact.id,
                    company_name: formData.get('company_name'),
                    tax_id: formData.get('tax_id'),
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
                onClose();
            }
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">แก้ไขข้อมูลการติดต่อ</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ชื่อบริษัท
                            </label>
                            <input
                                type="text"
                                name="company_name"
                                defaultValue={contact.company_name}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="ชื่อบริษัท"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                เลขประจำตัวผู้เสียภาษี
                            </label>
                            <input
                                type="text"
                                name="tax_id"
                                defaultValue={contact.tax_id}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="เลขประจำตัวผู้เสียภาษี"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Facebook
                            </label>
                            <input
                                type="text"
                                name="facebook"
                                defaultValue={contact.facebook}
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
                                defaultValue={contact.line}
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
                                defaultValue={contact.email}
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
                                defaultValue={contact.technician_phone}
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
                                defaultValue={contact.manager_phone}
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
                                defaultValue={contact.address}
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