document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('login-button');

  loginButton.addEventListener('click', () => {
    console.log('Login button clicked');
    // Request an OAuth 2.0 token from Google with the spreadsheet scope.
    chrome.identity.getAuthToken({
      interactive: true,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    }, (token) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      if (token) {
        loginButton.textContent = 'ログイン済み・リスト更新中...';
        loginButton.disabled = true;

        // Send a message to the background script to fetch the blocklist
        chrome.runtime.sendMessage({ type: 'FETCH_BLOCKLIST' }, (response) => {
          if (response.success) {
            loginButton.textContent = 'ログイン済み・リスト更新完了';
          } else {
            loginButton.textContent = 'エラーが発生しました';
            console.error(response.error);
          }
        });
      }
    });
  });
});
