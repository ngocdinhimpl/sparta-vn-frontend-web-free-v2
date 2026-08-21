import React from 'react';
import { useTranslation } from '@/i18n';
import logo from '@/assets/logo/logo.png';

interface TermsOfUseProps {
  onAgree: () => void;
  onBack: () => void;
}

const TERMS_EN = `--- TERMS OF USE ---

These Terms of Use (hereinafter referred to as the "Terms") stipulate the conditions of use for the Vietnamese learning app "Sparta! Pronunciation ☆ Vietnamese" (https://sparta.vietnam-it-yorozuya.com/ hereinafter referred to as the "Service") provided by Alobridge Co., Ltd. (hereinafter referred to as "We" or "Us"). All users (hereinafter referred to as "Users") must agree to these Terms before using the Service.

Article 1 (Application and Consent)
1. These Terms apply to all relationships concerning the use of the Service between the User and Us.
2. By registering an account or starting to use the Service, the User is deemed to have agreed to all provisions of these Terms.

Article 2 (Purpose of the Service)
The Service is a learning support service that provides an environment for practicing and evaluating Vietnamese pronunciation based on speech recognition and AI technology.

Article 3 (Account Registration and Management)
1. When using the Service, the User must accurately provide the information designated by Us, such as a name (nickname allowed) and a valid email address.
2. The User shall strictly manage and store their account information (login ID, password, etc.) under their own responsibility.
3. Any actions taken using the User's account shall be deemed to be the actions of the User themselves. We shall not bear any responsibility for any damages caused by improper management of the account or unauthorized use by a third party.
4. The User may choose to synchronize learning data (scores, progress, etc.) on their device to the cloud storage system.

Article 4 (Handling of Voice Data and Usage Data)
1. Collection, Processing, and Use of Voice Data:
   When using features such as "Record" of the Service, the app collects the User's voice data and uploads it to storage servers and AI/API analysis systems. The User agrees to the collection, storage, and analysis of voice data, as well as its use for the purpose of improving service quality and improving/training AI accuracy.
2. Analytics and Tracking:
   For the purpose of compiling statistical data and improving the Service, the Service collects anonymous data (access logs, usage time, session information, etc.) regarding the User's usage status through analysis tools.
3. Feedback Data:
   Feedback submitted via features like "Feedback" is recorded and collected anonymously. We do not store personally identifiable information (User ID, etc.) along with the feedback content.

Article 5 (Intellectual Property Rights)
Copyrights and other intellectual property rights concerning all texts, images, audio, programs, designs, and any other content constituting the Service belong to Us or third parties with legitimate rights.

Article 6 (Prohibited Actions)
The User shall not engage in the following actions when using the Service:
1. Illegal acts, acts against public order and morals, or acts of recording, uploading, or transmitting content intended for harassment, discrimination, or slander.
2. Unauthorized access, acts that place an excessive load, destructive acts, or obstructive acts against the servers, databases, networks, etc., of the Service.
3. Reverse engineering, analysis, copying, or modification of the Service.
4. Impersonating a third party, or transferring or lending the account to a third party.
5. Other acts that We deem inappropriate.

Article 7 (Service Provision Format and Complete Disclaimer)
1. We make no guarantees whatsoever, express or implied, regarding the accuracy, completeness, usefulness, fitness for a particular purpose, safety, etc., of the Service.
2. We bear no responsibility for any damages (direct, indirect, special, lost profits, etc.) incurred by the User or a third party due to the use or inability to use the Service (including data loss, system outages, AI analysis errors, etc.).

Article 8 (Individual Response and Non-involvement in Disputes)
1. Regarding the Service, We do not bear the obligation to provide individual support, fix defects, answer inquiries, or respond to requests from Users.
2. We shall not be involved in, and bear no obligation to respond to, any disputes or troubles that arise between the User and a third party (including other Users, API providers, etc.) in relation to the Service.`;

