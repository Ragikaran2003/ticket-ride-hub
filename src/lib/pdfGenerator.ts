import jsPDF from 'jspdf';

export const generateTicketPDF = async (ticket) => {
  try {
    console.log('📄 Generating PDF for ticket:', ticket);
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set background color
    doc.setFillColor(28, 47, 84); // Dark blue
    doc.rect(0, 0, 210, 50, 'F');
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TICKET RIDE HUB', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Journey Ticket', 105, 30, { align: 'center' });
    
    // Booking code highlight
    doc.setFillColor(234, 146, 56); // Orange
    doc.rect(20, 55, 170, 15, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`Booking Code: ${ticket.booking_code || ticket.bookingCode}`, 105, 65, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Train details
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(ticket.train_name || ticket.trainName || 'Train', 20, 90);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Route: ${ticket.origin_name || ticket.origin} to ${ticket.destination_name || ticket.destination}`, 20, 105);
    doc.text(`Distance: ${ticket.distance} km`, 20, 115);
    
    // Journey box
    doc.setDrawColor(28, 47, 84);
    doc.setLineWidth(1);
    doc.roundedRect(20, 125, 170, 40, 3, 3);
    doc.stroke();
    
    // Origin details
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text('FROM', 35, 140);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(ticket.origin_name || ticket.origin || 'Origin', 35, 150);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(ticket.departure_time || '08:00 AM', 35, 157);
    
    // Destination details
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text('TO', 120, 140);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(ticket.destination_name || ticket.destination || 'Destination', 120, 150);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(ticket.arrival_time || '04:00 PM', 120, 157);
    
    // Date and passenger info
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text('DATE', 35, 170);
    doc.text('PASSENGER', 120, 170);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date(ticket.travel_date || ticket.travelDate).toLocaleDateString(), 35, 177);
    doc.text(ticket.passenger_name || ticket.passengerName, 120, 177);
    
    // Payment info
    doc.setFontSize(10);
    doc.text(`Payment: ${(ticket.payment_method || ticket.paymentMethod || 'cash').toUpperCase()} - ${(ticket.payment_status || ticket.paymentStatus || 'pending').toUpperCase()}`, 20, 195);
    
    // Price
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(28, 47, 84);
    doc.text(`Total: Rs.${ticket.price}`, 20, 215);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    doc.setFont('helvetica', 'normal');
    doc.text('Ticket Ride Hub - Making railway travel simple and efficient', 105, 280, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
    
    // Save the PDF
    const fileName = `ticket-${ticket.booking_code || ticket.bookingCode}.pdf`;
    doc.save(fileName);
    
    console.log('✅ PDF generated successfully:', fileName);
    return true;
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};