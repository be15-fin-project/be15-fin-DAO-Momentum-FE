// utils/toastError.js
import { useToast } from "vue-toastification";

export function toastError(e, defaultMessage) {
    const toast = useToast();
    const raw = e?.response?.data?.message || '';

    const isValidationError = raw.startsWith('입력 값 검증 오류입니다.') && raw.includes('[') && raw.includes(']');
    if (isValidationError) {
        const matched = raw.match(/\[(.*?)\]/);
        if (matched) {
            const firstMessage = matched[1].split(' : ')[1]?.trim();
            toast.error(firstMessage || '입력 값 검증 오류입니다.');
        } else {
            toast.error('입력 값 검증 오류입니다.');
        }
        /* 여러 개 보여주고 싶으면 */
        // const matchedMessages = [...raw.matchAll(/\[(.*?)\]/g)];
        // const messages = matchedMessages.map(match => {
        //     const parts = match[1].split(' : ');
        //     return parts[1]?.trim() ?? match[1];
        // });
        // toast.error(messages.join('\n') || '입력 값 검증 오류입니다.');
    } else {
        toast.error(raw || defaultMessage);
    }
}
