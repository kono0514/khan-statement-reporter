function luxonDateTimeToRelative(dateTime, withSuffix = false) {
  let days = dateTime.diffNow('days').days;
  let hours = dateTime.diffNow('hours').hours;
  let minutes = dateTime.diffNow('minutes').minutes;
  let seconds = dateTime.diffNow('seconds').seconds;

  let word = '';
  if (Math.abs(days) >= 1) {
    let _d = Math.round(days);
    word = `${withSuffix ? Math.abs(_d) : _d} өдөр`;
  } else if (Math.abs(hours) >= 1) {
    let _h = Math.round(hours);
    word = `${withSuffix ? Math.abs(_h) : _h} цаг`;
  } else if (Math.abs(minutes) >= 1) {
    let _m = Math.round(minutes);
    word = `${withSuffix ? Math.abs(_m) : _m} минут`;
  } else {
    let _s = Math.round(seconds);
    word = `${withSuffix ? Math.abs(_s) : _s} секунд`;
  }

  if (withSuffix) {
    const words = word.split(' ');
    const lastword = words.pop();
    word = words.join(' ');
    switch (lastword) {
      case 'секунд':
        word += ' секундийн';
        break;
      case 'минут':
        word += ' минутын';
        break;
      case 'цаг':
        word += ' цагийн';
        break;
      case 'өдөр':
        word += ' өдрийн';
        break;
      default:
        word += lastword + '-н';
    }
    if (seconds < 0) {
      word += ' өмнө';
    } else {
      word += ' дараа';
    }
  }

  return word;
}

export {
  luxonDateTimeToRelative,
};