const TERMS_JA = `--- 利用規約 ---

本利用規約（以下「本規約」といいます。）はAlobridge Co., Ltd.（以下「当方」といいます。）が提供するベトナム語学習アプリ「スパルタ！発音☆ベトナム語」（https://sparta.vietnam-it-yorozuya.com/ 以下「本サービス」といいます。）の利用条件を定めるものです。ユーザーの皆様（以下「ユーザー」といいます。）は、本規約に同意の上、本サービスをご利用ください。
 
第1条（適用および同意）
1. 本規約は、ユーザーと当方との間の本サービスの利用に関わる一切の関係に適用されます。
2. ユーザーは、アカウント登録または本サービスの利用を開始することにより、本規約の全ての記載内容に同意したものとみなされます。
 
第2条（サービスの目的）
本サービスは、音声認識およびAI技術に基づき、ベトナム語の発音練習および評価を行う環境を提供する学習支援サービスです。
 
第3条（アカウント登録および管理）
1. ユーザーは、本サービスの利用にあたり、名前（ニックネーム可）および有効なメールアドレス等、当方の指定する情報を正確に提供する必要があります。
2. ユーザーは、自己の責任において、アカウント情報（ログインID、パスワード等）を厳重に管理・保管するものとします。
3. ユーザーのアカウントを利用して行われた一切の行為は、当該ユーザー本人による行為とみなします。アカウントの不適切な管理や第三者の不正使用等により生じた損害について、当方は一切の責任を負いません。
4. ユーザーは、端末内の学習データ（スコア、進捗状況等）をクラウドストレージシステムへ同期することを選択できます。
 
第4条（音声データおよび利用データの取扱い）
1. 音声データの収集・処理・利用：
   本サービスの「Record（録音）」機能等を使用する際、本アプリはユーザーの音声データを収集し、ストレージサーバーおよびAI/API解析システムへアップロードします。ユーザーは、音声データの収集、保存、解析、ならびに本サービスの品質向上やAI精度の改善・学習を目的とした利用に同意するものとします。
2. アナリティクスおよびトラッキング：
   本サービスは、統計データの作成およびサービス向上を目的として、分析ツール等を通じ、ユーザーの利用状況に関する匿名データ（アクセスログ、利用時間、セッション情報等）を収集します。
3. フィードバックデータ：
   「ご意見箱（Feedback）」機能等で送信されたフィードバック内容は匿名で記録・収集されます。当方は、フィードバック内容と併せて個人を特定できる情報（ユーザーID等）を保存することはありません。
 
第5条（知的財産権）
本サービスを構成するテキスト、画像、音声、プログラム、デザインその他一切のコンテンツに関する著作権その他の知的財産権は、当方または正当な権利を有する第三者に帰属します。
 
第6条（禁止事項）
ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
1. 違法行為、公序良俗に反する行為、または嫌がらせ・差別・誹謗中傷を目的としたコンテンツの録音・アップロード・送信行為
2. 本サービスのサーバー、データベース、ネットワーク等に対する不正アクセス、過度な負荷をかける行為、破壊行為、または妨害行為
3. 本サービスのリバースエンジニアリング、解析、複写、改変行為
4. 第三者になりすます行為、またはアカウントを第三者に譲渡・貸与する行為
5. その他、当方が不適切と判断する行為
 
第7条（本サービスの提供形態および完全免責）
1. 本サービスについて、当方はその正確性、完全性、有用性、特定目的への適合性、安全性等について、明示・黙示を問わず一切保証いたしません。
2. 本サービスの利用、または利用不能（データ消失、システム停止、AI解析の誤り等を含む）によってユーザーまたは第三者に生じた一切の損害（直接損害、間接損害、特別損害、逸失利益等）について、当方はいかなる責任を負いません。
 
第8条（個別対応および紛争への不関与）
1. 本サービスについて、当方はユーザーに対する個別のサポート、不具合修正、お問い合わせへの回答、または要望への対応義務を負わないものとします。
2. 本サービスに関してユーザーと第三者（他のユーザー、API提供者等を含みます）との間で生じた紛争やトラブルについて、当方は関与せず、対応義務を負いません。`;

const TermsOfUse: React.FC<TermsOfUseProps> = ({ onAgree, onBack }) => {
  const { language } = useTranslation();
  
  const content = language === 'ja' ? TERMS_JA : TERMS_EN;
  const agreeText = language === 'ja' ? '同意して進む' : 'Agree and Continue';
  const declineText = language === 'ja' ? 'キャンセル' : 'Cancel';
  const titleText = language === 'ja' ? '利用規約' : 'Terms of Use';

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col items-center p-8 animate-in fade-in duration-500 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-2xl w-full flex flex-col h-full relative z-10 pt-10 pb-6">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 shrink-0">
          <img src={logo} alt="Sparta Logo" className="w-16 h-16 object-contain mb-4 shadow-xl shadow-red-100 rounded-2xl transform -rotate-3" />
          <h1 className="text-2xl font-black text-slate-900">{titleText}</h1>
        </div>

        {/* Content Section */}
        <div className="flex-1 bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-y-auto mb-8">
          <pre className="whitespace-pre-wrap font-medium text-slate-600 text-sm leading-relaxed font-sans">
            {content}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 flex gap-4">
          <button 
            onClick={onBack}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold transition-colors hover:bg-slate-200 active:scale-[0.98]"
          >
            {declineText}
          </button>
          <button 
            onClick={onAgree}
            className="flex-[2] py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-red-200 hover:bg-red-600 active:scale-[0.98] transition-all"
          >
            {agreeText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
