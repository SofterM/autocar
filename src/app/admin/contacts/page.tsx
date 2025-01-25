'use client'

import React, { useState, useEffect } from 'react';
import { Menu, Facebook, Mail, Phone, MapPin, MessageCircle, Plus, Building2, FileText } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import EditContactModal from '@/components/EditContactModal';
import AddContactModal from '@/components/AddContactModal';

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

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth >= 1024);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/contact-channels');
            if (response.ok) {
                const data = await response.json();
                setContacts(Array.isArray(data) ? data : [data]);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const ContactCard = ({ title, icon: Icon, value, className = '' }: { 
        title: string; 
        icon: any; 
        value: string;
        className?: string;
    }) => (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
            <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-700">{title}</h3>
                </div>
                <p className="text-gray-900 break-words pl-12">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen}
                activeMenu="ช่องทางการติดต่อ" 
            />
            
            <div className="flex-1">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Menu className="h-5 w-5 text-gray-700" />
                                </button>
                                <h1 className="text-xl font-bold text-gray-900">ข้อมูลการติดต่อ</h1>
                            </div>
                            <div className="flex gap-2">
                                {contacts.length === 0 && (
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="h-5 w-5" />
                                        เพิ่มข้อมูลการติดต่อ
                                    </button>
                                )}
                                {contacts.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setSelectedContact(contacts[0]);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="h-5 w-5" />
                                        แก้ไขข้อมูล
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8 space-y-6">
                    {contacts.length > 0 && (
                        <>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900">ข้อมูลบริษัท</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ContactCard 
                                        title="ชื่อบริษัท" 
                                        icon={Building2}
                                        value={contacts[0].company_name}
                                    />
                                    <ContactCard 
                                        title="เลขประจำตัวผู้เสียภาษี" 
                                        icon={FileText}
                                        value={contacts[0].tax_id}
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900">ช่องทางการติดต่อออนไลน์</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <ContactCard 
                                        title="Facebook" 
                                        icon={Facebook}
                                        value={contacts[0].facebook}
                                    />
                                    <ContactCard 
                                        title="Line" 
                                        icon={MessageCircle}
                                        value={contacts[0].line}
                                    />
                                    <ContactCard 
                                        title="Email" 
                                        icon={Mail}
                                        value={contacts[0].email}
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900">หมายเลขโทรศัพท์</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ContactCard 
                                        title="เบอร์โทรช่าง" 
                                        icon={Phone}
                                        value={contacts[0].technician_phone}
                                    />
                                    <ContactCard 
                                        title="เบอร์โทรผู้จัดการ" 
                                        icon={Phone}
                                        value={contacts[0].manager_phone}
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900">ที่อยู่</h2>
                                <ContactCard 
                                    title="ที่อยู่" 
                                    icon={MapPin}
                                    value={contacts[0].address}
                                />
                            </div>
                        </>
                    )}
                    
                    {contacts.length === 0 && !isLoading && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <p className="text-gray-500 text-lg">ยังไม่มีข้อมูลการติดต่อ</p>
                            <p className="text-gray-400 mt-2">กรุณาเพิ่มข้อมูลการติดต่อ</p>
                        </div>
                    )}
                </main>

                <AddContactModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchContacts();
                    }}
                />

                {selectedContact && (
                    <EditContactModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setSelectedContact(null);
                        }}
                        onSuccess={() => {
                            setIsEditModalOpen(false);
                            setSelectedContact(null);
                            fetchContacts();
                        }}
                        contact={selectedContact}
                    />
                )}
            </div>
        </div>
    );
}