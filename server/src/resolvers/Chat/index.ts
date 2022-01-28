import {
  Resolver,
  Mutation,
  UseMiddleware,
  Ctx,
  Arg,
  Int,
  Query,
  FieldResolver,
  Root,
} from "type-graphql";
import { getConnection } from "typeorm";

import { isAuth } from "../../middleware/isAuth";
import { MyContext } from "../../types";
import { Chat } from "../../entities/Chat";
import { ChatMember } from "../../entities/ChatMember";
import { Message } from "../../entities/Message";
import { User } from "../../entities/User";

@Resolver((of) => Chat)
export class ChatResolver {
  @FieldResolver(() => [Message!], { nullable: true })
  async messages(
    @Root() chat: Chat,
    @Ctx() { messageLoader }: MyContext,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<Message[] | null> {
    return messageLoader.getMessages({ limit, cursor }).load(chat.id);
  }

  @FieldResolver(() => [User])
  async members(
    @Root() chat: Chat,
    @Ctx() { chatMemberLoader, req }: MyContext
  ): Promise<(User | Error)[]> {
    const chatMembers = await chatMemberLoader.load(chat.id);
    return chatMembers
      .map((cm) => cm.user)
      .filter((user) => user.id !== Number(req.session.userId));
  }

  @Mutation(() => Chat)
  @UseMiddleware(isAuth)
  async createChat(
    @Arg("userIds", () => [Int!]!) userIds: [number],
    @Arg("groupName", { nullable: true }) groupName: string,
    @Ctx() { req }: MyContext
  ): Promise<Chat> {
    const createdById = Number(req.session.userId);
    const chat = await Chat.create({
      createdById,
      groupName,
    }).save();

    userIds.push(createdById);
    const chatMembers: Array<{ userId: number; chatId: number }> = userIds.map(
      (userId) => ({ userId, chatId: chat.id })
    );

    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(ChatMember)
      .values(chatMembers)
      .execute();

    return chat;
  }

  @Query(() => [Chat])
  @UseMiddleware(isAuth)
  getChats(@Ctx() { req }: MyContext): Promise<Chat[]> {
    const userId = Number(req.session.userId);
    return getConnection()
      .createQueryBuilder()
      .select("chat")
      .from(Chat, "chat")
      .leftJoin("chat.chatMembers", "chatMember")
      .where("chat.createdById = :createdById", { createdById: userId })
      .orWhere("chatMember.userId = :userId", { userId })
      .orderBy("chat.updatedAt", "DESC")
      .getMany();
  }

  @Query(() => Chat)
  @UseMiddleware(isAuth)
  async getChat(
    @Arg("chatId", () => Int) chatId: number,
    @Ctx() { req }: MyContext
  ): Promise<Chat> {
    const chat = await Chat.findOne({
      where: { id: chatId },
      relations: ["chatMembers"],
    });

    if (!chat) throw new Error("no chat has this Id");

    const userId = Number(req.session.userId);

    const isChatMember = chat.chatMembers.find((cm) => cm.userId === userId);

    if (!isChatMember) {
      throw new Error("you are not authorized to view chat");
    }

    return chat;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async exitChat(
    @Arg("chatId", () => Int) chatId: number,
    @Ctx() { req }: MyContext
  ) {
    const userId = Number(req.session.userId);

    const chat = await Chat.findOne(chatId);

    if (!chat) throw new Error("chat does not exist");

    const chatMember = await ChatMember.findOne({ chatId, userId });

    if (!chatMember) throw new Error("unauthorized");

    chatMember.isActive = false;
    await chatMember.save();

    return true;
  }
}
