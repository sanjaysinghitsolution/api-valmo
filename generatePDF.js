const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

const generatePDF = async (req, res) => {
    try {
        // 1. Load HTML template
        const templatePath = path.join(__dirname, 'template.html');
        const htmlContent = await fs.readFile(templatePath, 'utf8');

        // 2. Compile with Handlebars 
        const template = handlebars.compile(htmlContent);
        const data = { 
            ...req.body,
            currentDate: new Date().toLocaleDateString('en-IN'),
            timestamp: new Date().toLocaleTimeString('en-IN')
        };
        const finalHtml = template(data);

        // 3. Launch Puppeteer
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        // 4. Set PDF options matching original layout
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            displayHeaderFooter: false,
            preferCSSPageSize: true
        });

        await browser.close();

        // 5. Send PDF response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=LOI.pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF generation error:', error);
        
        res.status(500).send('Error generating PDF');
    }
};

module.exports = generatePDF;