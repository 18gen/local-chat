import type { Patient } from "@/features/patient/types";

// Fictional data only; never real patients. Includes namesakes and two
// names with the same reading, to try the safety cues.

type MockPatient = Omit<Patient, "hasNamesake">;

const inpatient = (ward: string, room: string) => ({ ward, room });

const PATIENTS: MockPatient[] = [
  { id: "00012345", name: "佐藤 健一", kana: "サトウ ケンイチ", birthDate: "1948-03-02", gender: "male", department: "呼吸器内科", admission: inpatient("5階東", "501") },
  { id: "00098765", name: "佐藤 健一", kana: "サトウ ケンイチ", birthDate: "1971-11-20", gender: "male", department: "内科", admission: null },
  { id: "00023456", name: "鈴木 花子", kana: "スズキ ハナコ", birthDate: "1952-07-14", gender: "female", department: "循環器内科", admission: inpatient("6階西", "612") },
  { id: "00290123", name: "鈴木 花子", kana: "スズキ ハナコ", birthDate: "1987-12-15", gender: "female", department: "内科", admission: null },
  { id: "00289012", name: "鈴木 一郎", kana: "スズキ イチロウ", birthDate: "1945-04-29", gender: "male", department: "内科", admission: inpatient("4階東", "408") },
  { id: "00034567", name: "高橋 誠", kana: "タカハシ マコト", birthDate: "1939-01-25", gender: "male", department: "消化器内科", admission: inpatient("4階東", "403") },
  { id: "00045678", name: "田中 美咲", kana: "タナカ ミサキ", birthDate: "1990-05-09", gender: "female", department: "産婦人科", admission: inpatient("3階西", "305") },
  { id: "00056789", name: "伊藤 博", kana: "イトウ ヒロシ", birthDate: "1944-09-30", gender: "male", department: "整形外科", admission: inpatient("7階東", "708") },
  { id: "00067890", name: "渡辺 恵子", kana: "ワタナベ ケイコ", birthDate: "1958-12-03", gender: "female", department: "内科", admission: null },
  { id: "00078901", name: "斉藤 美穂", kana: "サイトウ ミホ", birthDate: "1966-04-18", gender: "female", department: "外科", admission: inpatient("5階西", "520") },
  { id: "00089012", name: "齋藤 美保", kana: "サイトウ ミホ", birthDate: "1983-08-27", gender: "female", department: "皮膚科", admission: null },
  { id: "00090123", name: "小林 大輔", kana: "コバヤシ ダイスケ", birthDate: "1975-02-11", gender: "male", department: "脳神経外科", admission: inpatient("8階東", "801") },
  { id: "00101234", name: "加藤 和子", kana: "カトウ カズコ", birthDate: "1936-06-06", gender: "female", department: "脳神経内科", admission: inpatient("6階東", "605") },
  { id: "00112345", name: "吉田 翔太", kana: "ヨシダ ショウタ", birthDate: "2016-10-22", gender: "male", department: "小児科", admission: inpatient("2階東", "203") },
  { id: "00123456", name: "山本 直樹", kana: "ヤマモト ナオキ", birthDate: "1962-03-15", gender: "male", department: "泌尿器科", admission: null },
  { id: "00134567", name: "中村 由美", kana: "ナカムラ ユミ", birthDate: "1949-11-08", gender: "female", department: "呼吸器内科", admission: inpatient("5階東", "507") },
  { id: "00145678", name: "小川 清", kana: "オガワ キヨシ", birthDate: "1941-07-19", gender: "male", department: "循環器内科", admission: inpatient("6階西", "615") },
  { id: "00156789", name: "松本 幸子", kana: "マツモト サチコ", birthDate: "1955-01-30", gender: "female", department: "消化器内科", admission: null },
  { id: "00167890", name: "井上 拓也", kana: "イノウエ タクヤ", birthDate: "1987-09-03", gender: "male", department: "整形外科", admission: null },
  { id: "00178901", name: "木村 春香", kana: "キムラ ハルカ", birthDate: "1998-04-01", gender: "female", department: "内科", admission: null },
  { id: "00189012", name: "林 正雄", kana: "ハヤシ マサオ", birthDate: "1933-12-24", gender: "male", department: "内科", admission: inpatient("4階西", "410") },
  { id: "00190123", name: "清水 智子", kana: "シミズ トモコ", birthDate: "1968-06-12", gender: "female", department: "乳腺外科", admission: inpatient("5階西", "512") },
  { id: "00201234", name: "山口 健", kana: "ヤマグチ ケン", birthDate: "1979-08-08", gender: "male", department: "外科", admission: inpatient("5階西", "516") },
  { id: "00212345", name: "森 久美子", kana: "モリ クミコ", birthDate: "1946-02-28", gender: "female", department: "脳神経内科", admission: null },
  { id: "00223456", name: "池田 勇", kana: "イケダ イサム", birthDate: "1950-10-10", gender: "male", department: "腎臓内科", admission: inpatient("4階西", "402") },
  { id: "00234567", name: "橋本 さくら", kana: "ハシモト サクラ", birthDate: "2020-03-20", gender: "female", department: "小児科", admission: null },
  { id: "00245678", name: "阿部 隆", kana: "アベ タカシ", birthDate: "1960-05-05", gender: "male", department: "眼科", admission: null },
  { id: "00256789", name: "石川 洋子", kana: "イシカワ ヨウコ", birthDate: "1943-09-09", gender: "female", department: "整形外科", admission: inpatient("7階東", "712") },
  { id: "00267890", name: "前田 修", kana: "マエダ オサム", birthDate: "1957-11-11", gender: "male", department: "呼吸器内科", admission: null },
  { id: "00278901", name: "藤田 恵", kana: "フジタ メグミ", birthDate: "1985-07-07", gender: "female", department: "産婦人科", admission: null },
];

export const MOCK_PATIENTS: readonly Patient[] = PATIENTS.map((patient) => ({
  ...patient,
  hasNamesake: PATIENTS.some(
    (other) => other !== patient && other.name === patient.name,
  ),
}));
