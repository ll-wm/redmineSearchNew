// 后台脚本，用于管理存储和扩展状态

// 监听扩展安装
chrome.runtime.onInstalled.addListener(() => {
  console.log('下拉列表搜索助手(页面注入版)已安装');
  
  // 初始化存储
  chrome.storage.local.get(['dropdownSearchHistory'], (result) => {
    if (!result.dropdownSearchHistory) {
      chrome.storage.local.set({ dropdownSearchHistory: [] });
    }
  });
});

// 监听扩展图标点击
chrome.action.onClicked.addListener((tab) => {
  // 可以在这里添加扩展图标点击时的逻辑
  console.log('扩展图标被点击', tab.url);
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_SEARCH_HISTORY') {
    chrome.storage.local.set({ dropdownSearchHistory: message.data }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'GET_SEARCH_HISTORY') {
    chrome.storage.local.get(['dropdownSearchHistory'], (result) => {
      sendResponse(result.dropdownSearchHistory || []);
    });
    return true;
  }
  
  if (message.type === 'CLEAR_SEARCH_HISTORY') {
    chrome.storage.local.set({ dropdownSearchHistory: [] }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 如果页面加载完成且是目标域名，可以在这里执行一些操作
  if (changeInfo.status === 'complete' && tab.url && (tab.url.includes('192.168.2.88') || tab.url.includes('redmine.yuanian.com'))) {
    console.log('目标页面已加载:', tab.url);
  }
});

// 清理旧数据（保持最多5个搜索记录）
setInterval(() => {
  chrome.storage.local.get(['dropdownSearchHistory'], (result) => {
    if (result.dropdownSearchHistory && result.dropdownSearchHistory.length > 5) {
      chrome.storage.local.set({
        dropdownSearchHistory: result.dropdownSearchHistory.slice(0, 5)
      });
    }
  });
}, 60000); // 每分钟检查一次