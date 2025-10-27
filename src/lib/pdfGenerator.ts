import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export const generateTicketPDF = async (ticket) => {
  const pdf = new jsPDF();
  
  // Generate QR code
  const qrCodeDataUrl = await QRCode.toDataURL(ticket.qrCode, {
    width: 100,
    margin: 1,
  });

  // Set colors
  const primaryColor = [28, 47, 84]; // Railway blue
  const accentColor = [234, 146, 56]; // Amber
  
  // Header background
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, 210, 40, 'F');
  
  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TICKET RIDE HUB', 105, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Your Journey Ticket', 105, 30, { align: 'center' });
  
  // Booking code banner
  pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.rect(0, 45, 210, 15, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Booking Code: ${ticket.bookingCode}`, 105, 55, { align: 'center' });
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  
  // Train details
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(ticket.trainName, 20, 75);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Route: ${ticket.route}`, 20, 83);
  pdf.text(`Distance : ${ticket.distance} km`, 20, 91);
  
  // Journey details box
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(20, 95, 170, 60, 3, 3);
  
  // Origin
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('FROM', 30, 105);
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.text(ticket.origin, 30, 115);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(ticket.departureTime, 30, 122);
  

  // Destination
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('TO', 120, 105);
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.text(ticket.destination, 120, 115);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(ticket.arrivalTime, 120, 122);
  
  // Date
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('DATE', 30, 135);
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(new Date(ticket.travelDate).toLocaleDateString(), 30, 145);
  
  // Passenger details
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('PASSENGER', 120, 135);
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(ticket.passengerName, 120, 145);
  
  // Payment status
  pdf.setFontSize(10);
  pdf.text(`Payment: ${ticket.paymentMethod.toUpperCase()} - ${ticket.paymentStatus.toUpperCase()}`, 20, 165);
  
  // QR Code
  pdf.addImage(qrCodeDataUrl, 'PNG', 155, 170, 35, 35);
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Scan to verify', 160, 210);
  
  // Instructions
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Please present this ticket and a valid ID at the station.', 20, 180);
  pdf.text('Arrive at least 30 minutes before departure.', 20, 188);
  
  // Footer
  pdf.setFillColor(240, 240, 240);
  pdf.rect(0, 270, 210, 27, 'F');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Ticket Ride Hub - Making railway travel simple and efficient', 105, 280, { align: 'center' });
  pdf.text(`Booked on: ${new Date(ticket.createdAt).toLocaleString()}`, 105, 287, { align: 'center' });
  
  // Save PDF
  pdf.save(`ticket-${ticket.bookingCode}.pdf`);
};