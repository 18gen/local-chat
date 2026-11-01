// Every piece of text users see or hear: visible copy, aria-labels,
// screen-reader-only text, tooltips and placeholders. Developer-facing text
// (thrown errors, console output, comments) stays in English.
export const ja = {
  /** BCP 47 tag for Intl date and number formatting. */
  locale: "ja-JP",
  app: {
    name: "LocalChat",
    description: "ローカルチャットアプリ",
  },
  nav: {
    chatGroup: "チャット",
    chat: "AIチャット",
  },
  sidebar: {
    toggle: "サイドバーを開閉",
    mobileTitle: "サイドバー",
    mobileDescription: "モバイル用のサイドバーを表示します。",
  },
  chat: {
    emptyTitle: "何をお手伝いしましょうか？",
    retentionNotice: (lifetime: string) =>
      `メッセージは${lifetime}たつと自動的に削除され、この画面を離れるとすべて消去されます。`,
    placeholderNotice: "モデルが接続されるまで、返信は仮のテキストです。",
    mockReply: "これは仮の返信です。モデルはまだ接続されていません。",
    transcript: "メッセージ一覧",
    typing: "返信を作成しています",
    scrollToLatest: "最新のメッセージへ移動",
  },
  composer: {
    placeholder: "何でも聞いてください",
    label: "メッセージ",
    send: "メッセージを送信",
  },
  copy: {
    idle: "コピー",
    copied: "コピーしました",
    failed: "コピーできませんでした",
  },
  account: {
    plans: {
      free: "無料プラン",
    },
  },
  settings: {
    title: "設定",
    description: "アカウント情報と表示の設定",
    account: "アカウント",
    appearance: "外観",
    theme: "テーマ",
    themes: {
      system: "システム",
      light: "ライト",
      dark: "ダーク",
    },
  },
  common: {
    close: "閉じる",
  },
  duration: (hours: number, minutes: number) =>
    hours > 0
      ? `${hours}時間${minutes > 0 ? `${minutes}分` : ""}`
      : `${minutes}分`,
} as const;
