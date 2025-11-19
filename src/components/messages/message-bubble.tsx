import type { Message } from "@/types/messages";

export function MessageBubble({ message }: { message: Message }) {
    const isMe = message.fromMe;

    const bubbleClasses = isMe
        ? "rounded-2xl rounded-br-sm bg-foreground text-background"
        : "rounded-2xl rounded-bl-sm bg-muted text-foreground";

    return (
        <div
            className={`flex items-end gap-2 ${
                isMe ? "justify-end" : "justify-start"
            }`}
        >
            <div className={`max-w-[75%] whitespace-pre-wrap break-words p-3 ${bubbleClasses}`}>
                {message.content}
            </div>

            <span className="whitespace-nowrap text-[10px] text-muted-foreground">
        {message.time}
      </span>
        </div>
    );
}