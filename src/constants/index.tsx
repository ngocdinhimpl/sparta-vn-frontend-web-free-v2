import React from 'react';
import { SoundAnalysis, Stat } from '../types';
import { AvatarMood } from '@/services/api';

// Using the provided character image asset
export const COACH_AVATAR = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';

export const VOCAB_WORD_DATA = [
  { id: 'wt1-1', vi: 'Đắt', jp: '値段が高い', en: 'Expensive', type: 'word' as const, stage: 1 },
  { id: 'wt1-2', vi: 'Rẻ', jp: '値段が安い', en: 'Cheap', type: 'word' as const, stage: 1 },
  { id: 'wt1-3', vi: 'Đẹp', jp: 'きれい・美しい', en: 'Beautiful', type: 'word' as const, stage: 1 },
  { id: 'wt1-4', vi: 'Xấu', jp: '汚い／悪い', en: 'Ugly / Bad', type: 'word' as const, stage: 1 },
  { id: 'wt1-5', vi: 'Khỏe', jp: '元気', en: 'Healthy / Fine', type: 'word' as const, stage: 1 },
  { id: 'wt1-6', vi: 'Mệt', jp: '疲れる', en: 'Tired', type: 'word' as const, stage: 1 },
  { id: 'wt1-7', vi: 'Đói', jp: 'お腹が空いた', en: 'Hungry', type: 'word' as const, stage: 1 },
  { id: 'wt1-8', vi: 'No', jp: 'お腹いっぱい', en: 'Full', type: 'word' as const, stage: 1 },
  { id: 'wt1-9', vi: 'Nóng', jp: '暑い', en: 'Hot', type: 'word' as const, stage: 1 },
  { id: 'wt1-10', vi: 'Lạnh', jp: '寒い／冷たい', en: 'Cold', type: 'word' as const, stage: 1 },
  { id: 'wt1-11', vi: 'Cay', jp: '辛い', en: 'Spicy', type: 'word' as const, stage: 1 },
  { id: 'wt1-12', vi: 'Ngon', jp: '美味しい', en: 'Delicious', type: 'word' as const, stage: 1 },
  { id: 'wt1-13', vi: 'Dở tệ', jp: 'まずい', en: 'Awful / Bad tasting', type: 'word' as const, stage: 1 },
  { id: 'wt1-14', vi: 'Món ăn', jp: '料理', en: 'Dish / Food', type: 'word' as const, stage: 1 },
  { id: 'wt1-15', vi: 'Ăn', jp: '食べる', en: 'Eat', type: 'word' as const, stage: 1 },
  { id: 'wt1-16', vi: 'Uống', jp: '飲む', en: 'Drink', type: 'word' as const, stage: 1 },
  { id: 'wt1-17', vi: 'Tiền', jp: 'お金', en: 'Money', type: 'word' as const, stage: 1 },
  { id: 'wt1-18', vi: 'Xe máy', jp: 'バイク', en: 'Motorbike', type: 'word' as const, stage: 1 },
  { id: 'wt1-19', vi: 'Đi', jp: '行く', en: 'Go', type: 'word' as const, stage: 1 },
  { id: 'wt1-20', vi: 'Ngủ', jp: '寝る', en: 'Sleep', type: 'word' as const, stage: 1 },
  { id: 'wt2-1', vi: 'Xịn xò', jp: '超いい', en: 'Awesome / Fancy', type: 'word' as const, stage: 2 },
  { id: 'wt2-2', vi: 'Kệ', jp: 'まあいい', en: 'Whatever / Let it be', type: 'word' as const, stage: 2 },
  { id: 'wt2-3', vi: 'Toang', jp: '詰んだ', en: 'Ruined / Done for', type: 'word' as const, stage: 2 },
  { id: 'wt2-4', vi: 'Mượt', jp: 'スムーズ', en: 'Smooth', type: 'word' as const, stage: 2 },
  { id: 'wt2-5', vi: 'Đỉnh', jp: '最高', en: 'Peak / Awesome', type: 'word' as const, stage: 2 },
  { id: 'wt2-6', vi: 'Dễ thương', jp: 'かわいい', en: 'Cute', type: 'word' as const, stage: 2 },
  { id: 'wt2-7', vi: 'Thời tiết', jp: '天気', en: 'Weather', type: 'word' as const, stage: 2 },
  { id: 'wt2-8', vi: 'Ví', jp: '財布', en: 'Wallet', type: 'word' as const, stage: 2 },
  { id: 'wt2-9', vi: 'Tắc đường', jp: '渋滞', en: 'Traffic jam', type: 'word' as const, stage: 2 },
  { id: 'wt2-10', vi: 'Ngầu', jp: 'かっこいい', en: 'Cool', type: 'word' as const, stage: 2 },
  { id: 'wt2-11', vi: 'Công ty', jp: '会社', en: 'Company', type: 'word' as const, stage: 2 },
  { id: 'wt2-12', vi: 'Điện thoại', jp: 'スマホ', en: 'Smartphone', type: 'word' as const, stage: 2 },
  { id: 'wt2-13', vi: 'Cà phê', jp: 'コーヒー', en: 'Coffee', type: 'word' as const, stage: 2 },
  { id: 'wt2-14', vi: 'Mưa', jp: '雨', en: 'Rain', type: 'word' as const, stage: 2 },
  { id: 'wt2-15', vi: 'Nắng', jp: '晴れ', en: 'Sunny / Sunshine', type: 'word' as const, stage: 2 },
  { id: 'wt2-16', vi: 'Xe buýt', jp: 'バス', en: 'Bus', type: 'word' as const, stage: 2 },
  { id: 'wt2-17', vi: 'Cảnh sát', jp: '警察', en: 'Police', type: 'word' as const, stage: 2 },
  { id: 'wt2-18', vi: 'Bệnh viện', jp: '病院', en: 'Hospital', type: 'word' as const, stage: 2 },
  { id: 'wt2-19', vi: 'Ghế', jp: '椅子', en: 'Chair', type: 'word' as const, stage: 2 },
  { id: 'wt2-20', vi: 'Trộm', jp: '泥棒', en: 'Thief / Robber', type: 'word' as const, stage: 2 },
];

