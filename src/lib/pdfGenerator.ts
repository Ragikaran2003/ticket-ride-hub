import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export const generateTicketPDF = async (ticket) => {
  try {
    console.log('📄 Generating PDF for ticket:', ticket);
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set background color with gradient effect
    doc.setFillColor(28, 47, 84); // Dark blue
    doc.rect(0, 0, 210, 60, 'F');
    
    // Add decorative elements
    doc.setFillColor(234, 146, 56, 0.3); // Semi-transparent orange
    doc.circle(180, 15, 25, 'F');
    doc.circle(-10, 25, 30, 'F');
    
    // Header with improved typography
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TICKET RIDE HUB', 105, 25, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255, 0.9);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Digital Journey Ticket', 105, 35, { align: 'center' });
    
    // Booking code highlight with improved design
    doc.setFillColor(234, 146, 56); // Orange
    doc.roundedRect(15, 65, 180, 20, 5, 5, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`BOOKING CODE: ${ticket.booking_code || ticket.bookingCode}`, 105, 77, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Main content container
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 95, 180, 120, 8, 8);
    doc.stroke();
    
    // Train details section
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 100, 170, 25, 3, 3, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(28, 47, 84);
    doc.setFont('helvetica', 'bold');
    doc.text(ticket.train_name || ticket.trainName || 'Express Train', 25, 115);
    
    doc.setFontSize(12);
    doc.setTextColor(102, 102, 102);
    doc.setFont('helvetica', 'normal');
    doc.text(`Route: ${ticket.origin_name || ticket.origin} to ${ticket.destination_name || ticket.destination}`, 25, 125);
   
    
    // Journey timeline with icons
    const drawIcon = (x, y, type) => {
      doc.setFillColor(28, 47, 84);
      if (type === 'departure') {
        doc.circle(x, y, 3, 'F');
        doc.setDrawColor(28, 47, 84);
        doc.setLineWidth(0.8);
        doc.line(x, y + 3, x, y + 28);
      } else {
        doc.rect(x - 2, y - 2, 4, 4, 'F');
      }
    };
    
    // Departure section
    drawIcon(30, 155, 'departure');
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text('DEPARTURE', 45, 150);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(ticket.origin_name || ticket.origin || 'Origin Station', 45, 160);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(ticket.departure_time , 45, 168);
    
    // Arrival section
    drawIcon(30, 183, 'arrival');
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text('ARRIVAL', 45, 180);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(ticket.destination_name || ticket.destination || 'Destination Station', 45, 190);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(ticket.arrival_time || '04:00 PM', 45, 198);
    
    // Passenger and date info in two columns
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 205, 170, 25, 3, 3, 'F');
    
    // Left column - Date
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text('TRAVEL DATE', 30, 215);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(ticket.travel_date || ticket.travelDate).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }), 30, 222);
    
    // Right column - Passenger
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text('PASSENGER', 120, 215);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(ticket.passenger_name || ticket.passengerName, 120, 222);
    
    // Payment status with badge
    const paymentStatus = ticket.payment_status || ticket.paymentStatus || 'pending';
    const paymentColor = paymentStatus === 'confirmed' ? [34, 197, 94] : 
                        paymentStatus === 'pending' ? [234, 146, 56] : 
                        [239, 68, 68];
    
    doc.setFillColor(...paymentColor, 0.1);
    doc.roundedRect(20, 235, 100, 12, 6, 6, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...paymentColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`Payment: ${(ticket.payment_method || ticket.paymentMethod || 'cash').toUpperCase()} • ${paymentStatus.toUpperCase()}`, 25, 242);
    
    // Price highlight
    doc.setFontSize(18);
    doc.setTextColor(28, 47, 84);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: Rs. ${ticket.price}`, 130, 242);
    
    // QR Code Section
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(125, 150, 60, 60, 5, 5);
    doc.stroke();
    
    doc.setFontSize(9);
    doc.setTextColor(102, 102, 102);
    doc.text('SCAN FOR VERIFICATION', 155, 145, { align: 'center' });
    
    // Generate actual QR code
    try {
      const qrData = JSON.stringify({
        bookingCode: ticket.booking_code || ticket.bookingCode,
        passenger: ticket.passenger_name || ticket.passengerName,
        train: ticket.train_name || ticket.trainName,
        route: `${ticket.origin_name || ticket.origin} to ${ticket.destination_name || ticket.destination}`,
        date: ticket.travel_date || ticket.travelDate,
        departure: ticket.departure_time,
        arrival: ticket.arrival_time
      });

      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 150,
        margin: 1,
        color: {
          dark: '#1c2f54',
          light: '#FFFFFF'
        }
      });
      
      // Add QR code image to PDF
      doc.addImage(qrCodeDataURL, 'PNG', 130, 155, 50, 50);
      
    } catch (qrError) {
      console.warn('QR code generation failed, using placeholder:', qrError);
      // Fallback to placeholder
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(130, 155, 50, 50, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setTextColor(153, 153, 153);
      doc.text('QR CODE', 155, 180, { align: 'center' });
      doc.text('Placeholder', 155, 185, { align: 'center' });
    }
    
    // Footer with improved design
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 250, 195, 250);
    
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for choosing Ticket Ride Hub', 105, 260, { align: 'center' });
    doc.text('Safe travels and enjoy your journey!', 105, 265, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 105, 273, { align: 'center' });
    
    // Security notice
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text('This is an electronically generated ticket. No signature required.', 105, 280, { align: 'center' });
    
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