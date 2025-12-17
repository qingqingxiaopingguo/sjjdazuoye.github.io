// -------------------------- 数据层：核心数据定义 --------------------------
// 商品原始数据集：存储所有商品的基础信息，是页面渲染和交互的数据源
// 每个商品对象包含：唯一标识id、商品名称title、价格price、分类category、图片地址img
const products = [
  { id: 1, title: "无线耳机", price: 299, category: "electronics", img: "无线耳机.jpg" },
  { id: 2, title: "T恤衫", price: 89, category: "clothing", img: "T恤衫.png" },
  { id: 3, title: "巧克力", price: 25, category: "food", img: "巧克力.png" },
  { id: 4, title: "编程指南", price: 68, category: "books", img: "编程指南.jpg" },
  { id: 5, title: "智能手表", price: 1299, category: "electronics", img: "智能手表.png" },
  { id: 6, title: "牛仔裤", price: 199, category: "clothing", img: "牛仔裤.jpg" },
  { id: 7, title: "坚果礼盒", price: 158, category: "food", img: "坚果礼盒.webp" },
  { id: 8, title: "小说集", price: 45, category: "books", img: "小说集.jpg" },
];

// 购物车数据：从本地存储(localStorage)读取已有购物车数据，若不存在则初始化为空数组
// localStorage用于持久化存储，关闭页面后购物车数据不丢失；JSON.parse用于将字符串转为数组对象
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// -------------------------- DOM 元素获取：缓存页面节点 --------------------------
// 获取商品列表容器DOM节点：用于渲染商品卡片的父容器
const productList = document.getElementById('productList');
// 获取搜索输入框DOM节点：用于监听用户输入的搜索关键词
const searchInput = document.getElementById('searchInput');
// 获取所有分类列表项DOM节点：NodeList集合，对应侧边栏的分类选项（如电子产品、服装等）
const categoryItems = document.querySelectorAll('.category-list li');
// 获取购物车图标DOM节点：点击后打开购物车弹窗
const cartIcon = document.getElementById('cartIcon');
// 获取购物车弹窗DOM节点：购物车的浮层容器
const cartModal = document.getElementById('cartModal');
// 获取关闭购物车按钮DOM节点：点击后关闭购物车弹窗
const closeCart = document.getElementById('closeCart');
// 获取购物车商品列表容器DOM节点：渲染购物车内商品项的父容器
const cartItemsEl = document.getElementById('cartItems');
// 获取购物车总价显示DOM节点：展示购物车所有商品的总金额
const cartTotalEl = document.getElementById('cartTotal');
// 获取购物车数量标记DOM节点：展示购物车商品总数量（右上角小红点）
const cartCountEl = document.getElementById('cartCount');

// -------------------------- 筛选条件：全局状态管理 --------------------------
// 当前筛选条件对象：用于存储用户选择的分类和输入的搜索关键词，作为商品筛选的依据
// category默认值'all'表示显示所有分类；search默认空字符串表示无搜索条件
let currentFilter = { category: 'all', search: '' };

// -------------------------- 核心功能函数：商品渲染 --------------------------
/**
 * 渲染商品列表：根据筛选条件过滤商品，并生成商品卡片插入页面
 * @param {Object} filter - 筛选条件对象，默认值为空（使用currentFilter）
 *        filter.category - 分类筛选值（all/electronics/clothing/food/books）
 *        filter.search - 搜索关键词（模糊匹配商品标题）
 */
function renderProducts(filter = {}) {
  // 清空商品列表容器：避免重复渲染，每次渲染前重置容器内容
  productList.innerHTML = '';
  
  // 商品筛选逻辑：根据分类和搜索关键词过滤原始商品数组
  const filtered = products.filter(p => {
    // 分类匹配：若筛选分类为'all'则匹配所有，否则匹配商品的category属性
    const matchCategory = filter.category === 'all' || p.category === filter.category;
    // 搜索匹配：将商品标题和搜索关键词都转为小写，实现不区分大小写的模糊匹配
    const matchSearch = p.title.toLowerCase().includes((filter.search || '').toLowerCase());
    // 同时满足分类和搜索条件的商品才会被保留
    return matchCategory && matchSearch;
  });

  // 遍历筛选后的商品数组，生成商品卡片DOM
  filtered.forEach(product => {
    // 创建商品卡片容器div
    const card = document.createElement('div');
    // 为卡片添加样式类，控制外观
    card.className = 'product-card';
    // 拼接商品卡片的HTML结构：包含图片、标题、价格、加入购物车按钮
    // onclick="addToCart(${product.id})"：点击按钮时调用addToCart函数，传入商品id
    card.innerHTML = `
      <img src="${product.img}" alt="${product.title}" class="product-img">
      <div class="product-info">
        <div class="product-title">${product.title}</div>
        <div class="product-price">¥${product.price}</div>
        <button class="add-to-cart" onclick="addToCart(${product.id})">加入购物车</button>
      </div>
    `;
    // 将商品卡片添加到商品列表容器中，完成单个商品渲染
    productList.appendChild(card);
  });
}

// -------------------------- 核心功能函数：购物车操作 --------------------------
/**
 * 添加商品到购物车：挂载到window对象，使HTML内联onclick能调用
 * @param {Number} id - 要添加的商品id
 */
