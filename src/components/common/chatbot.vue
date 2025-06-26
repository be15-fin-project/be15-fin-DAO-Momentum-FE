<template>
  <div>
    <!-- Chat Button -->
    <div class="chat-button-container">
      <button class="chat-button" @click="toggleChat">
        <img src="@/assets/icons/logo_light.png" alt="Momentum Logo" style="height: 36px;" />
      </button>
    </div>

    <!-- Chat Modal -->
    <div id="chatModal" v-show="isOpen">
      <div class="chat-modal-wrapper">
        <div class="chat-modal">
          <div class="chat-header">
            <div class="left">
              <img src="@/assets/icons/logo_light.png" alt="Momentum Logo" style="height: 42px;" />
              <div>
                <h3>챗봇 상담</h3>
                <p style="font-size: 0.75rem; opacity: 0.9;">온라인</p>
              </div>
            </div>
            <button id="closeChat" @click="toggleChat">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- FAQ Buttons -->
          <div class="chat-faq">
            <button
                v-for="(answer, question) in faqData"
                :key="question"
                class="faq-btn"
                :class="{ active: activeQuestion === question }"
                @click="handleFAQ(question)"
            >
              {{ question }}
            </button>
          </div>

          <!-- Messages -->
          <div id="chatMessages" class="chat-messages">
            <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.from]">
              <div class="chat-avatar">
                <template v-if="msg.from === 'user'">
                  <i class="fas fa-user" style="color: white;"></i>
                </template>
                <template v-else>
                  <img src="@/assets/icons/logo.png" alt="Bot Avatar" style="height: 22px;" />
                </template>
              </div>
              <div :class="msg.from === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'">
                {{ msg.text }}
              </div>
            </div>
            <div v-if="isTyping" class="message">
              <div class="chat-avatar">
                <img src="@/assets/icons/logo.png" alt="Bot Avatar" style="height: 22px;" />
              </div>
              <div>
                <div class="typing-indicator"></div>
                <div class="typing-indicator"></div>
                <div class="typing-indicator"></div>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="chat-input-area">
            <input
                v-model="userInput"
                @keypress.enter="sendUserMessage"
                type="text"
                placeholder="메시지를 입력하세요..."
            />
            <button @click="sendUserMessage">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const isOpen = ref(false);
const userInput = ref('');
const activeQuestion = ref(null);
const isTyping = ref(false);
const messages = ref([
  { from: 'bot', text: '안녕하세요! 삼성카드 챗봇 샘입니다. 무엇을 도와드릴까요?' }
]);

const faqData = {
  '가격 문의': '상품별로 가격이 다릅니다. 구체적인 상품명을 알려주시면 정확한 가격을 안내해드리겠습니다.',
  '결제 방법': '신용카드, 체크카드, 계좌이체, 휴대폰 결제, 카카오페이, 네이버페이 등 다양한 결제 방법을 지원합니다.',
  '배송 정보': '평일 오후 2시 이전 주문 시 당일 발송됩니다. 배송은 보통 1-2일 소요되며, 무료배송 기준은 3만원 이상입니다.',
  '환불 정책': '상품 수령 후 7일 이내 환불 신청이 가능합니다. 단순 변심의 경우 반품비가 발생할 수 있습니다.',
  '고객센터': '고객센터는 평일 09:00-18:00 운영됩니다. 전화: 1588-1234 또는 이메일: support@company.com으로 문의해주세요.'
};

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  document.body.style.overflow = isOpen.value ? 'hidden' : 'auto';
};

const handleFAQ = (question) => {
  activeQuestion.value = question;
  messages.value.push({ from: 'user', text: question });
  addBotMessage(faqData[question]);
};

const sendUserMessage = () => {
  const message = userInput.value.trim();
  if (!message) return;
  messages.value.push({ from: 'user', text: message });
  userInput.value = '';
  replyToUser(message);
};

const replyToUser = (message) => {
  const lower = message.toLowerCase();
  let reply = '죄송합니다. 좀 더 구체적으로 입력해 주세요.';

  if (lower.includes('가격') || lower.includes('비용')) reply = faqData['가격 문의'];
  else if (lower.includes('결제')) reply = faqData['결제 방법'];
  else if (lower.includes('배송')) reply = faqData['배송 정보'];
  else if (lower.includes('환불') || lower.includes('반품')) reply = faqData['환불 정책'];
  else if (lower.includes('고객센터') || lower.includes('전화')) reply = faqData['고객센터'];
  else if (lower.includes('안녕') || lower.includes('hello')) reply = '안녕하세요! 무엇을 도와드릴까요?';
  else if (lower.includes('감사') || lower.includes('고마워')) reply = '감사합니다. 더 궁금한 점이 있으신가요?';

  isTyping.value = true;
  setTimeout(() => {
    isTyping.value = false;
    messages.value.push({ from: 'bot', text: reply });
    scrollToBottom();
  }, 1000);
};