export const VOCAB_PHRASE_DATA = [
  { id: 'pt1-1', vi: 'Xin chào', jp: 'こんにちは', en: 'Hello', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-2', vi: 'Cảm ơn', jp: 'ありがとう', en: 'Thank you', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-3', vi: 'Xin lỗi', jp: 'すみません', en: 'Excuse me / Sorry', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-4', vi: 'Tôi tên là Taro', jp: '私はタロウです', en: 'My name is Taro', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-5', vi: 'Tôi đến từ Nhật Bản', jp: '日本から来ました', en: 'I am from Japan', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-6', vi: 'Bạn tên là gì?', jp: 'お名前は？', en: 'What is your name?', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-7', vi: 'Tôi không hiểu', jp: 'わかりません', en: 'I do not understand', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-8', vi: 'Đây là cái gì?', jp: 'これは何ですか？', en: 'What is this?', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-9', vi: 'Trời ơi', jp: 'えっ、まじで？', en: 'Oh my gosh / Seriously?', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-10', vi: 'Ngon vãi', jp: 'めちゃうま～', en: 'So delicious!', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-11', vi: 'Cái này bao tiền?', jp: 'これいくらですか？', en: 'How much is this?', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-12', vi: 'Em ơi, tính tiền nhé', jp: 'お会計お願いします', en: 'Check, please', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-13', vi: 'Đắt quá, bớt chút đi!', jp: '高すぎる、ちょっとまけて!', en: 'Too expensive, give me a discount!', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-14', vi: 'Giúp tôi với', jp: '手伝ってください', en: 'Please help me', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-15', vi: 'Ghê ghê', jp: 'すごいな', en: 'Wow / Amazing', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-16', vi: 'Từ từ đã', jp: 'ちょっと待って', en: 'Wait a moment', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-17', vi: 'Văn Miếu ở đâu?', jp: '文廟はどこですか？', en: 'Where is the Temple of Literature?', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-18', vi: 'Mệt xỉu', jp: '疲れすぎる', en: 'Exhausted', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-19', vi: 'Giật cả mình', jp: 'びっくりした', en: 'I was startled', type: 'phrase' as const, stage: 1 },
  { id: 'pt1-20', vi: 'Không sao đâu', jp: '大丈夫', en: 'It\'s okay / No problem', type: 'phrase' as const, stage: 1 },
  { id: 'pt2-1', vi: 'Bạn ăn cơm chưa?', jp: 'ご飯食べた？', en: 'Have you eaten yet?', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-2', vi: 'Dạo này bạn có khỏe không?', jp: '最近元気ですか？', en: 'How have you been lately?', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-3', vi: 'Thời tiết hôm nay đẹp nhỉ', jp: '今日は天気いいね', en: 'The weather is nice today, isn\'t it?', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-4', vi: 'Tôi đến Việt Nam để làm việc', jp: '仕事でベトナムに来ました', en: 'I came to Vietnam for work', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-5', vi: 'Đói quá, mình đi ăn đi!', jp: 'お腹空いたからご飯行こう!', en: 'I\'m so hungry, let\'s go eat!', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-6', vi: 'Món này có cay không?', jp: 'これ辛いですか?', en: 'Is this dish spicy?', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-7', vi: 'Cho tôi một bát phở không rau mùi', jp: 'フォー１杯、パクチー抜きでください', en: 'One bowl of pho without cilantro, please', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-8', vi: 'Tôi làm mất ví rồi', jp: '財布をなくしちゃった', en: 'I lost my wallet', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-9', vi: 'Bạn bao nhiêu tuổi rồi?', jp: '何歳ですか？', en: 'How old are you?', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-10', vi: 'Bạn có thể chụp ảnh hộ tôi được không', jp: '写真を撮ってくれませんか', en: 'Could you take a photo for me?', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-11', vi: 'Cái này có nghĩa là gì?', jp: 'これはどういう意味ですか？', en: 'What does this mean?', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-12', vi: 'Tôi mới sang Việt Nam nên chưa quen lắm', jp: 'ベトナムに来たばかりなので、まだあまり慣れていない', en: 'I just arrived in Vietnam so I\'m not used to it yet', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-13', vi: 'Tôi sống ở Việt Nam được một năm rồi', jp: 'ベトナムに住んで1年になります', en: 'I have been living in Vietnam for one year', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-14', vi: 'Nhà vệ sinh ở đâu vậy?', jp: 'トイレはどこですか？', en: 'Where is the restroom?', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-15', vi: 'Cuối tuần bạn rảnh không?', jp: '今週末空いてる？', en: 'Are you free this weekend?', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-16', vi: 'Tôi đang cố nói tiếng Việt, sai thì đừng cười nha', jp: 'ベトナム語を頑張って話してるので、間違っても笑わないでね', en: 'I\'m trying to speak Vietnamese, please don\'t laugh if I make mistakes', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-17', vi: 'Tôi đang cố sống sót qua mùa hè ở Việt Nam', jp: 'ベトナムの夏をなんとか生き延びています', en: 'I\'m trying to survive the summer in Vietnam', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-18', vi: 'Cứ tắc đường kiểu này chắc tôi già đi thêm mấy tuổi', jp: 'この渋滞で何歳か年を取った気がする', en: 'With traffic jams like this, I feel like I\'ve aged a few years', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-19', vi: 'Tôi không lười, chỉ đang tiết kiệm năng lượng thôi', jp: '怠けてるんじゃない、エネルギー節約中です', en: 'I\'m not lazy, I\'m just saving energy', type: 'phrase' as const, stage: 2 },
  { id: 'pt2-20', vi: 'Mua cái này xong chắc phải ăn mì gói cả tuần', jp: 'これ買ったら一週間インスタント麺生活だな', en: 'After buying this, I\'ll probably have to eat instant noodles for a week', type: 'phrase' as const, stage: 2 },
];

