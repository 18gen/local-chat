// All text users see or hear, including aria-labels and placeholders.
// Developer-facing text (errors, logs, comments) stays in English.
export const ja = {
  app: {
    name: "LocalChat",
    description: "ローカルチャットアプリ",
  },
  nav: {
    chatGroup: "チャット",
    chat: "AIチャット",
    workflows: "ワークフロー",
    workflowList: "ワークフロー一覧",
    favorite: (title: string) => `${title}をお気に入りに登録`,
  },
  sidebar: {
    toggle: "サイドバーを開閉",
    open: "サイドバーを開く",
    close: "サイドバーを閉じる",
    mobileTitle: "サイドバー",
    mobileDescription: "モバイル用のサイドバーを表示します。",
  },
  breadcrumb: {
    label: "パンくずリスト",
  },
  chat: {
    emptyTitle: "何をお手伝いしましょうか？",
    aiDisclaimer:
      "AIの回答には誤りが含まれる場合があります。必ずご自身で内容を確認してください。",
    autoDeleteSuffix: "に自動消去",
    autoDeleteOption: (lifetime: string) => `${lifetime}後`,
    autoDeleteLabel: "メッセージを自動消去するまでの時間",
    autoDeleteInfo: "自動消去について",
    expiryCheckpoint: (time: string) =>
      `自動消去まで ${time}`,
    autoDeleteHelp: (lifetime: string) =>
      `回答から${lifetime}を過ぎると、その回答とそれまでのやり取りが古いものから順に自動で削除されます。\n削除したメッセージは復元できません。`,
    shortenTitle: "自動消去までの時間を短くしますか？",
    shortenDescription: (count: number) =>
      `${count}件のメッセージがすぐに削除されます。削除したメッセージは復元できません。`,
    shortenConfirm: "削除して変更",
    newChat: "新しいチャット",
    newChatTitle: "新しいチャットを始めますか？",
    newChatDescription: "現在の会話はすべて削除され、復元できません。",
    newChatConfirm: "削除して始める",
    failed: "返信を作成できませんでした。もう一度お試しください。",
    transcript: "メッセージ一覧",
    typing: "返信を作成しています",
    scrollToLatest: "最新のメッセージへ移動",
  },
  composer: {
    placeholder: "何でも聞いてください",
    label: "メッセージ",
    send: "メッセージを送信",
    stop: "回答を停止",
  },
  model: {
    label: "AIモデル",
  },
  copy: {
    idle: "コピー",
    copied: "コピーしました",
    failed: "コピーできませんでした",
  },
  account: {
    roles: {
      doctor: "医師",
      nurse: "看護師",
      pharmacist: "薬剤師",
      "radiological-technologist": "診療放射線技師",
      "laboratory-technologist": "臨床検査技師",
      "physical-therapist": "理学療法士",
      "occupational-therapist": "作業療法士",
      "speech-therapist": "言語聴覚士",
      dietitian: "管理栄養士",
      "social-worker": "医療ソーシャルワーカー",
      "medical-clerk": "医師事務作業補助者",
      "office-staff": "事務職員",
    },
  },
  settings: {
    title: "設定",
    description: "アカウント情報と表示の設定",
    account: "アカウント",
    textSize: "文字の大きさ",
    textSizeDescription: "文字やボタンなど、画面全体の大きさを変えます。",
    /** Shown in each option at that size. */
    textSizeSample: "あ",
    textSizes: { sm: "小", md: "中", lg: "大" },
  },
  patient: {
    label: "患者",
    hint: "最初に、対象の患者を選択してください。",
    searchPlaceholder: "患者ID・氏名・カナで検索",
    searchHint: "患者ID・氏名・カナを入力すると検索します。",
    searching: "検索しています…",
    noResults: "該当する患者が見つかりません。",
    failed: "検索できませんでした。もう一度お試しください。",
    narrowDown: (limit: number) =>
      `上位${limit}件を表示しています。条件を追加して絞り込んでください。`,
    id: (id: string) => `ID ${id}`,
    birth: (date: string, age: number) => `${date}生（${age}歳）`,
    genders: { male: "男性", female: "女性", other: "その他", unknown: "不明" },
    inpatient: (ward: string, room: string) => `入院中 ${ward} ${room}号室`,
    outpatient: "外来",
    namesake: "同姓同名あり",
    namesakeWarning: "同姓同名の患者がいます。IDと生年月日を確認してください。",
    change: "変更",
    changeLabel: "患者を変更",
    changeTitle: "患者を変更しますか？",
    changeDescription: "この患者について入力した内容は消去されます。",
    changeConfirm: "変更する",
  },
  encounter: {
    label: "入院",
    hint: "選んだ入院の診療記録から下書きを作成します。",
    period: (admitted: string, discharged: string | null) =>
      discharged ? `${admitted} 〜 ${discharged}` : `${admitted} 〜 入院中`,
    place: (department: string, ward: string, room: string) =>
      `${department}　${ward} ${room}号室`,
    none: "診療記録を使わない（メモだけで作成）",
    loading: "入院歴を確認しています…",
    failed: "入院歴を取得できませんでした。メモだけで下書きを作成できます。",
  },
  workflow: {
    homeTitle: "ワークフロー",
    homeDescription:
      "書類の下書きや要約を、決まった手順で作成できます。使いたいものを選んでください。",
    open: "開く",
    comingSoon: "準備中",
    comingSoonTitle: "このワークフローは準備中です",
    comingSoonDescription:
      "公開までしばらくお待ちください。ほかのワークフローは一覧から利用できます。",
    backToList: "一覧へ戻る",
    inputDescription:
      "入力した内容は保存されず、この画面を離れると消去されます。",
    generate: "下書きを作成",
    generating: "作成しています…",
    stop: "停止",
    failed: "下書きを作成できませんでした。もう一度お試しください。",
    draftTitle: "下書き",
    draftSource: (count: number, from: string | null, to: string | null) =>
      from && to
        ? `診療記録 ${count}件（${from}〜${to}）から作成`
        : "この入院の診療記録はありません。メモから作成しました。",
    aiDraftBadge: "要確認・編集可能",
    draftReview:
      "内容を確認してご利用ください。",
    reset: "最初からやり直す",
    resetTitle: "最初からやり直しますか？",
    resetDescription: "入力した内容と下書きは消去されます。選んだ患者はそのままです。",
    resetConfirm: "やり直す",
    items: {
      "discharge-summary": {
        title: "退院サマリー作成",
        description: "入院中の診療記録とメモから、退院サマリーの下書きを作成します。",
        inputLabel: "補足メモ",
        inputPlaceholder:
          "例：診断名、入院時の状態、治療内容、退院時の状態、退院後の方針など",
      },
      "referral-letter": {
        title: "診療情報提供書作成",
        description: "紹介先の医療機関へ送る、診療情報提供書の下書きを作成します。",
        inputLabel: "紹介内容のメモ",
        inputPlaceholder: "例：紹介先、紹介の目的、現病歴、検査結果、処方内容など",
      },
      "note-summary": {
        title: "診療記録の要約",
        description: "長い診療記録を、要点がわかる短い要約にまとめます。",
        inputLabel: "要約したい診療記録",
        inputPlaceholder: "例：経過記録、看護記録など",
      },
      "manual-search": {
        title: "院内マニュアル検索",
        description: "院内の手順書やマニュアルから、必要な情報を探します。",
      },
    },
  },
  notFound: {
    title: "ページが見つかりません",
    description: "URLが正しいかご確認ください。",
    back: "AIチャットへ戻る",
  },
  common: {
    close: "閉じる",
    cancel: "キャンセル",
  },
  durationSeconds: (seconds: number) => `${seconds}秒`,
  duration: (hours: number, minutes: number) =>
    hours > 0
      ? `${hours}時間${minutes > 0 ? `${minutes}分` : ""}`
      : `${minutes}分`,
} as const;