window.addToCart = function(id) {
  // 根据id从原始商品数组中找到对应的商品对象
  const product = products.find(p => p.id === id);
  // 检查购物车中是否已存在该商品（通过id匹配）
  const existing = cart.find(item => item.id === id);
  
  if (existing) {
    // 若已存在：商品数量+1（避免重复添加相同商品，只更新数量）
    existing.quantity += 1;
  } else {
    // 若不存在：将商品对象拷贝并添加quantity属性（初始值1），推入购物车数组
    cart.push({ ...product, quantity: 1 });
  }
  
  // 保存购物车数据到本地存储：持久化更新后的数据
  saveCart();
  // 更新购物车UI：同步刷新购物车数量、列表、总价
  updateCartUI();
};

/**
 * 从购物车移除商品：挂载到window对象，供购物车项的“移除”按钮调用
 * @param {Number} id - 要移除的商品id
 */
window.removeFromCart = function(id) {
  // 过滤购物车数组：保留id不等于目标id的商品，实现移除效果
  cart = cart.filter(item => item.id !== id);
  // 保存更新后的购物车数据到本地存储
  saveCart();
  // 更新购物车UI
  updateCartUI();
  // 重新渲染商品列表：确保筛选状态下的商品列表同步（可选，此处为兼容特殊场景）
  render(currentFilter);
};

/**
 * 保存购物车数据到本地存储：将购物车数组转为JSON字符串后存储
 * 解决页面刷新/关闭后购物车数据丢失问题
 */
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * 更新购物车UI：同步购物车数量标记、商品列表、总价的显示
 * 每次购物车数据变化后（添加/移除）都需调用
 */
function updateCartUI() {
  // 计算购物车商品总数量：遍历购物车数组，累加每个商品的quantity属性
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  // 更新购物车数量标记的显示文本
  cartCountEl.textContent = totalItems;

  // 清空购物车商品列表容器：避免重复渲染
  cartItemsEl.innerHTML = '';
  // 初始化购物车总价为0
  let totalPrice = 0;

  // 判断购物车是否为空
  if (cart.length === 0) {
    // 空购物车时显示提示文本，样式居中、灰色
    cartItemsEl.innerHTML = '<p style="text-align:center;color:#999;">购物车为空</p>';
  } else {
    // 非空时遍历购物车数组，渲染每个商品项
    cart.forEach(item => {
      // 累加单个商品总价（单价*数量）到总价格
      totalPrice += item.price * item.quantity;
      // 创建购物车商品项容器div
      const div = document.createElement('div');
      // 添加样式类控制外观
      div.className = 'cart-item';
      // 拼接购物车项HTML结构：包含图片、标题、价格+数量、移除按钮
      div.innerHTML = `
        <img src="${item.img}" alt="${item.title}">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">¥${item.price} × ${item.quantity}</div>
        </div>
        <button class="remove-item" onclick="removeFromCart(${item.id})">移除</button>
      `;
      // 将购物车项添加到购物车列表容器
      cartItemsEl.appendChild(div);
    });
  }

  // 更新购物车总价显示：toFixed(2)确保保留两位小数（金额格式）
  cartTotalEl.textContent = `¥${totalPrice.toFixed(2)}`;
}

// -------------------------- 交互事件绑定：购物车弹窗 --------------------------
// 点击购物车图标：显示购物车弹窗（设置display为flex，弹窗居中），并更新购物车UI
cartIcon.onclick = () => {
  cartModal.style.display = 'flex';
  updateCartUI();
};
// 点击关闭购物车按钮：隐藏购物车弹窗（设置display为none）
closeCart.onclick = () => cartModal.style.display = 'none';
// 点击弹窗遮罩层（非内容区）：关闭购物车弹窗（增强用户体验）
window.onclick = e => { if (e.target === cartModal) cartModal.style.display = 'none'; };

// -------------------------- 交互事件绑定：分类筛选 --------------------------
// 遍历所有分类列表项，为每个项绑定点击事件
categoryItems.forEach(item => {
  item.onclick = () => {
    // 移除所有分类项的active类（取消之前选中状态）
    document.querySelector('.category-list li.active').classList.remove('active');
    // 为当前点击的分类项添加active类（高亮选中状态）
    item.classList.add('active');
    // 更新全局筛选条件的category值：从分类项的data-category属性获取（如electronics）
    currentFilter.category = item.dataset.category;
    // 根据更新后的筛选条件重新渲染商品列表
    renderProducts(currentFilter);
  };
});

// -------------------------- 交互事件绑定：搜索功能 --------------------------
// 搜索输入框输入事件（实时监听）：输入内容变化时触发
searchInput.oninput = () => {
  // 更新全局筛选条件的search值：去除输入内容的首尾空格
  currentFilter.search = searchInput.value.trim();
  // 根据更新后的搜索条件重新渲染商品列表
  renderProducts(currentFilter);
};

// -------------------------- 交互事件绑定：结算功能 --------------------------
// 为结算按钮绑定点击事件
document.querySelector('.checkout-btn').onclick = () => {
  // 购物车为空时提示用户
  if (cart.length === 0) {
    alert('购物车为空！');
  } else {
    // 购物车非空时提示总价（实际项目中此处对接支付接口）
    alert('结算功能待开发，当前总价：' + cartTotalEl.textContent);
  }
};

// -------------------------- 页面初始化：首次加载 --------------------------
// 初始渲染商品列表（使用默认筛选条件：显示所有分类、无搜索关键词）
renderProducts(currentFilter);
// 初始更新购物车UI（加载本地存储的购物车数据并显示）
updateCartUI();