// Combined for backward compatibility
export const VOCAB_DATA = [...VOCAB_WORD_DATA, ...VOCAB_PHRASE_DATA];

export const HISTORY_DATA = [
  { id: '1', title: 'Xin chào mọi người', type: 'Pronunciation', time: '2 mins ago', score: '100%', stars: 3, iconType: 'pronunciation' },
  { id: '2', title: 'Tôi là người Nhật', type: 'Tone Practice', time: '1 hour ago', score: '85%', stars: 2, iconType: 'tone' },
  { id: '3', title: 'Cảm ơn rất nhiều', type: 'Vocabulary', time: 'Yesterday', score: '95%', stars: 3, iconType: 'vocabulary' },
  { id: '4', title: 'Bạn tên là gì?', type: 'Listening', time: '2 days ago', score: '72%', stars: 1, iconType: 'listening' },
  { id: '5', title: 'Hẹn gặp lại', type: 'Pronunciation', time: '3 days ago', score: '100%', stars: 3, iconType: 'pronunciation' },
];

export const SOUNDS_DATA: SoundAnalysis[] = [
  {
    id: '1',
    name: 'Unrounded vowel',
    description: "Frequently confused with 'o'",
    accuracy: 62,
    icon: 'ơ',
    color: 'text-orange-500 bg-orange-50'
  },
  {
    id: '2',
    name: 'Close back unrounded',
    description: 'Muffled pronunciation',
    accuracy: 48,
    icon: 'ư',
    color: 'text-red-500 bg-red-50'
  },
  {
    id: '3',
    name: 'Velar Nasal',
    description: 'Final consonant issues',
    accuracy: 74,
    icon: 'ng',
    color: 'text-blue-500 bg-blue-50'
  }
];

