/**

推特：观海bit - https://x.com/guanhaibit
TG：观海bit - https://t.co/KOThlkKZsq

脚本介绍：
这是一个纯前端的 edgex 自动化刷量的脚本，帮助大家减少手动操作刷前 100w 交易量，同时手续费和磨损非常低。
核心策略：中间价挂限价单，再实时监控是否存在订单，如果有则市价平仓；
实测 100w 交易，损耗：270u左右；

操作流程：
1. 打开 edgex 交易页面：https://pro.edgex.exchange/trade/BTCUSDT
2. 在购买数量的里，写入你想单笔刷量的数量，我一般写个0.005；
3. 打开 Chrome 控制台，把下面👇脚本代码粘贴进去，敲回车

**/


// ============ 模块1：市价平仓模块 ============
let isClosingPosition = false;

const closePositionInterval = setInterval(() => {
  try {
    if (isClosingPosition) {
      return;
    }
    
    // 1. 获取第一个 border-x-0 class 的元素（tr）
    const trElement = document.getElementsByClassName('border-x-0')[0];
    
    if (!trElement) {
      return;
    }
    
    // 2. 在 tr 中查找包含"市价"文本的 button
    const buttons = trElement.querySelectorAll('button');
    
    for (let button of buttons) {
      const spanElement = button.querySelector('span[data-state="closed"]');
      if (spanElement && spanElement.textContent.trim() === '市价') {
        console.log('🎯 [平仓] 找到市价按钮，正在点击...');
        
        isClosingPosition = true;
        button.click();
        
        // 点击确认按钮
        setTimeout(() => {
          try {
            const confirmButton = document.getElementsByClassName('rounded-2xl')[4];
            if (confirmButton) {
              console.log('✅ [平仓] 找到确认按钮，正在点击...');
              confirmButton.click();
              console.log('🎉 [平仓] 完成：市价 → 确认');
            } else {
              console.log('⚠️ [平仓] 未找到确认按钮');
            }
          } catch (error) {
            console.error('❌ [平仓] 点击确认按钮时出错:', error);
          } finally {
            // 等待1秒后解锁
            setTimeout(() => {
              isClosingPosition = false;
            }, 1000);
          }
        }, 300);
        
        // 超时保护
        setTimeout(() => {
          if (isClosingPosition) {
            console.warn('⚠️ [平仓] 操作超时，强制解锁');
            isClosingPosition = false;
          }
        }, 5000);
        
        break;
      }
    }
  } catch (error) {
    console.error('❌ [平仓] 脚本执行出错:', error);
    isClosingPosition = false;
  }
}, 500);


// ============ 模块2：下单模块 ============
let isPlacingOrder = false;

// 生成随机延迟时间（5-10秒）
function getRandomDelay() {
  return Math.floor(Math.random() * 5000) + 5000; // 5000-10000ms
}

function placeOrder() {
  if (isPlacingOrder) {
    return;
  }
  
  console.log('💰 [下单] 开始下单流程...');
  isPlacingOrder = true;
  
  try {
    // 1. 点击设置价格按钮
    const priceButton = document.getElementsByClassName('text-green-500')[0];
    if (priceButton) {
      console.log('💰 [下单] 找到设置价格按钮，正在点击...');
      priceButton.click();
      
      // 2. 等待300ms后，点击下单按钮
      setTimeout(() => {
        try {
          const orderButton = document.getElementsByClassName('rounded-xl')[1];
          if (orderButton) {
            console.log('📝 [下单] 找到下单按钮，正在点击...');
            orderButton.click();
            console.log('🎉 [下单] 完成：设置价格 → 下单');
          } else {
            console.log('⚠️ [下单] 未找到下单按钮');
          }
        } catch (error) {
          console.error('❌ [下单] 点击下单按钮时出错:', error);
        } finally {
          isPlacingOrder = false;
          
          // 随机延迟后进行下一次下单
          const randomDelay = getRandomDelay();
          console.log(`⏳ [下单] 随机等待 ${(randomDelay/1000).toFixed(1)}秒 后进行下一次下单...`);
          setTimeout(placeOrder, randomDelay);
        }
      }, 300);
      
    } else {
      console.log('⚠️ [下单] 未找到设置价格按钮');
      isPlacingOrder = false;
      
      // 失败了也继续下一轮
      const randomDelay = getRandomDelay();
      setTimeout(placeOrder, randomDelay);
    }
  } catch (error) {
    console.error('❌ [下单] 脚本执行出错:', error);
    isPlacingOrder = false;
    
    // 出错也继续下一轮
    const randomDelay = getRandomDelay();
    setTimeout(placeOrder, randomDelay);
  }
}

// 启动下单模块（首次随机延迟5-10秒后开始）
const firstDelay = getRandomDelay();
console.log(`⏳ [下单] ${(firstDelay/1000).toFixed(1)}秒 后开始首次下单...`);
setTimeout(placeOrder, firstDelay);


// ============ 控制面板 ============
console.log('🚀 =================================');
console.log('🚀 脚本已启动！包含两个独立模块：');
console.log('🚀 =================================');
console.log('');
console.log('📌 [模块1] 市价平仓：每300ms检测，自动平仓');
console.log('   流程：市价 → 确认');
console.log('');
console.log('📌 [模块2] 自动下单：每5-10秒随机间隔下单');
console.log('   流程：设置价格 → 下单');
console.log('');
console.log('🛑 停止平仓模块：clearInterval(' + closePositionInterval + ')');
console.log('🛑 停止所有：location.reload() 或 刷新页面');
console.log('🚀 =================================');
