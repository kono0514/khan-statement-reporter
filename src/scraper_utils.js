const { DateTime } = require('luxon');
const crypto = require('crypto');

module.exports = {
  rowsToStatements(rows, startDate) {
    /*
      [0] - Гүйлгээний огноо
      [1] - Салбар
      [2] - Эхний үлдэгдэл
      [3] - Зарлага
      [4] - Орлого
      [5] - Эцсийн үлдэгдэл
      [6] - Гүйлгээний утга
      [7] - Харьцсан данс
    */
    const statements = [];
    for (const row of rows) {
      // Орлогын гүйлгээ
      const amount = parseFloat(row[4].replace(/,/g, ''));
      if (amount > 0.0) {
        const timestamp = DateTime.fromFormat(row[0], 'yyyy.MM.dd HH:mm', { zone: 'Asia/Ulaanbaatar' });
        if (timestamp.diff(startDate).as('seconds') > 0) {
          statements.push({
            'amount': amount,
            'timestamp': timestamp,
            'message': row[6],
            'hash': crypto.createHash('sha256').update(row.slice(1).join(), 'binary').digest('hex'),
          });
        }
      }
    }
    return statements;
  },
};
