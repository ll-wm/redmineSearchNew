class DropdownSearchExtension {
  constructor() {
    this.popup = null;
    this.targetElement = null;
    this.searchHistory = [];
    this.init();
  }

  async init() {
    // 检查当前页面是否是目标域名
    if (window.location.hostname === '192.168.2.88' || window.location.hostname === 'redmine.yuanian.com') {
      await this.loadSearchHistory();
      this.injectStyles();
      this.setupClickListener();
      this.setupGlobalListeners();
    }
  }

  // 注入CSS样式
  injectStyles() {
    const style = document.createElement('style');
    style.id = 'dropdown-search-styles';
    style.textContent = `
      /* 弹窗容器 */
      .dropdown-search-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #f5f7fa;
        color: #333;
        width: 400px;
        min-height: 450px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        overflow: hidden;
        animation: popupFadeIn 0.3s ease-out;
      }
      
      @keyframes popupFadeIn {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
      
      /* 遮罩层 */
      .dropdown-search-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        backdrop-filter: blur(5px);
        animation: overlayFadeIn 0.3s ease-out;
      }
      
      @keyframes overlayFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      /* 弹窗内容 */
      .search-container {
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      
      /* 头部 */
      .search-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e1e5e9;
      }
      
      .search-header h3 {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }
      
      .close-btn {
        
        border: none;
        color: #8894a8;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s;
      }
      
      .close-btn:hover {
        background: #e1ebf9;
      }
      
      /* 搜索输入框 */
      .search-input-container {
        position: relative;
        margin-bottom: 15px;
      }
      
      #dropdownSearchInput {
        width: 100%;
        padding: 10px;
        border: 1px solid #d1d9e6;
        border-radius: 6px;
        font-size: 14px;
        box-sizing: border-box;
        transition: border-color 0.2s;
        height: 36px;
        margin-top: 12px;
      }
      
      #dropdownSearchInput:focus {
        outline: none;
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
        background: white;
      }
      
      .clear-search-btn {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: #ff6b6b;
        color: white;
        border: none;
        padding: 4px 10px;
        border-radius: 15px;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.3s;
      }
      
      .clear-search-btn:hover {
        background: #ff5252;
      }
      
      /* 最近搜索和结果区域 */
      .section-container {
        border-radius: 10px;
        padding-top: 15px;
        margin-bottom: 15px;
        backdrop-filter: blur(10px);
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      
      .section-title {
        margin-bottom: 10px;
        font-size: 14px;
      }
      
      .scrollable-list {
        max-height: 230px;
        overflow-y: auto;
        flex: 1;
      }

      #person_box{
        margin-top: 8px;
      }
      .person_btn{
          padding: 4px 12px;
          font-size: 12px;
          margin-left: 8px;
          cursor: pointer;
          border-radius: 4px;
          display: inline-block;
          height: 22px;
          line-height: 22px;
      }
      .person_btn:hover{
          background-color: #8894a8;
          color: #fff
      }
      
      /* 最近搜索项 */
      .recent-search-item {
        background: rgba(255, 255, 255, 0.15);
        padding: 8px 12px;
        margin-bottom: 5px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.3s;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .recent-search-item:hover {
        background: rgba(255, 255, 255, 0.25);
      }
      
      .delete-recent-btn {
        background: rgba(255, 255, 255, 0.3);
        border: none;
        color: white;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      .recent-search-item:hover .delete-recent-btn {
        opacity: 1;
      }
      
      /* 搜索结果项 */
      .search-result-item {
        padding: 12px;
        background: #e1ebf9;
        cursor: pointer;
        transition: background-color 0.2s;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .search-result-item:not(:last-child){
        border-bottom: 1px solid #f1f1f1;
      }
      .search-result-item:hover {
        background: #e1ebf9;
        // transform: translateX(5px);
      }
      
      .search-result-item:before {
        content: "✓";
        margin-right: 8px;
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      .search-result-item:hover:before {
        opacity: 1;
      }
      
      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: 20px;
        color: rgba(255, 255, 255, 0.7);
        font-style: italic;
      }
      
      /* 状态消息 */
      .status-message {
        position: fixed;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 10001;
        pointer-events: none;
      }
      
      .status-message.show {
        opacity: 1;
      }
      
      /* 滚动条样式 */
      .scrollable-list::-webkit-scrollbar {
        width: 6px;
      }
      
      .scrollable-list::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 3px;
      }
      
      .scrollable-list::-webkit-scrollbar-thumb {
        background: rgba(188, 193, 204, 0.8);
        border-radius: 3px;
      }
      
      .scrollable-list::-webkit-scrollbar-thumb:hover {
        background: #bcc1cc;
      }
      
      /* 响应式调整 */
      @media (max-width: 500px) {
        .dropdown-search-popup {
          width: 90%;
          max-width: 350px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  // 从存储加载搜索历史
  async loadSearchHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['dropdownSearchHistory'], (result) => {
        this.searchHistory = result.dropdownSearchHistory || [];
        resolve();
      });
    });
  }

  // 保存搜索历史到存储
  async saveSearchHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.set({ dropdownSearchHistory: this.searchHistory }, resolve);
    });
  }

  // 设置点击监听器
  setupClickListener() {
    document.addEventListener('contextmenu', (event) => {
        this.handleClick(event);
    }, true); // 使用捕获阶段确保我们先处理
  }

  // 设置全局监听器
  setupGlobalListeners() {
    // ESC键关闭弹窗
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.popup) {
        this.removePopup();
      }
    });
  }

  // 处理点击事件
  handleClick(event) {
    const target = event.target;
    const parentElement = this.findTargetParent(target);

    if (parentElement) {
      event.stopPropagation();
      event.preventDefault();
      
      this.targetElement = parentElement;
      this.showPopup();
    }
  }

  // 查找目标父元素
  findTargetParent(element) {
    let currentElement = element;
    
    while (currentElement) {
      // const id = currentElement.id;
      // if (id === 'issue_assigned_to_id' || id === 'issue_custom_field_values_54' || id === 'issue_custom_field_values_56') {
      //   return currentElement;
      // }
      if(currentElement.tagName === 'SELECT'){
        return currentElement;
      }
      currentElement = currentElement.parentElement;
    }
    
    return null;
  }

  // 显示弹窗
  showPopup() {
    // 移除已存在的弹窗
    this.removePopup();

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'dropdown-search-overlay';
    overlay.addEventListener('click', () => this.removePopup());

    // 创建弹窗容器
    const popup = document.createElement('div');
    popup.className = 'dropdown-search-popup';

    // 弹窗HTML内容
    popup.innerHTML = `
      <div class="search-container">
        <div class="search-header">
          <h3>搜索下拉选项</h3>
          <button class="close-btn" id="dropdownCloseBtn">&times;</button>
        </div>
        <div class="input-group">
          <label for="search-text">搜索内容</label>
          <input type="text" id="dropdownSearchInput" placeholder="输入要搜索的文本">
          <div id="person_box"></div>
        </div>
        
        <div class="section-container">
          <div class="section-title">搜索结果:</div>
          <div id="dropdownSearchResults" class="scrollable-list">
            <div class="empty-state">请输入搜索内容</div>
          </div>
        </div>
      </div>
    `;

    // 添加到页面
    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    // 保存引用
    this.popup = { overlay, popup };

    // 初始化弹窗事件
    this.initPopupEvents();

    // 聚焦输入框
    setTimeout(() => {
      document.getElementById('dropdownSearchInput').focus();
    }, 100);
  }

  // 获取最近搜索的HTML
  // getRecentSearchesHTML() {
  //   // if (this.searchHistory.length === 0) {
  //   //   return '<div class="empty-state">暂无搜索记录</div>';
  //   // }

  //   // return this.searchHistory.map(term => `
  //   //   <div class="recent-search-item" data-term="${term}">
  //   //     <span>${term}</span>
  //   //     <button class="delete-recent-btn" data-term="${term}">&times;</button>
  //   //   </div>
  //   // `).join('');
  //   return this.searchHistory.map(term =>`
  //     <span class="person_btn" id="dropdownRecentSearches">${term}</span>
  //   `).join('')
  // }

  renderPersonLi(pBox, searchText, recentData){
    pBox.innerHTML = ''
    if(recentData.length){
      recentData.map(item=>{
        const cDom = document.createElement("span");
        cDom.className = 'person_btn'
        cDom.textContent = item
        cDom.addEventListener("click",()=>{
          searchText.value = item;
          this.performSearch(item)
        })
        pBox.appendChild(cDom)
      })
    }
  }

  // 初始化弹窗事件
  initPopupEvents() {
    // 关闭按钮
    document.getElementById('dropdownCloseBtn').addEventListener('click', () => {
      this.removePopup();
    });

    // 清空按钮
    // document.getElementById('dropdownClearBtn').addEventListener('click', () => {
    //   const input = document.getElementById('dropdownSearchInput');
    //   input.value = '';
    //   input.focus();
    //   this.clearSearchResults();
    // });

    // 搜索输入事件
    const searchInput = document.getElementById('dropdownSearchInput');
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value;
      this.performSearch(term);
    });

    // 回车键保存搜索历史
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const term = searchInput.value.trim();
        if (term) {
          this.performSearch(term);
        }
      }
    });

    const pBox =  document.getElementById('person_box');
    this.renderPersonLi(pBox, searchInput, this.searchHistory, this.performSearch)

    // // 最近搜索点击事件（委托）
    // const recentContainer = document.getElementById('dropdownRecentSearches');
    // recentContainer && recentContainer.addEventListener('click', (e) => {
    //   // const item = e.target.closest('.recent-search-item');
    //   // if (item) {
    //   //   // 如果是删除按钮
    //   //   if (e.target.classList.contains('delete-recent-btn')) {
    //   //     const term = e.target.dataset.term;
    //   //     this.removeSearchTerm(term);
    //   //     return;
    //   //   }
        
    //     // 如果是搜索项本身
    //     // const term = item.dataset.term;
    //     searchInput.value = e.target.textContent;
    //     this.performSearch(e.target.textContent);
    //   // }
    // });

    // 搜索结果点击事件（委托）
    const resultsContainer = document.getElementById('dropdownSearchResults');
    resultsContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.search-result-item');
      if (item) {
        const text = item.dataset.text;
        const value = item.dataset.value;
        this.selectOption(text, value);
      }
    });
    this.performSearch('')
  }

  // 移除弹窗
  removePopup() {
    if (this.popup) {
      if (this.popup.overlay) this.popup.overlay.remove();
      if (this.popup.popup) this.popup.popup.remove();
      this.popup = null;
      this.targetElement = null;
    }
  }

  // 添加搜索词到历史
  addSearchTerm(term) {
    if (!term.trim()) return;

    // 移除重复项
    this.searchHistory = this.searchHistory.filter(item => item !== term);
    
    // 添加到开头
    this.searchHistory.unshift(term);
    
    // 保持最多5个
    if (this.searchHistory.length > 5) {
      this.searchHistory = this.searchHistory.slice(0, 5);
    }

    this.saveSearchHistory();
    this.updateRecentSearchesDisplay();
  }

  // 从历史移除搜索词
  removeSearchTerm(term) {
    this.searchHistory = this.searchHistory.filter(item => item !== term);
    this.saveSearchHistory();
    this.updateRecentSearchesDisplay();
  }

  // 更新最近搜索显示
  updateRecentSearchesDisplay() {
    const container = document.getElementById('person_box');
    const searchInput = document.getElementById('dropdownSearchInput');
    this.renderPersonLi(container, searchInput, this.searchHistory)
  }

  // 执行搜索
  performSearch(searchTerm) {
    // if (!searchTerm.trim()) {
    //   this.clearSearchResults();
    //   return;
    // }

    const options = this.getDropdownOptions();
    const results = this.filterOptions(options, searchTerm, !searchTerm.trim());
    this.displayResults(results);
  }

  // 获取下拉选项
  getDropdownOptions() {
    if (!this.targetElement) return [];

    const options = [];
    const isSelect = this.targetElement.tagName === 'SELECT';
    
    if (isSelect) {
      // 标准select元素
      Array.from(this.targetElement.options).forEach(option => {
        let textContent = option.text || '';
        textContent = textContent.replaceAll(" ", "")
        if (option.value && textContent) {
          options.push({
            text: textContent,
            value: option.value,
            element: option
          });
        }
      });
    } else {
      // 其他类型的下拉列表
      const childElements = this.targetElement.querySelectorAll('option, [data-value], .option, li, [role="option"]');
      childElements.forEach(element => {
        const text = element.textContent || element.innerText || element.getAttribute('title') || '';
        const value = element.value || element.getAttribute('data-value') || element.getAttribute('value') || text;
        
        if (text && value) {
          options.push({
            text: text.trim(),
            value: value,
            element: element
          });
        }
      });
    }

    return options;
  }

  // 过滤选项
  filterOptions(options, searchTerm, returnAll) {
    const term = searchTerm.toLowerCase();
    let targetList = []
    return options.filter(option => {
      if(targetList.includes(option.value)) return false
      if(option.text.toLowerCase().includes(term) || returnAll){
        targetList.push(option.value);
        return true
      } else {
        return false
      }
    }
      
    );
  }

  // 显示搜索结果
  displayResults(results) {
    const container = document.getElementById('dropdownSearchResults');
    
    if (results.length === 0) {
      container.innerHTML = '<div class="empty-state">未找到匹配的选项</div>';
      return;
    }

    container.innerHTML = results.map(result => `
      <div class="search-result-item" data-value="${result.value}" data-text="${result.text}">
        ${result.text}
      </div>
    `).join('');
  }

  // 清空搜索结果
  clearSearchResults() {
    const container = document.getElementById('dropdownSearchResults');
    container.innerHTML = '<div class="empty-state">请输入搜索内容</div>';
  }

  // 选择选项
  selectOption(text, value) {
    if (!this.targetElement) return;

    const isSelect = this.targetElement.tagName === 'SELECT';
    
    if (isSelect) {
      // 设置select的值
      this.targetElement.value = value;
      
      // 触发change事件
      const event = new Event('change', { bubbles: true });
      this.targetElement.dispatchEvent(event);
    } else {
      // 对于非select元素，尝试设置值
      this.targetElement.value = value;
      
      // 触发input事件
      const inputEvent = new Event('input', { bubbles: true });
      this.targetElement.dispatchEvent(inputEvent);
      
      // 触发change事件
      const changeEvent = new Event('change', { bubbles: true });
      this.targetElement.dispatchEvent(changeEvent);
    }

    // 显示成功消息
    this.showStatusMessage('修改成功！');
    
    // 添加搜索历史
    this.addSearchTerm(text);
    
    // 2秒后关闭弹窗
    // setTimeout(() => {
      this.removePopup();
    // }, 2000);
  }

  // 显示状态消息
  showStatusMessage(message) {
    // 移除已存在的状态消息
    const existingMessage = document.querySelector('.status-message');
    if (existingMessage) existingMessage.remove();

    // 创建新消息
    const messageElement = document.createElement('div');
    messageElement.className = 'status-message show';
    messageElement.textContent = message;
    
    document.body.appendChild(messageElement);

    // 3秒后移除
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.classList.remove('show');
        setTimeout(() => {
          if (messageElement.parentNode) {
            messageElement.remove();
          }
        }, 300);
      }
    }, 2000);
  }
}

// 初始化扩展
let dropdownSearch = null;

// 当页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    dropdownSearch = new DropdownSearchExtension();
  });
} else {
  dropdownSearch = new DropdownSearchExtension();
}

// 监听页面变化（SPA应用）
let lastUrl = window.location.href;
new MutationObserver(() => {
  const url = window.location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // 移除已存在的弹窗和样式
    const popup = document.querySelector('.dropdown-search-popup');
    const overlay = document.querySelector('.dropdown-search-overlay');
    const styles = document.getElementById('dropdown-search-styles');
    
    if (popup) popup.remove();
    if (overlay) overlay.remove();
    if (styles) styles.remove();
    
    // 重新初始化
    dropdownSearch = new DropdownSearchExtension();
  }
}).observe(document, { subtree: true, childList: true });