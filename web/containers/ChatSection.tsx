import { useRef, useState, FormEvent, Fragment, ChangeEvent } from "react";

import {
  useSendMessageMutation,
  useGetMessagesQuery,
  Chat,
} from "../generated/graphql";
import { getUsersFullname } from "../utils/getUsersFullname";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter";
import { formatDate } from "../utils/dateFunctions";

import ChatScreen from "../components/ChatScreen";
import Message from "../components/Message";
import ChatForm from "../components/ChatForm";

interface ChatSectionProps {
  chatId: number;
  chat: Chat;
  userId: number;
}

const ChatSection: React.FC<ChatSectionProps> = ({ chatId, chat, userId }) => {
  const endOfMessageRef = useRef<null | HTMLDivElement>(null);
  const [messageText, setMessageText] = useState("");
  const [limit, setLimit] = useState(80);
  const [cursor, setCursor] = useState(null);
  const [sendMessage] = useSendMessageMutation();
  const { loading, error, data } = useGetMessagesQuery({
    variables: { chatId, limit, cursor },
  });

  const scrollToBottom = () => {
    endOfMessageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chatId) {
      await sendMessage({ variables: { chatId, text: messageText } });
      setMessageText("");
      scrollToBottom();
    }
  };

  return (
    <Fragment>
      <ChatScreen
        name={
          chat.groupName
            ? chat.groupName
            : getUsersFullname(chat.members, userId)
        }
        isGroupChat={!!chat.groupName}
        endOfMessageRef={endOfMessageRef}
      >
        {data?.getMessages?.map((message) => {
          const isUser = userId === Number(message.user.id);
          return (
            <Message
              key={`messageId-${message.id}`}
              isUser={isUser}
              text={message.text}
              sender={
                isUser
                  ? undefined
                  : `${capitalizeFirstLetter(
                      message.user.firstName
                    )} ${capitalizeFirstLetter(message.user.lastName)}`
              }
              dateSent={formatDate(message.createdAt)}
            />
          );
        })}
      </ChatScreen>

      <ChatForm
        onSubmit={handleSubmit}
        onChange={handleChange}
        value={messageText}
      />
    </Fragment>
  );
};

export default ChatSection;
