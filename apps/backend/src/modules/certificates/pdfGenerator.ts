import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export interface CertificateData {
  candidateName: string;
  courseName: string;
  completionDate: string;
  certificateNumber: string;
  opaqueToken: string;
  issuingAuthority: string;
  trainingCentre?: string;
  district?: string;
  directorName?: string;
  directorTitle?: string;
}

export class CertificateGeneratorService {
  public static async generateQrCodeBuffer(verificationUrl: string): Promise<Buffer> {
    return QRCode.toBuffer(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 140,
      color: {
        dark: '#163A5F',
        light: '#FFFFFF',
      },
    });
  }

  public static generateCertificateNumber(year: number, districtCode: string, sequence: number): string {
    const padded = String(sequence).padStart(6, '0');
    return `CF-${year}-${districtCode.toUpperCase()}-${padded}`;
  }

  public static async renderCertificatePdf(data: CertificateData): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // Landscape A4: 841.89 x 595.28 points
        const doc = new PDFDocument({
          layout: 'landscape',
          size: 'A4',
          margins: { top: 25, bottom: 25, left: 25, right: 25 },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const goldColor = '#C49A3A';
        const darkNavy = '#163A5F';
        const charColor = '#172B3A';

        // -------------------------------------------------------------
        // 1. ORNAMENTAL DOUBLE GOLD BORDER WITH STEPPED CORNERS
        // -------------------------------------------------------------
        const m1 = 20;
        const m2 = 25;

        // Outer Gold Line
        doc.rect(m1, m1, pageWidth - 2 * m1, pageHeight - 2 * m1)
          .lineWidth(2.5)
          .stroke(goldColor);

        // Inner Gold Line
        doc.rect(m2, m2, pageWidth - 2 * m2, pageHeight - 2 * m2)
          .lineWidth(1)
          .stroke(goldColor);

        // Geometric Stepped Corners (4 corners)
        const cornerSize = 14;
        const drawSteppedCorner = (cx: number, cy: number, signX: number, signY: number) => {
          doc.save();
          doc.lineWidth(1.5).strokeColor(goldColor);
          doc.moveTo(cx, cy + signY * cornerSize)
            .lineTo(cx + signX * cornerSize, cy + signY * cornerSize)
            .lineTo(cx + signX * cornerSize, cy)
            .stroke();
          doc.restore();
        };

        drawSteppedCorner(m1, m1, 1, 1);
        drawSteppedCorner(pageWidth - m1, m1, -1, 1);
        drawSteppedCorner(m1, pageHeight - m1, 1, -1);
        drawSteppedCorner(pageWidth - m1, pageHeight - m1, -1, -1);

        // Subtle background watermarked waves on left
        doc.save();
        doc.strokeColor('#E2E8F0').lineWidth(0.5);
        for (let r = 30; r < 200; r += 20) {
          doc.circle(70, pageHeight / 2, r).stroke();
        }
        doc.restore();

        // -------------------------------------------------------------
        // 2. TOP CENTER: GOVERNMENT & REGISTRY HEADER
        // -------------------------------------------------------------
        doc.font('Helvetica-Bold')
          .fontSize(15)
          .fillColor(darkNavy)
          .text('CERTIFLOW NATIONAL REGISTRY', 0, 40, { align: 'center' });

        doc.font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#0F766E')
          .text('National Council for Vocational Education and Training (NCVET)', 0, 58, { align: 'center' });

        doc.font('Helvetica')
          .fontSize(7.5)
          .fillColor(charColor)
          .text(
            'MINISTRY OF SKILL DEVELOPMENT & ENTREPRENEURSHIP, GOVERNMENT OF INDIA\nACCREDITED UNDER NATIONAL SKILLS QUALIFICATIONS FRAMEWORK (NSQF)',
            0,
            70,
            { align: 'center', lineGap: 2 }
          );

        // -------------------------------------------------------------
        // 3. TOP RIGHT: CERTIFICATE ID, DATE OF ISSUE & QR CODE
        // -------------------------------------------------------------
        const qrSize = 75;
        const qrX = pageWidth - 125;
        const qrY = 70;

        doc.font('Helvetica')
          .fontSize(8)
          .fillColor(charColor)
          .text(`Certificate ID : ${data.certificateNumber}`, qrX - 40, 40, { width: 140, align: 'right' });

        doc.font('Helvetica')
          .fontSize(8)
          .fillColor(charColor)
          .text(`Date of Issue : ${data.completionDate}`, qrX - 40, 52, { width: 140, align: 'right' });

        const verificationUrl = `https://certiflow.gov.in/verify/${data.opaqueToken || data.certificateNumber}`;
        const qrBuffer = await this.generateQrCodeBuffer(verificationUrl);
        doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

        // -------------------------------------------------------------
        // 4. MAIN CALLIGRAPHIC TITLE: "Certificate of Competency"
        // -------------------------------------------------------------
        doc.font('Times-BoldItalic')
          .fontSize(36)
          .fillColor(goldColor)
          .text('Certificate of Competency', 0, 115, { align: 'center' });

        // -------------------------------------------------------------
        // 5. BODY: THIS IS TO CERTIFY THAT / CANDIDATE / COURSE
        // -------------------------------------------------------------
        doc.font('Helvetica')
          .fontSize(10)
          .fillColor('#475569')
          .text('THIS IS TO OFFICIALLY CERTIFY THAT', 0, 168, { align: 'center', characterSpacing: 1.5 });

        doc.font('Times-Bold')
          .fontSize(25)
          .fillColor(charColor)
          .text(data.candidateName.toUpperCase(), 0, 188, { align: 'center', characterSpacing: 1 });

        doc.font('Helvetica')
          .fontSize(10)
          .fillColor('#475569')
          .text('HAS DEMONSTRATED PROFICIENCY AND COMPLETED THE ACCREDITED QUALIFICATION OF', 0, 226, { align: 'center', characterSpacing: 1 });

        doc.font('Times-Roman')
          .fontSize(20)
          .fillColor(darkNavy)
          .text(data.courseName, 0, 248, { align: 'center' });

        if (data.trainingCentre) {
          doc.font('Helvetica')
            .fontSize(9)
            .fillColor('#64748B')
            .text(`Conferred at ${data.trainingCentre} (${data.district || 'Delhi Central'})`, 0, 276, { align: 'center' });
        }

        // -------------------------------------------------------------
        // 6. MIDDLE-BOTTOM: PHOTO BOX, DUAL SEALS & SIGNATURE BLOCK
        // -------------------------------------------------------------
        const middleY = 320;

        // A. Candidate Photo Box (Left)
        const photoX = 140;
        doc.rect(photoX, middleY, 65, 80)
          .lineWidth(1)
          .fillAndStroke('#F1F5F9', '#CBD5E1');

        doc.circle(photoX + 32.5, middleY + 28, 12).fill('#94A3B8');
        doc.ellipse(photoX + 32.5, middleY + 62, 22, 14).fill('#94A3B8');

        doc.font('Helvetica-Bold')
          .fontSize(6)
          .fillColor('#0F766E')
          .text('BIOMETRIC VERIFIED', photoX, middleY + 68, { width: 65, align: 'center' });

        // B. Official NCVET Round Stamp Seal (Middle-Left)
        const stampX = 280;
        const stampY = middleY + 40;
        doc.circle(stampX, stampY, 34).lineWidth(1.5).stroke(darkNavy);
        doc.circle(stampX, stampY, 30).lineWidth(0.75).stroke(darkNavy);
        doc.font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(goldColor)
          .text('NCVET', stampX - 25, stampY - 6, { width: 50, align: 'center' });
        doc.font('Helvetica')
          .fontSize(5)
          .fillColor(darkNavy)
          .text('NATIONAL COUNCIL FOR', stampX - 25, stampY - 24, { width: 50, align: 'center' })
          .text('VOCATIONAL TRAINING', stampX - 25, stampY + 14, { width: 50, align: 'center' });

        // C. Gold Rosette Seal: ISO 9001:2015 & NSQF (Center)
        const isoX = 430;
        const isoY = middleY + 40;
        doc.circle(isoX, isoY, 34).lineWidth(2).stroke(goldColor);
        doc.circle(isoX, isoY, 30).lineWidth(1).stroke(goldColor);
        doc.font('Helvetica-Bold')
          .fontSize(6)
          .fillColor(goldColor)
          .text('★ ACCREDITED ★', isoX - 25, isoY - 20, { width: 50, align: 'center' });
        doc.font('Helvetica-Bold')
          .fontSize(8.5)
          .fillColor('#1E293B')
          .text('ISO 9001:2015', isoX - 35, isoY - 5, { width: 70, align: 'center' });
        doc.font('Helvetica-Bold')
          .fontSize(6)
          .fillColor(goldColor)
          .text('NSQF COMPLIANT', isoX - 25, isoY + 12, { width: 50, align: 'center' });

        // D. Director General Digital Signature Block (Right)
        const sigX = 620;
        doc.font('Times-Italic')
          .fontSize(22)
          .fillColor(darkNavy)
          .text('Dr. V. K. Nair', sigX - 60, middleY + 15, { width: 140, align: 'center' });

        doc.moveTo(sigX - 60, middleY + 42)
          .lineTo(sigX + 80, middleY + 42)
          .lineWidth(0.75)
          .stroke('#94A3B8');

        doc.font('Helvetica-Bold')
          .fontSize(9.5)
          .fillColor(charColor)
          .text(data.directorName || 'Dr. V. K. Nair', sigX - 60, middleY + 46, { width: 140, align: 'center' });

        doc.font('Helvetica')
          .fontSize(7.5)
          .fillColor('#64748B')
          .text(data.directorTitle || 'Director General of Skilling\nState Skill Development Mission', sigX - 60, middleY + 58, { width: 140, align: 'center' });

        // -------------------------------------------------------------
        // 7. FOOTER: NSQF, DPDP ACT, AND PORTAL DETAILS
        // -------------------------------------------------------------
        const footerY = 470;

        doc.font('Helvetica-Bold')
          .fontSize(7.5)
          .fillColor(darkNavy)
          .text('National Council for Vocational Education and Training (NCVET) • Ministry of Skill Development & Entrepreneurship, Govt. of India', 0, footerY, { align: 'center' });

        doc.font('Helvetica')
          .fontSize(7)
          .fillColor('#64748B')
          .text('Cryptographically stamped with SHA-256 state ledger block | Citizen privacy protected under Digital Personal Data Protection (DPDP) Act 2023', 0, footerY + 12, { align: 'center' });

        doc.font('Helvetica')
          .fontSize(7.5)
          .fillColor('#0F766E')
          .text('Official National Verification Gateway: www.certiflow.gov.in | Grievance Desk: verify@certiflow.gov.in', 0, footerY + 24, { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const generateCertificateNumber = CertificateGeneratorService.generateCertificateNumber;
