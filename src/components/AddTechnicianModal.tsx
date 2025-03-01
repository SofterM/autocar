import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronDown, ChevronUp, User } from 'lucide-react';
import { UserResponse } from '@/types/user';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    users?: UserResponse[];
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    users: initialUsers
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<UserResponse[]>(initialUsers || []);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        name: '',
        position: '',
        salary: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ดึงข้อมูลผู้ใช้จาก API ถ้าไม่มีข้อมูลเริ่มต้น
    useEffect(() => {
        if (isOpen && (!initialUsers || initialUsers.length === 0)) {
            fetchUsers();
        } else if (initialUsers && initialUsers.length > 0) {
            setUsers(initialUsers);
        }
    }, [isOpen, initialUsers]);

    // ปิด dropdown เมื่อคลิกนอกพื้นที่
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้จาก API
    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const response = await fetch('/api/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/technicians', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: formData.userId,
                    name: formData.name,
                    position: formData.position,
                    salary: parseFloat(formData.salary)
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Something went wrong');
            }

            onSuccess();
            setFormData({
                userId: '',
                name: '',
                position: '',
                salary: ''
            });
            setSearchTerm('');
        } catch (error) {
            console.error('Error creating employee:', error);
            alert('Failed to create employee. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ฟังก์ชันสำหรับการเลือกผู้ใช้
    const handleUserSelect = (user: UserResponse) => {
        let displayName = '';
        
        // ตรวจสอบรูปแบบข้อมูลและเลือกใช้ field ที่ถูกต้อง
        if (user.firstName !== undefined && user.lastName !== undefined) {
            displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        } else if ('first_name' in user && 'last_name' in user) {
            displayName = `${(user as any).first_name || ''} ${(user as any).last_name || ''}`.trim();
        } else {
            displayName = user.email;
        }
        
        setFormData({
            ...formData,
            userId: String(user.id),
            name: displayName
        });
        setIsDropdownOpen(false);
    };

    // ฟังก์ชันกรองผู้ใช้ตาม searchTerm
    const filteredUsers = users.filter(user => {
        const firstName = user.firstName || (user as any).first_name || '';
        const lastName = user.lastName || (user as any).last_name || '';
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        const term = searchTerm.toLowerCase();
        
        return fullName.includes(term) || email.includes(term);
    });

    // ฟังก์ชันแสดงชื่อผู้ใช้ที่เลือก
    const getSelectedUserDisplay = () => {
        if (!formData.userId) return 'เลือกพนักงาน';
        
        const user = users.find(u => String(u.id) === formData.userId);
        if (!user) return 'เลือกพนักงาน';
        
        let firstName, lastName;
        
        if (user.firstName !== undefined) {
            firstName = user.firstName;
        } else if ('first_name' in user) {
            firstName = (user as any).first_name;
        } else {
            firstName = '';
        }
        
        if (user.lastName !== undefined) {
            lastName = user.lastName;
        } else if ('last_name' in user) {
            lastName = (user as any).last_name;
        } else {
            lastName = '';
        }
        
        return `${firstName} ${lastName} (${user.email})`;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-full p-4">
                        <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">เพิ่มพนักงาน</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-left font-medium text-gray-900 mb-1">
                                        เลือกพนักงาน
                                    </label>
                                    <div className="relative" ref={dropdownRef}>
                                        <div
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 flex justify-between items-center cursor-pointer"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        >
                                            <span className={`${!formData.userId ? 'text-gray-500' : ''}`}>
                                                {getSelectedUserDisplay()}
                                            </span>
                                            {isDropdownOpen ? (
                                                <ChevronUp className="h-5 w-5 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-gray-500" />
                                            )}
                                        </div>
                                        
                                        {isDropdownOpen && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                                                            placeholder="ค้นหาตามชื่อหรืออีเมล"
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                        />
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    </div>
                                                </div>
                                                
                                                {isLoadingUsers ? (
                                                    <div className="p-4 text-center text-gray-500">
                                                        กำลังโหลดข้อมูล...
                                                    </div>
                                                ) : filteredUsers.length > 0 ? (
                                                    filteredUsers.map(user => {
                                                        let firstName, lastName;
                                                        
                                                        if (user.firstName !== undefined) {
                                                            firstName = user.firstName;
                                                        } else if ('first_name' in user) {
                                                            firstName = (user as any).first_name;
                                                        } else {
                                                            firstName = '';
                                                        }
                                                        
                                                        if (user.lastName !== undefined) {
                                                            lastName = user.lastName;
                                                        } else if ('last_name' in user) {
                                                            lastName = (user as any).last_name;
                                                        } else {
                                                            lastName = '';
                                                        }
                                                        
                                                        return (
                                                            <div
                                                                key={user.id}
                                                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center"
                                                                onClick={() => handleUserSelect(user)}
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                                    <User className="h-4 w-4 text-blue-600" />
                                                                </div>
                                                                <div className="flex-1 overflow-hidden">
                                                                    <div className="font-medium truncate">
                                                                        {firstName} {lastName}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500 truncate">
                                                                        {user.email}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="p-4 text-center text-gray-500">
                                                        ไม่พบรายชื่อพนักงานที่ตรงกับการค้นหา
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {(!users || users.length === 0) && !isLoadingUsers && (
                                        <p className="text-sm text-red-500 mt-1">
                                            ไม่พบรายชื่อพนักงาน กรุณาเพิ่มพนักงานก่อน
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-left font-medium text-gray-900 mb-1">
                                        ชื่อพนักงาน
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="ชื่อที่ใช้แสดง"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-left font-medium text-gray-900 mb-1">
                                        ตำแหน่ง
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        placeholder="ตำแหน่งงาน"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-left font-medium text-gray-900 mb-1">
                                        เงินเดือน
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="100"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !formData.userId}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                                    >
                                        {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEmployeeModal;