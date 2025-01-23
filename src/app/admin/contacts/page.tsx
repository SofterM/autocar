'use client'

import React, { useState, useEffect } from 'react';
import { Menu, Facebook, Mail, Phone, MapPin, MessageCircle, Plus } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import EditContactModal from '@/components/EditContactModal';
import AddContactModal from '@/components/AddContactModal';

interface Contact {
    id: string;
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

    const ContactCard = ({ title, icon: Icon, value }: { title: string; icon: any; value: string }) => (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-700">{title}</h3>
            </div>
            <p className="text-gray-900 break-words">{value}</p>
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
                <header className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Menu className="h-5 w-5 text-gray-700" />
                                </button>
                                <h1 className="text-lg font-bold text-gray-900">ช่องทางการติดต่อ</h1>
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
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        แก้ไขข้อมูล
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">
                    {contacts.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <ContactCard 
                                title="ที่อยู่" 
                                icon={MapPin}
                                value={contacts[0].address}
                            />
                        </div>
                    )}
                    
                    {contacts.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">ยังไม่มีข้อมูลการติดต่อ</p>
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