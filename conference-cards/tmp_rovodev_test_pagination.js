// 测试分页加载逻辑
const mockUser = { uid: 'user123' };

const mockCards = [
  { id: '1', name: '张三', userId: 'user456', createdAt: '2024-01-01' },
  { id: '2', name: '李四', userId: 'user123', createdAt: '2024-01-02' },
  { id: '3', name: '王五', userId: 'user789', createdAt: '2024-01-03' },
  { id: '4', name: '赵六', userId: 'user123', createdAt: '2024-01-04' },
  { id: '5', name: '钱七', userId: 'user456', createdAt: '2024-01-05' },
  { id: '6', name: '孙八', userId: 'user999', createdAt: '2024-01-06' },
  { id: '7', name: '周九', userId: 'user888', createdAt: '2024-01-07' },
  { id: '8', name: '吴十', userId: 'user777', createdAt: '2024-01-08' }
];

// 排序函数
const sortCards = (cards, user) => {
  if (!user) {
    return [...cards].sort(() => Math.random() - 0.5);
  }

  const userCards = [];
  const otherCards = [];

  cards.forEach(card => {
    if (card.userId === user.uid) {
      userCards.push(card);
    } else {
      otherCards.push(card);
    }
  });

  const shuffledOtherCards = [...otherCards].sort(() => Math.random() - 0.5);
  return [...userCards, ...shuffledOtherCards];
};

// 模拟分页逻辑
let sortedCards = sortCards(mockCards, mockUser);
let displayedCards = [];
const INITIAL_LOAD = 4;
const LOAD_MORE = 2;

console.log('原始卡片:', mockCards.map(c => `${c.name}(${c.userId})`));
console.log('排序后卡片:', sortedCards.map(c => `${c.name}(${c.userId})`));

// 初始加载
displayedCards = sortedCards.slice(0, INITIAL_LOAD);
console.log('初始显示:', displayedCards.map(c => `${c.name}(${c.userId})`));

// 第一次加载更多
const currentCount1 = displayedCards.length;
const nextBatch1 = sortedCards.slice(currentCount1, currentCount1 + LOAD_MORE);
displayedCards = [...displayedCards, ...nextBatch1];
console.log('第一次加载更多后:', displayedCards.map(c => `${c.name}(${c.userId})`));

// 第二次加载更多
const currentCount2 = displayedCards.length;
const nextBatch2 = sortedCards.slice(currentCount2, currentCount2 + LOAD_MORE);
displayedCards = [...displayedCards, ...nextBatch2];
console.log('第二次加载更多后:', displayedCards.map(c => `${c.name}(${c.userId})`));

// 验证用户卡片始终在前面
const userCardCount = mockCards.filter(c => c.userId === mockUser.uid).length;
const finalUserCards = displayedCards.slice(0, userCardCount);
const allUserCardsFirst = finalUserCards.every(c => c.userId === mockUser.uid);

console.log('用户卡片数量:', userCardCount);
console.log('用户卡片是否始终在前面:', allUserCardsFirst);
console.log('最终显示的用户卡片:', finalUserCards.map(c => c.name));