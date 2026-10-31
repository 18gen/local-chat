// Every piece of text users see or hear: visible copy, aria-labels,
// screen-reader-only text, tooltips and placeholders. Developer-facing text
// (thrown errors, console output, comments) stays in English.
export const ja = {
  app: {
    name: "LocalChat",
    description: "ローカルチャットアプリ",
  },
  sidebar: {
    toggle: "サイドバーを開閉",
    newChat: "新しいチャット",
    history: "チャット履歴",
    historyEmpty: "まだチャットはありません",
    mobileTitle: "サイドバー",
    mobileDescription: "モバイル用のサイドバーを表示します。",
  },
  chat: {
    emptyTitle: "何をお手伝いしましょうか？",
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
} as const;
