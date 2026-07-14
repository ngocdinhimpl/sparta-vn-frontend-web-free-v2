import React from 'react';
import { useTranslation } from '@/i18n';
import logo from '@/assets/logo/logo.png';

interface TermsOfUseProps {
  onAgree: () => void;
  onBack: () => void;
}

const TERMS_EN = `--- TERMS OF USE ---

1. Purpose of the Service
This application provides an environment for practicing and evaluating Vietnamese pronunciation based on voice recognition technology.

2. Account Registration
- Users must provide a valid Name (Full Name) and Email Address to register an account.
- Users are responsible for keeping their login information and passwords secure.
- Upon registration, users may choose to synchronize their learning data (scores, progress) from their local device to the cloud storage system.

3. Collection and Processing of Voice Data
- The core of the service is the voice recording and pronunciation analysis feature. When using the "Record" feature, the application will collect your voice data.
- This audio file will be uploaded to storage servers (Google Drive, Azure) so that the AI/API system can analyze and score its accuracy. By using this feature, the user consents to the storage and processing of their voice data.

4. Collection of Usage Data (Analytics & Tracking)
- The application uses Google/Firebase Analytics to collect anonymous metrics (usage time, number of sessions, number of "training_start" practice clicks) for the purpose of statistics and improving service quality.

5. Feedback System
- When using the "Suggestion Box / 問い合わせ" feature, the content of the user's feedback will be recorded.
- Feedback data is collected ANONYMOUSLY. The system commits to not storing identifying information (User ID) along with the feedback content.

6. Disclaimer
- The AI pronunciation scoring system is for reference and learning support only, and does not guarantee 100% absolute accuracy compared to native speakers.
- The service may undergo maintenance, interruption, or feature changes (due to being in the Beta stage) without prior notice.

7. Prohibited Actions
- It is strictly prohibited to use the recording feature to upload content that is illegal, obscene, or harassing.
- Attacks or sabotage against the application's servers and database are strictly prohibited.`;

const TERMS_JA = `--- 利用規約 ---

1. サービスの目的
本アプリケーションは、音声認識技術に基づき、ベトナム語の発音練習および評価を行う環境を提供します。

2. アカウント登録
- ユーザーは、アカウント登録のために有効な氏名（Full Name）およびメールアドレスを提供する必要があります。
- ユーザーは、自身のログイン情報およびパスワードを安全に管理する責任を負います。
- 登録時、ユーザーはローカル端末の学習データ（スコア、進捗状況）をクラウドストレージシステムへ同期することを選択できます。

3. 音声データの収集および処理
- 本サービスの中核は、録音および発音分析機能です。「Record（録音）」機能を使用する際、本アプリケーションはユーザーの音声データを収集します。
- この音声ファイルは、AI/APIシステムが精度を分析および採点するために、ストレージサーバー（Google Drive、Azure等）にアップロードされます。本機能を使用することにより、ユーザーは音声データの保存および処理に同意するものとします。

4. 利用データの収集（アナリティクスおよびトラッキング）
- 本アプリケーションは、統計の作成およびサービス品質の向上のため、Google/Firebase Analyticsを使用して匿名データ（利用時間、セッション数、「training_start」のクリック数等）を収集します。

5. フィードバックシステム
- 「ご意見箱（Feedback）」機能を使用する際、ユーザーのフィードバック内容が記録されます。
- フィードバックデータは【匿名（Anonymous）】で収集され、システムはフィードバック内容とともに個人を特定できる情報（ユーザーID等）を保存しないことをお約束します。

6. 免責事項
- AIによる発音採点システムは、あくまで参考および学習支援を目的としたものであり、ネイティブスピーカーと比較して100%の絶対的な正確性を保証するものではありません。
- 本サービスは、ベータ（Beta）版であるため、事前の予告なくメンテナンス、中断、または機能の変更が行われる場合があります。

7. 禁止事項
- 違法、わいせつ、または嫌がらせ目的のコンテンツをアップロードするために録音機能を使用することを固く禁じます。
- 本アプリケーションのサーバーおよびデータベースに対する攻撃、破壊行為を固く禁じます。`;

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