const scrollToBottom = () => {
  nextTick(() => {
    const el = document.getElementById('chatMessages');
    if (el) el.scrollTop = el.scrollHeight;
  });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');
.chat-button-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 50;
}
.chat-button {
  width: 64px;
  height: 64px;
  background: var(--chatbot-gradient);
  color: var(--basic);
  border-radius: var(--round-radius);
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--chatbot-shadow);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}
.chat-button:hover {
  transform: scale(1.1);
}
#chatModal {
  position: fixed;
  inset: 0;
  z-index: 100;
}
.chat-modal-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  height: 100%;
  padding: 16px;
}
.chat-modal {
  width: 100%;
  max-width: 400px;
  height: 40rem;
  display: flex;
  flex-direction: column;
  background: var(--basic);
  border-radius: var(--chatbot-radius);
  box-shadow: 0 4px 30px rgba(0,0,0,0.15);
}
.chat-header {
  background: var(--chatbot-gradient);
  color: var(--basic);
  padding: 16px;
  border-radius: var(--chatbot-radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-header .left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.chat-header h3 {
  margin: 0;
  font-weight: 600;
}
.chat-header p {
  margin: 0;
  font-weight: 400;
}
#closeChat {
  background: transparent;
  color: var(--basic);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: var(--round-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  cursor: pointer;
}
#closeChat:hover {
  background: var(--hover-gray);
}
.chat-faq {
  padding: 12px 16px;
  border-bottom: 1px solid #E5E7EB;
}
.chat-faq button {
  background: var(--gray-50);
  border: 1px solid transparent;
  color: var(--gray-700);
  padding: 6px 14px;
  border-radius: var(--round-radius);
  margin-right: 6px;
  cursor: pointer;
}
.chat-faq button.active {
  background: var(--gray-50);
  border: 2px solid var(--purple-100);
  color: var(--purple-500);
  font-weight: 600;
}
.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scroll-behavior: smooth;
}
.chat-messages::-webkit-scrollbar {
  width: 4px;
}
.message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.message.user {
  justify-content: flex-end;
}
.chat-bubble-user {
  background: var(--purple-100);
  color: var(--basic);
  padding: 10px 14px;
  border-radius: 16px;
  max-width: 75%;
}
.chat-bubble-bot {
  background: var(--gray-50);
  color: var(--gray-800);
  padding: 10px 14px;
  border-radius: 16px;
  max-width: 75%;
}
.chat-avatar {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gray-100);
  flex-shrink: 0;
}
.chat-input-area {
  padding: 16px;
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: 8px;
}
.chat-input-area input {
  flex: 1;
  border: 1px solid var(--gray-200);
  border-radius: 9999px;
  padding: 8px 16px;
}
.chat-input-area button {
  width: 40px;
  height: 40px;
  background: var(--chatbot-gradient);
  color: var(--basic);
  border-radius: 50%;
  border: none;
  cursor: pointer;
}
.typing-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--gray-400);
  animation: typing 1.4s infinite ease-in-out;
}
.typing-indicator:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator:nth-child(2) { animation-delay: -0.16s; }
@keyframes typing {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* 메시지 애니메이션 (왼쪽/오른쪽 슬라이드 인) */
.message.bot {
  animation: slideInLeft 0.3s ease;
}
.message.user {
  animation: slideInRight 0.3s ease;
}
@keyframes slideInLeft {
  from {
    transform: translateX(-40px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes slideInRight {
  from {
    transform: translateX(40px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 챗봇 창 열릴 때 페이드 인 + 업 애니메이션 */
.chat-modal-wrapper {
  animation: fadeInUp 0.35s ease;
}
@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* FAQ 버튼 클릭 시 반짝 효과 */
.faq-btn.active {
  animation: pulse 0.4s;
}
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}

/* 전송 버튼 눌렀을 때 팝 효과 */
.chat-input-area button:active {
  animation: buttonPop 0.2s;
}
@keyframes buttonPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* 타이핑 인디케이터: 튕김 애니메이션 */
.typing-indicator {
  animation: bounce 1s infinite ease-in-out;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

</style>
