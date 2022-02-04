import styled from "styled-components";
import { Avatar } from "@material-ui/core";
import GroupIcon from "@material-ui/icons/Group";

const Container = styled("div")<{ highlighted: boolean }>`
  width: 100%;
  height: 77px;
  padding: 10px 24px 10px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.globalTheme.greyLineColor};
  background-color: ${(props) =>
    props.highlighted ? props.theme.globalTheme.selectGrey : "white"};

  &:hover {
    cursor: pointer;
    background-color: ${(props) =>
      props.highlighted
        ? props.theme.globalTheme.selectGrey
        : props.theme.globalTheme.hoverGrey};
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 16px;
  justify-content: space-between;
  width: 100%;
`;

const Name = styled.p`
  font-size: 19px;
  font-weight: 400;
`;

const LatestMessage = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.globalTheme.greyMessageColor};
  font-weight: 300;
`;

const TimeOfLatestMessage = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  align-self: start;
  font-size: 12px;
  color: ${({ theme }) => theme.globalTheme.greyMessageColor};
  font-weight: 300;
  width: 75px;
`;

interface ChatProps {
  isHighlighted: boolean;
  onClick: () => void;
  name: string;
  isGroupChat: boolean;
  latestMessage: string | undefined;
  timeOfLatestMessage: string | JSX.Element | undefined;
}

const Chat: React.FC<ChatProps> = ({
  isHighlighted,
  onClick,
  name,
  isGroupChat,
  latestMessage,
  timeOfLatestMessage,
}) => {
  return (
    <Container highlighted={isHighlighted} onClick={onClick}>
      {isGroupChat ? (
        <Avatar style={{ width: "52px", height: "52px" }}>
          <GroupIcon style={{ width: "40px", height: "40px" }} />
        </Avatar>
      ) : (
        <Avatar style={{ width: "52px", height: "52px" }} />
      )}
      <TextContainer>
        <Name>{name}</Name>
        {latestMessage && <LatestMessage>{latestMessage}</LatestMessage>}
      </TextContainer>
      <TimeOfLatestMessage>{timeOfLatestMessage}</TimeOfLatestMessage>
    </Container>
  );
};

export default Chat;