export const STATS_DATA: Stat[] = [
  { label: 'SESSIONS', value: '85', unit: '%', colorClass: 'text-red-500' },
  { label: 'DAYS', value: '12', icon: '🔥', colorClass: 'text-orange-500' },
  { label: 'ACTIVE', value: '45', unit: 'm', colorClass: 'text-slate-800' }
];

export const Icons = {
  Bell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
  ),
  Message: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Book: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 6h10"/><path d="M8 10h10"/><path d="M8 14h10"/></svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  ),
  Globe: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  ),
  Moon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  ),
  Login: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
  ),
  Trophy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
  ),
  Headphones: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
  ),
  Voice: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
  ),
  MicFloating: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
  ),
  Email: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><rect width="20" height="16" x="2" y="4" rx="2"/></svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Eye: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  EyeOff: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  )
};

// Avatar Set Metadata
export interface AvatarSet {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_AVATARS: AvatarSet[] = [
  { id: 'avatar1', name: 'ケンジ', description: '20歳・男性' },
  { id: 'avatar2', name: 'ハナ', description: '20歳・女性' },
  { id: 'avatar3', name: 'サクラ', description: '30歳・男性' },
  { id: 'avatar4', name: 'ミナミ', description: '30歳・女性' },
  { id: 'avatar5', name: 'コウジ', description: '40歳・男性' },
  { id: 'avatar6', name: 'アイコ', description: '40歳・女性' },
  { id: 'avatar7', name: 'シゲル', description: '70歳・男性' },
  { id: 'avatar8', name: 'ヨシコ', description: '70歳・女性' },
];

const avatarImages = import.meta.glob<{ default: string }>(
  '../assets/avatar/**/*.png',
  { eager: true }
);

export const getCoachAvatar = (avatarId: string = 'avatar1') => {
  // Try to get exactly neutral_0.png, or fallback to any neutral image for the avatar
  const exactKey = `../assets/avatar/${avatarId}/neutral/neutral_0.png`;
  if (avatarImages[exactKey]) {
    return avatarImages[exactKey].default;
  }
  // Fallback
  const prefix = `../assets/avatar/${avatarId}/neutral/`;
  const fallback = Object.keys(avatarImages).find(path => path.startsWith(prefix));
  return fallback ? avatarImages[fallback].default : '';
};

export const getAvatarTransitions = (avatarId: string = 'avatar1'): Record<AvatarMood, Partial<Record<AvatarMood, any[]>>> => {
  const getImages = (dir: string, prefix: string) => {
    const fullPrefix = `../assets/avatar/${avatarId}/${dir}/${prefix}`;
    return Object.keys(avatarImages)
      .filter((path) => path.startsWith(fullPrefix))
      .sort()
      .map((path) => avatarImages[path].default);
  };

  return {
    angry: {
      angry: getImages('angry', 'angry_0'),
      neutral: getImages('angry', 'angry_to_neutral'),
      happy: getImages('happy', 'angry_to_happy'),
    },
    neutral: {
      neutral: getImages('neutral', 'neutral_0'),
      happy: getImages('neutral', 'neutral_to_happy'),
      angry: getImages('angry', 'neutral_to_angry'),
    },
    happy: {
      happy: getImages('happy', 'happy_0'),
      neutral: getImages('neutral', 'happy_to_neutral'),
      angry: getImages('happy', 'happy_to_angry'),
    },
  };
};

/* ===================== DASHBOARD AVATARS ===================== */

// Load all 50 dashboard avatar images (avatar_000.png to avatar_049.png)
// Get dashboard avatars for a specific avatar set
export const getDashboardAvatarsForSet = (avatarId: string): string[] => {
  const prefix = `../assets/avatar/${avatarId}/dashboard/avatar_`;
  return Object.keys(avatarImages)
    .filter((path) => path.startsWith(prefix))
    .sort()
    .map((path) => avatarImages[path].default);
};

// Default dashboard avatars (avatar1)
export const DASHBOARD_AVATARS = getDashboardAvatarsForSet('avatar1');

// Get avatar images for a specific score tier (0-4 for tiers 1-5)
export const getDashboardAvatarTier = (tier: number): string[] => {
  const startIdx = tier * 10;
  return DASHBOARD_AVATARS.slice(startIdx, startIdx + 10);
};

// Get tier number based on score (0-100)
// Tier 0: 0-20, Tier 1: 21-40, Tier 2: 41-60, Tier 3: 61-80, Tier 4: 81-100
export const getScoreTier = (score: number): number => {
  if (score <= 20) return 0;
  if (score <= 40) return 1;
  if (score <= 60) return 2;
  if (score <= 80) return 3;
  return 4;
};

