export {
  RetryableError,
  isRetryableError,
  isNetworkError,
};

class RetryableError extends Error {
}

function isRetryableError(error) {
  if (error instanceof RetryableError) {
    return true;
  }
  if (isNetworkError(error)) {
    return true;
  }
  return false;
}

function isNetworkError(error) {
  if (!error.message) return false;

  return error.message.startsWith('getaddrinfo') ||
        error.message.startsWith('connect E') ||
        error.message === 'net::ERR_INTERNET_DISCONNECTED' ||
        error.message === 'net::ERR_PROXY_CONNECTION_FAILED' ||
        error.message === 'net::ERR_CONNECTION_RESET' ||
        error.message === 'net::ERR_CONNECTION_CLOSE' ||
        error.message === 'net::ERR_NAME_NOT_RESOLVED' ||
        error.message === 'net::ERR_CONNECTION_TIMED_OUT' ||
        error.message === 'net::ERR_ADDRESS_UNREACHABLE';
}
