const xlsx = require('xlsx');
const path = require('path');

const documentsPath = path.join(__dirname, 'documents');
const files = [
  'SOLID.xlsx',
  'SDLC -Software Development Life Cycle.xlsx',
  'Git Fundamentals_Repository_PullRequest.xlsx'
];

console.log('=== Excel Files Content ===\n');

files.forEach(fileName => {
  const filePath = path.join(documentsPath, fileName);
  console.log(`\n📄 File: ${fileName}`);
  console.log('─'.repeat(80));
  
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    console.log(`Sheet: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    if (data.length > 0) {
      console.log(`Rows: ${data.length}`);
      console.log('\nColumns:', Object.keys(data[0]));
      console.log('\nData Preview:');
      console.table(data.slice(0, 5));
    } else {
      console.log('No data found');
    }
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error.message);
  }
});
