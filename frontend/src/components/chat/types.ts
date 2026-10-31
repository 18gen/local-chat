export type Role = "user" | "assistant";

export type Message = {
  id: string;
  role: Role;
  content: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};
