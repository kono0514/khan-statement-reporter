const assert = require('assert');
const { rowsToStatements } = require('../src/scraper_utils');
const { DateTime } = require('luxon');

describe('Statement parsing from rows', () => {
  it('Parses correctly', () => {
    const rows = [
      ['2020.10.10 19:15', '5071', '1,824,410.91', '-30,000.00', '0.00', '1,794,410.91', '99119288', '5063082521'],
      ['2020.10.10 19:15', '5071', '1,794,410.91', '-100.00', '0.00', '1,794,310.91', 'Апп-р хийсэн гүйлгээний хураамж', ''],
      ['2020.10.10 19:16', '5063', '1,794,310.91', '-50.00', '0.00', '1,794,260.91', 'Ухаалаг мэдээ үйлчилгээний хураамж', ''],
      ['2020.10.10 19:43', '5071', '1,794,260.91', '-2,000.00', '0.00', '1,792,260.91', '737273', '5400888006'],
      ['2020.10.10 19:43', '5071', '1,792,260.91', '0.00', '1,000.00', '1,793,260.91', 'test', '5400888006'],
      ['2020.10.10 19:44', '5071', '1,793,260.91', '0.00', '1,000.00', '1,794,260.91', 'test', '5400888006'],
      ['2020.10.10 21:47', '5071', '1,794,260.91', '-2,000.00', '0.00', '1,792,260.91', 'gege', '5400888006'],
      ['2020.10.10 21:50', '5071', '1,792,260.91', '0.00', '1,000.00', '1,793,260.91', 'aa', '5400888006'],
      ['2020.10.10 21:53', '5071', '1,793,260.91', '0.00', '200.00', '1,793,460.91', '99999999', '5400888006'],
      ['2020.10.11 14:19', '5071', '1,793,460.91', '0.00', '300.00', '1,793,760.91', 'kek', '5400888006'],
      ['2020.10.12 10:17', '5071', '1,793,760.91', '-150,000.00', '0.00', '1,643,760.91', '99119288', '5063082521'],
      ['2020.10.12 10:17', '5071', '1,643,760.91', '-100.00', '0.00', '1,643,660.91', 'Апп-р хийсэн гүйлгээний хураамж', ''],
      ['2020.10.12 10:18', '5071', '1,643,660.91', '0.00', '200.00', '1,643,860.91', 'testtest', ''],
    ];
    const parsed = rowsToStatements(
      rows,
      DateTime.local().setZone('Asia/Ulaanbaatar').set({
        year: 2020, month: 10, day: 10, hour: 19, minute: 43,
      }),
    );

    assert.deepStrictEqual(
      parsed.map(s => s.hash),
      [
        'c0fad52bdb9b57b69700b83502db309bb0206355b485e134ed398c920e456282',
        '07228987c2c092b22d017afd938d88b14ef67d560488e9f2d539cada046333f0',
        'aa7435ab38d4226873b114cb1cc3b9d555311ad4388482907f4cf9c9897be125',
        '6991e0a19d3df7a138894b1b1f68b43dce22a6a416ebb34a551b62a79df52e24',
        '1f87b55b8d4bce5d7d532d97166a6d751ce7454e940ada21a8dd6d05f1002e09',
      ],
    );
  });

  it('Correctly handle new day switching', () => {
    const rows = [
      ['2020.10.11 23:10', '5071', '1,793,060.91', '0.00', '200.00', '1,793,260.91', '88888888', '5400888006'],
      ['2020.10.11 23:40', '5071', '1,793,260.91', '0.00', '200.00', '1,793,460.91', '99999999', '5400888006'],
      ['2020.10.11 23:59', '5071', '1,793,460.91', '0.00', '300.00', '1,793,760.91', 'kek', '5400888006'],
      ['2020.10.12 00:02', '5071', '1,793,760.91', '-150,000.00', '0.00', '1,643,760.91', '99119288', '5063082521'],
      ['2020.10.12 00:18', '5071', '1,643,760.91', '0.00', '200.00', '1,643,960.91', 'testtest', ''],
    ];
    const parsed = rowsToStatements(
      rows,
      DateTime.local().setZone('Asia/Ulaanbaatar').set({
        year: 2020, month: 10, day: 12, hour: 0, minute: 1,
      }).minus({ minutes: 30 }),
    );

    assert.deepStrictEqual(
      parsed.map(s => s.hash),
      [
        'aa7435ab38d4226873b114cb1cc3b9d555311ad4388482907f4cf9c9897be125',
        '6991e0a19d3df7a138894b1b1f68b43dce22a6a416ebb34a551b62a79df52e24',
        '8cafc88ef07a2d5f463e5a37b6edf1348924c84c4c07273d03f1ff81d7415a55',
      ],
    );
  });
});
