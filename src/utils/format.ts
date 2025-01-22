export const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };
  
  export const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return '-';
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };
  
  export const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอดำเนินการ';
      case 'in_progress':
        return 'กำลังซ่อม';
      case 'completed':
        return 'เสร็จสิ้น';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };
  
  export const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border border-amber-200 bg-amber-50 text-amber-700';
      case 'in_progress':
        return 'border border-blue-200 bg-blue-50 text-blue-700';
      case 'completed':
        return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'cancelled':
        return 'border border-red-200 bg-red-50 text-red-700';
      default:
        return 'border border-gray-200 bg-gray-50 text-gray-700';
    }
  };
  