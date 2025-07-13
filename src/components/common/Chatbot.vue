<script setup>
import { ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import chatbotApi from "@/api/chatbotApi.js";
import { useAuthStore } from "@/stores/auth.js";

const isOpen = ref(false);
const userInput = ref('');
const isTyping = ref(false);
const selectedType = ref(null);
const messages = ref([
  { from: 'bot', text: '안녕하세요! 어떤 서비스를 이용하시겠어요?', isInit: true }
]);

const authStore = useAuthStore();
const { userRole, userId } = authStore;
const router = useRouter();

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    selectedType.value = null;
    messages.value = [
      { from: 'bot', text: '안녕하세요! 어떤 서비스를 이용하시겠어요?', isInit: true }
    ];
  }
};

const selectType = (type) => {
  selectedType.value = type;
  const typeText = type === 'system' ? '사내 시스템 이용 Q&A' : '사내 데이터 기반 Q&A';
  messages.value.push({ from: 'user', text: typeText });
  isTyping.value = true;
  scrollToBottom();

  setTimeout(() => {
    let botMessage = '';
    if (type === 'system') {
      botMessage = `사내 시스템 이용에 대한 질문을 도와드릴게요. 🙌\n\n※ 일부 메뉴는 직책(예: 마스터 관리자, 인사 관리자 등)에 따라 접근 및 기능 사용에 제한이 있을 수 있습니다.`;
    } else {
      botMessage = `사내 데이터 기반 질의 응답을 시작합니다. 📊\n\n아래 항목에 대해서만 질문이 가능합니다:\n\n- 사원 정보\n- 내 부서 구성원 정보\n- 나의 출퇴근 통계\n- 나의 휴가 일정\n- 부서 동료의 예정된 1달 간 휴가\n- 나의 1달 간 출장\n- 진행 중인 KPI 현황\n- 회사 정보\n- 다가오는 휴일`;
    }

    messages.value.push({ from: 'bot', text: botMessage });
    messages.value.push({ from: 'bot', text: '궁금한 내용을 입력해주세요!' });
    isTyping.value = false;
    scrollToBottom();
  }, 1000);
};

const roleMap = {
  MASTER: '마스터 관리자',
  HR_MANAGER: '인사 관리자',
  MANAGER: '팀장',
  BOOKKEEPING: '경리 관리자'
};

const sendUserMessage = async () => {
  const message = userInput.value.trim();
  if (!message || !selectedType.value) return;

  messages.value.push({ from: 'user', text: message });
  userInput.value = '';
  isTyping.value = true;
  scrollToBottom();

  try {
    let response;
    if (selectedType.value === 'system') {
      const roleList = Array.isArray(userRole)
          ? userRole.map(r => roleMap[r] || r)
          : [roleMap[userRole] || userRole];

      response = await chatbotApi.post('/ask', {
        query: message,
        session_id: String(userId),
        roles: roleList
      });
    } else if (selectedType.value === 'hr') {
      response = await chatbotApi.post('/ask-hr', {
        employee_id: userId,
        question: message
      });
    }

    messages.value.push({
      from: 'bot',
      text: response?.data?.answer || '응답이 없습니다.'
    });

    const endpoint = response?.data?.endpoint || '';
    if (endpoint) {
      messages.value.push({
        from: 'bot',
        text: '🔗 관련 페이지로 이동',
        isLink: true,
        endpoint
      });
    }
  } catch (error) {
    messages.value.push({ from: 'bot', text: '오류가 발생했습니다. 다시 시도해주세요.' });
  } finally {
    isTyping.value = false;
    scrollToBottom();
  }
};

const handleMessageClick = (msg) => {
  if (msg.isLink && msg.endpoint) {
    router.push(msg.endpoint);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    const el = document.getElementById('chatMessages');
    if (el) el.scrollTop = el.scrollHeight;
  });
};
</script>

<template>
  <div>
    <!-- Chat Button -->
    <div class="chat-button-container">
      <button class="chat-button" @click="toggleChat">
        <img src="@/assets/icons/logo_light.png" alt="Momentum Logo" style="height: 36px;" />
      </button>
    </div>

    <!-- Fixed Chat Panel -->
    <div class="chat-fixed" v-show="isOpen">
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

        <!-- Initial Type Selection -->
        <div class="chat-faq" v-if="!selectedType">
          <button class="faq-btn" @click="selectType('system')">사내 시스템 이용 Q&A</button>
          <button class="faq-btn" @click="selectType('hr')">사내 데이터 기반 Q&A</button>
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
            <div
                :class="msg.from === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'"
                @click="handleMessageClick(msg)"
                :style="msg.isLink ? 'cursor: pointer; color: var(--purple-700); text-decoration: underline;' : ''"
            >
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
        <div class="chat-input-area" v-if="selectedType">
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
</template>


<style scoped>
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
  color: var(--color-surface);
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
.chat-fixed {
  position: fixed;
  bottom: 10px;
  right: 24px;
  z-index: 100;
}
.chat-modal {
  width: 100%;
  max-width: 400px;
  height: 40rem;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--chatbot-radius);
  box-shadow: 0 4px 30px rgba(0,0,0,0.15);
  overflow: hidden;
}
.chat-header {
  background: var(--chatbot-gradient);
  color: var(--color-surface);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-header .left {
  display: flex;
  align-items: center;
  gap: 10px;
}
#closeChat {
  background: transparent;
  color: var(--color-surface);
  border: none;
  cursor: pointer;
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
.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scroll-behavior: smooth;
}
.message {
  display: flex;
  gap: 10px;
}
.message.user {
  justify-content: flex-end;
}
.chat-bubble-user {
  background: var(--purple-100);
  color: var(--color-surface);
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
  color: var(--color-surface);
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
  animation: bounce 1s infinite ease-in-out;
}
.typing-indicator:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
</style>
